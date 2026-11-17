import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'

const app = express()
const port = Number(process.env.PORT ?? 8787)

app.disable('x-powered-by')
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }))
app.use(express.json({ limit: '16kb' }))

app.get('/api/health', (_request, response) => {
  response.json({ ok: true, storageConfigured: false })
})

app.post('/api/intake', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 12,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
}), (_request, response) => {
  response.status(503).json({
    error: 'Google Sheets and Drive are not connected yet. Nothing was saved. Please contact SPREAD GLOBAL directly.',
  })
})

const distPath = resolve('dist')
if (existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get(/.*/, (_request, response) => response.sendFile(join(distPath, 'index.html')))
}

app.listen(port, '0.0.0.0', () => {
  console.info(`SPREAD GLOBAL preview server listening on http://127.0.0.1:${port}`)
  console.info('Candidate data persistence is disabled until Google Sheets and Drive are configured.')
})
