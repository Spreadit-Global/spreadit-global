import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import test from 'node:test'

const source = fs.readFileSync(new URL('../google-apps-script/admin/Admin.gs', import.meta.url), 'utf8')
const managementName = '_SPREAD_Applicant_Management'
const idHeader = 'SPREAD Application ID'

class Sheet {
  constructor(rows, name = 'Form Responses 1', id = 178026769) { this.rows = structuredClone(rows); this.name = name; this.id = id }
  getName() { return this.name }
  getSheetId() { return this.id }
  getDataRange() { return this.getRange(1, 1, Math.max(this.rows.length, 1), Math.max(...this.rows.map(row => row.length), 1)) }
  getLastRow() { return this.rows.length }
  setFrozenRows() {}
  getRange(row, column, height = 1, width = 1) {
    return {
      getDisplayValues: () => Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => {
        const value = this.rows[row + y - 1]?.[column + x - 1] ?? ''
        return typeof value === 'boolean' ? String(value).toUpperCase() : String(value)
      })),
      setValue: value => this.getRange(row, column).setValues([[value]]),
      setValues: values => {
        values.forEach((valuesRow, y) => valuesRow.forEach((value, x) => {
          this.rows[row + y - 1] ??= []
          this.rows[row + y - 1][column + x - 1] = value
        }))
      },
    }
  }
}

function setup() {
  const responses = new Sheet([
    ['Timestamp', 'Full name', 'Email address', 'Current location', 'Target role', 'Resume (optional)', 'Extra question'],
    ['11/17/2026 09:00', 'Test Candidate', 'candidate@example.test', 'Dallas', 'Software Engineer', 'https://drive.google.com/file/d/test/view', '<img src=x onerror=alert(1)>'],
    ['11/17/2026 10:00', 'Second Candidate', 'second@example.test', 'New York', 'Data Engineer', '', 'Some notes'],
  ])
  const sheets = new Map([['Form Responses 1', responses]])
  let email = 'spreadittech@gmail.com'
  let effective = email
  let opens = 0
  let uuids = 0
  let locked = false
  const properties = { RESPONSE_SPREADSHEET_ID: 'test-sheet', RESPONSE_SHEET_NAME: 'Form Responses 1' }
  const context = vm.createContext({
    Session: { getActiveUser: () => ({ getEmail: () => email }), getEffectiveUser: () => ({ getEmail: () => effective }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: key => properties[key] }) },
    LockService: { getScriptLock: () => ({
      tryLock: () => { assert.equal(locked, false); locked = true; return true },
      releaseLock: () => { assert.equal(locked, true); locked = false },
    }) },
    Utilities: { getUuid: () => '00000000-0000-4000-8000-' + String(++uuids).padStart(12, '0') },
    SpreadsheetApp: {
      openById: id => {
        opens++
        assert.equal(id, properties.RESPONSE_SPREADSHEET_ID || '1F-IlBo8Gb84TpGWGjsK0WS3NC3N_vvoFPOenJ_i4HfI')
        return { getSheets: () => [...sheets.values()], getSheetByName: name => sheets.get(name), insertSheet: name => {
          const sheet = new Sheet([], name, 999); sheets.set(name, sheet); return sheet
        } }
      },
      flush: () => {},
    },
  })
  vm.runInContext(source, context)
  return {
    api: context, responses, sheets, properties,
    get opens() { return opens }, get locked() { return locked },
    identity: (active, executor = active) => { email = active; effective = executor },
  }
}

test('all reads and mutations reject anonymous, unapproved, and mismatched execution identities before spreadsheet access', () => {
  for (const [email, effective] of [['', ''], ['outsider@example.test', 'outsider@example.test'], ['hr@spreadglobal.us', 'spreadittech@gmail.com']]) {
    const fixture = setup(); fixture.identity(email, effective)
    for (const operation of [() => fixture.api.getApplicants(), () => fixture.api.updateApplicant({}), () => fixture.api.deleteApplicant({})]) {
      assert.throws(operation, /Access denied/)
    }
    assert.equal(fixture.opens, 0)
  }
})

test('each of the six approved Google accounts can access the dashboard', () => {
  for (const email of ['spreadittech@gmail.com', 'admin@spreadglobal.us', 'hr@spreadglobal.us', 'info@spreadglobal.us', 'manager@spreadglobal.us', 'recruitment@spreadglobal.us']) {
    const fixture = setup(); fixture.identity(email)
    assert.equal(fixture.api.getApplicants().email, email)
  }
})

test('loads every form field, preserves answer text, and gives existing responses stable IDs', () => {
  const fixture = setup()
  const first = fixture.api.getApplicants()
  assert.equal(first.applicants.length, 2)
  const person = first.applicants[1]
  assert.equal(person.stage, 'New application')
  assert.equal(person.version, 0)
  assert.equal(person.fields.find(field => field.label === 'Extra question').value, '<img src=x onerror=alert(1)>')
  assert.equal(person.fields.find(field => field.label === 'Resume (optional)').value, 'https://drive.google.com/file/d/test/view')
  assert.equal(person.fields.some(field => field.label === idHeader), false)
  assert.equal(fixture.responses.rows[0].at(-1), idHeader)
  assert.equal(fixture.api.getApplicants().applicants[1].id, person.id)
  assert.equal(fixture.locked, false)
})

