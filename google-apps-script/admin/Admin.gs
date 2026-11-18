// Deploy as a SEPARATE Apps Script project, executing as the user accessing it.
// Confirmed response resources are defaults; optional overrides are in the README.
// No credentials belong here.
const ADMIN_STAGES = [
  'New application', 'Resume review', 'LinkedIn optimization', 'Interview preparation',
  'Applying', 'Interviewing', 'Offer received', 'Placed', 'On hold',
];
const APPLICATION_ID_HEADER = 'SPREAD Application ID';
const DEFAULT_RESPONSE_SPREADSHEET_ID = '1F-IlBo8Gb84TpGWGjsK0WS3NC3N_vvoFPOenJ_i4HfI';
const DEFAULT_RESPONSE_SHEET_ID = 178026769;
const ADMIN_EMAILS = [
  'spreadittech@gmail.com', 'admin@spreadglobal.us', 'hr@spreadglobal.us',
  'info@spreadglobal.us', 'manager@spreadglobal.us', 'recruitment@spreadglobal.us',
];
const MANAGEMENT_SHEET = '_SPREAD_Applicant_Management';
const MANAGEMENT_HEADERS = ['Application ID', 'Stage', 'Starred', 'Deleted', 'Updated at', 'Updated by', 'Version'];

function doGet() {
  try {
    requireAdmin_();
    return HtmlService.createHtmlOutputFromFile('Dashboard')
      .setTitle('Dashboard | SPREAD GLOBAL')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (error) {
    console.error(error);
    return HtmlService.createHtmlOutput('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="font:16px system-ui;padding:48px;max-width:600px"><h1>Admin access unavailable</h1><p>Use an approved Google account. If you still cannot access the dashboard, ask the site administrator to check your access and dashboard configuration.</p></body></html>')
      .setTitle('Admin access | SPREAD GLOBAL');
  }
}

function getApplicants() {
  const admin = requireAdmin_();
  return withAdminLock_(() => {
    const { responses, management } = openAdminSheets_();
    const responseData = loadResponseData_(responses);
    const records = loadManagement_(management);
    const applicants = responseData.rows.map((row) => {
      const id = row[responseData.idIndex];
      const record = records.get(id);
      if (record && record.deleted) return null;
      return {
        id,
        fields: responseData.headers.flatMap((label, index) =>
          index === responseData.idIndex || !label ? [] : [{ label, value: row[index] || '' }]),
        stage: record ? record.stage : ADMIN_STAGES[0],
        starred: record ? record.starred : false,
        version: record ? record.version : 0,
        updatedAt: record ? record.updatedAt : '',
        updatedBy: record ? record.updatedBy : '',
      };
    }).filter(Boolean).reverse();
    return { email: admin, stages: ADMIN_STAGES, applicants };
  });
}

function updateApplicant(input) {
  const admin = requireAdmin_();
  validateMutation_(input);
  if (input.stage !== undefined && !ADMIN_STAGES.includes(input.stage)) throw new Error('Invalid application stage.');
  if (input.starred !== undefined && typeof input.starred !== 'boolean') throw new Error('Invalid star value.');
  if (input.stage === undefined && input.starred === undefined) throw new Error('No change provided.');
  return mutateApplicant_(input, admin, false);
}

function deleteApplicant(input) {
  const admin = requireAdmin_();
  validateMutation_(input);
  return mutateApplicant_(input, admin, true);
}

function requireAdmin_() {
  const email = String(Session.getActiveUser().getEmail() || '').trim().toLowerCase();
  const effective = String(Session.getEffectiveUser().getEmail() || '').trim().toLowerCase();
  if (!email || email !== effective || !ADMIN_EMAILS.includes(email)) {
    throw new Error('Access denied. Sign in with an approved admin Google account.');
  }
  return email;
}

function withAdminLock_(operation) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) throw new Error('Dashboard is busy. Please try again.');
  try { return operation(); } finally { lock.releaseLock(); }
}

