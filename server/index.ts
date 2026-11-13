import { existsSync } from 'node:fs'
import { mkdir, unlink, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import express, { type ErrorRequestHandler } from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import multer from 'multer'
import ExcelJS from 'exceljs'

const app = express()
const port = Number(process.env.PORT ?? 8787)
const maxResumeBytes = 10 * 1024 * 1024
const dataDirectory = resolve('src/data')
const resumesDirectory = resolve('src/resumes')
const spreadsheetPath = join(dataDirectory, 'candidates.xlsx')
let storageReady = false
let workbookWriteQueue = Promise.resolve()

const columns: Array<{ header: string; key: string; width: number }> = [
  { header: 'Submitted At', key: 'submittedAt', width: 24 },
  { header: 'Name', key: 'name', width: 28 },
  { header: 'Phone', key: 'phone', width: 20 },
  { header: 'Email', key: 'email', width: 32 },
  { header: 'Current Location', key: 'location', width: 24 },
  { header: 'Experience / Status', key: 'status', width: 26 },
  { header: 'Target Role', key: 'role', width: 26 },
  { header: 'Pre-call Notes', key: 'notes', width: 48 },
  { header: 'Resume Filename', key: 'resumeName', width: 42 },
  { header: 'Resume Path', key: 'resumePath', width: 56 },
]

interface CandidateRecord {
  submittedAt: string
  name: string
  phone: string
  email: string
  location: string
  status: string
  role: string
  notes: string
  resumeName: string
  resumePath: string
}

async function ensureStorage(): Promise<void> {
  await Promise.all([mkdir(dataDirectory, { recursive: true }), mkdir(resumesDirectory, { recursive: true })])
  if (existsSync(spreadsheetPath)) {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(spreadsheetPath)
    if (workbook.worksheets.length !== 1 || workbook.worksheets[0]?.name !== 'Candidates') {
      throw new Error('src/data/candidates.xlsx must contain exactly one worksheet named Candidates.')
    }
  } else {
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'SPREAD GLOBAL'
    workbook.created = new Date()
    const worksheet = workbook.addWorksheet('Candidates')
    worksheet.columns = columns
    worksheet.views = [{ state: 'frozen', ySplit: 1 }]
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B2B52' } }
    await workbook.xlsx.writeFile(spreadsheetPath)
  }
  storageReady = true
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxResumeBytes, files: 1, fields: 12, fieldSize: 4000 },
  fileFilter: (_request, file, callback) => {
    if (/\.(pdf|doc|docx)$/i.test(file.originalname)) callback(null, true)
    else callback(new Error('Choose a PDF, DOC, or DOCX resume.'))
  },
})

const intakeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 12,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many submissions. Please try again later.' },
})

app.disable('x-powered-by')
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }))
app.use(express.json({ limit: '16kb' }))

app.get('/api/health', (_request, response) => {
  response.json({ ok: true, storageConfigured: storageReady })
})

app.post('/api/intake', intakeLimiter, upload.single('resume'), async (request, response) => {
  const name = readField(request.body?.name, 120)
  const phone = readField(request.body?.phone, 40)
  const email = readField(request.body?.email, 254).toLowerCase()
  const location = readField(request.body?.location, 160)
  const status = readField(request.body?.status, 80)
  const role = readField(request.body?.role, 120)
  const notes = readField(request.body?.notes, 2000)
  const resume = request.file

  if (!name || !phone || !isValidEmail(email) || !location || !status || !role) {
    response.status(400).json({ error: 'Complete all required candidate details.' })
    return
  }
  if (resume && resume.size > maxResumeBytes) {
    response.status(400).json({ error: 'Resume files must be 10 MB or smaller.' })
    return
  }
  if (!storageReady) {
    response.status(503).json({ error: 'Local candidate storage is unavailable. Please contact SPREAD GLOBAL directly.' })
    return
  }

  const extension = resume?.originalname.toLowerCase().match(/\.(pdf|doc|docx)$/)?.[0]
  if (resume && !extension) {
    response.status(400).json({ error: 'Choose a PDF, DOC, or DOCX resume.' })
    return
  }

  let savedResumePath = ''
  try {
    const resumeName = resume && extension
      ? await saveResume(name, location, role, extension, resume.buffer)
      : ''
    if (resumeName) savedResumePath = join(resumesDirectory, resumeName)
    const relativeResumePath = resumeName ? `src/resumes/${resumeName}` : ''
    await appendCandidate({
      submittedAt: new Date().toISOString(),
      name,
      phone,
      email,
      location,
      status,
      role,
      notes,
      resumeName,
      resumePath: relativeResumePath,
    })

    response.status(201).json({ ok: true, resumeName: resumeName || null, resumePath: relativeResumePath || null })
  } catch (error) {
    if (savedResumePath) await unlink(savedResumePath).catch(() => undefined)
    console.error('Candidate intake could not be saved.', error)
    response.status(500).json({ error: 'We could not save your details. Please try again or contact our team.' })
  }
})

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    response.status(400).json({ error: 'Resume files must be 10 MB or smaller.' })
    return
  }
  if (error instanceof Error && error.message === 'Choose a PDF, DOC, or DOCX resume.') {
    response.status(400).json({ error: error.message })
    return
  }
  console.error('API request failed.', error)
  response.status(500).json({ error: 'The request could not be processed.' })
}
app.use(errorHandler)

const distPath = resolve('dist')
if (existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get(/.*/, (_request, response) => response.sendFile(join(distPath, 'index.html')))
}

void ensureStorage()
  .then(() => {
    app.listen(port, '0.0.0.0', () => {
      console.info(`SPREAD GLOBAL API listening on http://127.0.0.1:${port}`)
      console.info(`Candidate workbook: ${spreadsheetPath}`)
      console.info(`Resume folder: ${resumesDirectory}`)
    })
  })
  .catch((error: unknown) => {
    console.error('Unable to initialize local candidate storage.', error)
    process.exitCode = 1
  })

function readField(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function toFilenameSegment(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 60) || 'candidate'
}

async function saveResume(
  name: string,
  location: string,
  role: string,
  extension: string,
  fileBuffer: Buffer,
): Promise<string> {
  const baseName = [name, location, role].map(toFilenameSegment).join('-')
  for (let suffix = 1; ; suffix += 1) {
    const resumeName = `${baseName}${suffix === 1 ? '' : `-${suffix}`}${extension}`
    const fullPath = join(resumesDirectory, resumeName)
    try {
      await writeFile(fullPath, fileBuffer, { flag: 'wx', mode: 0o600 })
      return resumeName
    } catch (error) {
      if (!isFileExistsError(error)) throw error
    }
  }
}

function appendCandidate(candidate: CandidateRecord): Promise<void> {
  const operation = workbookWriteQueue.then(async () => {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(spreadsheetPath)
    const worksheet = workbook.getWorksheet('Candidates')
    if (!worksheet || workbook.worksheets.length !== 1) {
      throw new Error('Candidate workbook must contain exactly one Candidates worksheet.')
    }
    worksheet.addRow([
      candidate.submittedAt,
      candidate.name,
      candidate.phone,
      candidate.email,
      candidate.location,
      candidate.status,
      candidate.role,
      candidate.notes,
      candidate.resumeName,
      candidate.resumePath,
    ])
    await workbook.xlsx.writeFile(spreadsheetPath)
  })
  workbookWriteQueue = operation.then(() => undefined, () => undefined)
  return operation
}

function isFileExistsError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'EEXIST'
}