test('stars and progress persist and a different admin can mark the same applicant placed', () => {
  const fixture = setup()
  const person = fixture.api.getApplicants().applicants[0]
  let updated = fixture.api.updateApplicant({ id: person.id, version: 0, starred: true, stage: 'Interview preparation' })
  assert.equal(updated.version, 1)
  fixture.identity('hr@spreadglobal.us')
  updated = fixture.api.updateApplicant({ id: person.id, version: 1, stage: 'Placed' })
  const saved = fixture.api.getApplicants().applicants.find(item => item.id === person.id)
  assert.equal(saved.stage, 'Placed')
  assert.equal(saved.starred, true)
  assert.equal(saved.updatedBy, 'hr@spreadglobal.us')
  assert.equal(saved.version, 2)
  assert.equal(Number.isNaN(Date.parse(saved.updatedAt)), false)
})

test('stale updates and deletions cannot overwrite another admin change', () => {
  const fixture = setup()
  const person = fixture.api.getApplicants().applicants[0]
  fixture.api.updateApplicant({ id: person.id, version: 0, stage: 'Offer received' })
  assert.throws(() => fixture.api.updateApplicant({ id: person.id, version: 0, starred: true }), /Another admin/)
  assert.throws(() => fixture.api.deleteApplicant({ id: person.id, version: 0 }), /Another admin/)
  assert.equal(fixture.api.getApplicants().applicants[0].stage, 'Offer received')
  assert.equal(fixture.locked, false)
})

test('removal hides the candidate persistently and leaves original form answers intact', () => {
  const fixture = setup()
  const people = fixture.api.getApplicants().applicants
  const original = structuredClone(fixture.responses.rows)
  fixture.api.deleteApplicant({ id: people[0].id, version: 0 })
  assert.equal(fixture.api.getApplicants().applicants.length, 1)
  assert.deepEqual(fixture.responses.rows, original)
  assert.throws(() => fixture.api.updateApplicant({ id: people[0].id, version: 1, stage: 'Placed' }), /removed/)
  const record = fixture.sheets.get(managementName).rows[1]
  assert.equal(record[3], true)
  assert.equal(record[5], 'spreadittech@gmail.com')
})

test('stable IDs target the correct applicant after sorting and recognize new responses', () => {
  const fixture = setup()
  const person = fixture.api.getApplicants().applicants[1]
  fixture.responses.rows.reverse()
  const headerIndex = fixture.responses.rows.findIndex(row => row[0] === 'Timestamp')
  fixture.responses.rows.unshift(...fixture.responses.rows.splice(headerIndex, 1))
  fixture.responses.rows.push(['11/17/2026 11:00', 'New Candidate', 'new@example.test', '', '', '', 'New answer'])
  fixture.api.updateApplicant({ id: person.id, version: 0, starred: true })
  const refreshed = fixture.api.getApplicants()
  assert.equal(refreshed.applicants.length, 3)
  const starred = refreshed.applicants.find(item => item.starred)
  assert.equal(starred.id, person.id)
  assert.equal(starred.fields.find(item => item.label === 'Full name').value, 'Test Candidate')
})

test('invalid changes are rejected without writing management data', () => {
  const fixture = setup()
  const person = fixture.api.getApplicants().applicants[0]
  for (const patch of [{ stage: '=IMPORTXML("https://example.test")' }, { starred: 'true' }, {}, { version: -1, stage: 'Placed' }, { id: 'bad-id', stage: 'Placed' }]) {
    assert.throws(() => fixture.api.updateApplicant({ id: person.id, version: 0, ...patch }), /Invalid|No change/)
  }
  assert.equal(fixture.sheets.get(managementName).rows.length, 1)
})

test('confirmed spreadsheet and numeric response-tab ID work without optional overrides', () => {
  const fixture = setup()
  delete fixture.properties.RESPONSE_SPREADSHEET_ID
  delete fixture.properties.RESPONSE_SHEET_NAME
  assert.equal(fixture.api.getApplicants().applicants.length, 2)
})

test('incorrect tab configuration fails closed', () => {
  const fixture = setup(); fixture.properties.RESPONSE_SHEET_NAME = 'Incorrect tab'
  assert.throws(() => fixture.api.getApplicants(), /not found/)
  assert.equal(fixture.locked, false)
  const invalid = setup(); delete invalid.properties.RESPONSE_SHEET_NAME; invalid.properties.RESPONSE_SHEET_ID = 'bad'
  assert.throws(() => invalid.api.getApplicants(), /invalid/)
  assert.equal(invalid.opens, 0)
  const missing = setup(); delete missing.properties.RESPONSE_SHEET_NAME; missing.properties.RESPONSE_SHEET_ID = '9999'
  assert.throws(() => missing.api.getApplicants(), /not found/)
})

test('duplicate IDs and altered management headers stop writes instead of targeting the wrong application', () => {
  const fixture = setup(); fixture.api.getApplicants()
  fixture.responses.rows[2][7] = fixture.responses.rows[1][7]
  assert.throws(() => fixture.api.getApplicants(), /Duplicate application IDs/)
  const second = setup(); second.api.getApplicants()
  second.sheets.get(managementName).rows[0][0] = 'Changed'
  assert.throws(() => second.api.getApplicants(), /headers have changed/)
})

test('dashboard client script parses and only the intended functions are remotely callable', () => {
  const html = fs.readFileSync(new URL('../google-apps-script/admin/Dashboard.html', import.meta.url), 'utf8')
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1]
  assert.doesNotThrow(() => new vm.Script(script))
  const publicFunctions = [...source.matchAll(/^function (\w+)\(/gm)].map(match => match[1]).filter(name => !name.endsWith('_'))
  assert.deepEqual(publicFunctions, ['doGet', 'getApplicants', 'updateApplicant', 'deleteApplicant'])
  assert.equal(html.includes('innerHTML'), false)
  const manifest = JSON.parse(fs.readFileSync(new URL('../google-apps-script/admin/appsscript.json', import.meta.url), 'utf8'))
  assert.equal(manifest.webapp.executeAs, 'USER_ACCESSING')
  assert.equal(manifest.webapp.access, 'ANYONE')
})