function openAdminSheets_() {
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = properties.getProperty('RESPONSE_SPREADSHEET_ID') || DEFAULT_RESPONSE_SPREADSHEET_ID;
  const responseSheetName = properties.getProperty('RESPONSE_SHEET_NAME');
  const configuredSheetId = properties.getProperty('RESPONSE_SHEET_ID');
  const sheetId = configuredSheetId ? Number(configuredSheetId) : DEFAULT_RESPONSE_SHEET_ID;
  if (!responseSheetName && (!Number.isInteger(sheetId) || sheetId < 0)) throw new Error('The response tab ID is invalid.');
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const responses = responseSheetName
    ? spreadsheet.getSheetByName(responseSheetName)
    : spreadsheet.getSheets().find((sheet) => sheet.getSheetId() === sheetId);
  if (!responses || responses.getName() === MANAGEMENT_SHEET) throw new Error('The configured response tab was not found.');
  let management = spreadsheet.getSheetByName(MANAGEMENT_SHEET);
  if (!management) {
    management = spreadsheet.insertSheet(MANAGEMENT_SHEET);
    management.getRange(1, 1, 1, MANAGEMENT_HEADERS.length).setValues([MANAGEMENT_HEADERS]);
    management.setFrozenRows(1);
  }
  const actual = management.getRange(1, 1, 1, MANAGEMENT_HEADERS.length).getDisplayValues()[0];
  if (actual.some((header, index) => header !== MANAGEMENT_HEADERS[index])) throw new Error('Management sheet headers have changed. Ask your administrator to restore them.');
  return { responses, management };
}

function loadResponseData_(sheet) {
  const values = sheet.getDataRange().getDisplayValues();
  const headers = values[0];
  if (!headers || !headers.some(Boolean)) throw new Error('The response sheet needs its Google Forms header row.');
  let idIndex = headers.indexOf(APPLICATION_ID_HEADER);
  if (idIndex === -1) {
    idIndex = headers.length;
    headers.push(APPLICATION_ID_HEADER);
    sheet.getRange(1, idIndex + 1).setValue(APPLICATION_ID_HEADER);
  }
  const rows = [];
  const seen = new Set();
  const ids = [];
  let assignedIds = false;
  for (let index = 1; index < values.length; index += 1) {
    const row = values[index];
    ids.push([row[idIndex] || '']);
    if (!row.some((value, column) => column !== idIndex && value !== '')) continue;
    let id = row[idIndex];
    if (!id) {
      id = Utilities.getUuid();
      row[idIndex] = id;
      ids[index - 1][0] = id;
      assignedIds = true;
    }
    if (seen.has(id)) throw new Error('Duplicate application IDs found. Ask your administrator to correct copied response rows.');
    seen.add(id);
    rows.push(row);
  }
  if (assignedIds) sheet.getRange(2, idIndex + 1, ids.length, 1).setValues(ids);
  return { headers, rows, idIndex };
}

function loadManagement_(sheet) {
  const records = new Map();
  const values = sheet.getDataRange().getDisplayValues();
  for (let index = 1; index < values.length; index += 1) {
    const row = values[index];
    if (!row[0]) continue;
    if (records.has(row[0])) throw new Error('Duplicate management records found. Contact your administrator.');
    records.set(row[0], {
      row: index + 1,
      stage: row[1] || ADMIN_STAGES[0],
      starred: row[2] === 'TRUE',
      deleted: row[3] === 'TRUE',
      updatedAt: row[4] || '',
      updatedBy: row[5] || '',
      version: Number(row[6]) || 0,
    });
  }
  return records;
}

function validateMutation_(input) {
  if (!input || typeof input.id !== 'string' || !/^[a-f0-9-]{36}$/i.test(input.id)
    || !Number.isInteger(input.version) || input.version < 0) throw new Error('Invalid application update.');
}

function mutateApplicant_(input, admin, deleted) {
  return withAdminLock_(() => {
    const { responses, management } = openAdminSheets_();
    const data = loadResponseData_(responses);
    if (!data.rows.some((row) => row[data.idIndex] === input.id)) throw new Error('Application no longer exists. Refresh the dashboard.');
    const existing = loadManagement_(management).get(input.id);
    if (existing && existing.deleted) throw new Error('Application has been removed. Refresh the dashboard.');
    if ((existing ? existing.version : 0) !== input.version) throw new Error('Another admin updated this application. Refresh before making changes.');
    const record = {
      id: input.id,
      stage: deleted ? existing?.stage || ADMIN_STAGES[0] : input.stage ?? existing?.stage ?? ADMIN_STAGES[0],
      starred: deleted ? existing?.starred || false : input.starred ?? existing?.starred ?? false,
      version: input.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: admin,
    };
    const rowNumber = existing ? existing.row : management.getLastRow() + 1;
    management.getRange(rowNumber, 1, 1, MANAGEMENT_HEADERS.length).setValues([[
      record.id, record.stage, record.starred, deleted, record.updatedAt, record.updatedBy, record.version,
    ]]);
    SpreadsheetApp.flush();
    return record;
  });
}
