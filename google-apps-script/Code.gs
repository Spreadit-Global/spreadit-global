const SPREAD_CONFIG = {
  formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSd4fRpiLr9GXOkF6FY1uVJXue9VSp3hsJvVIcxyT8cVxRGzlA/viewform',
  spreadsheetId: '1F-IlBo8Gb84TpGWGjsK0WS3NC3N_vvoFPOenJ_i4HfI',
  driveFolderId: '161MAnEFYVdnVBSDDiLoE3CbcNrCVuvSk',
  uploadQuestion: 'Resume (optional)',
  calendlyUrl: 'https://calendly.com/spreadittech/30min',
};

function connectSpreadGlobalForm() {
  let form;
  try {
    form = FormApp.openByUrl(SPREAD_CONFIG.formUrl);
  } catch (error) {
    throw new Error('Could not open the responder URL for editing. Open the form while signed in as its owner and copy the editor URL ending in /edit into SPREAD_CONFIG.formUrl. Details: ' + error.message);
  }
  form.setDestination(FormApp.DestinationType.SPREADSHEET, SPREAD_CONFIG.spreadsheetId);
  form.setConfirmationMessage('Thank you. Your response has been recorded. Book your strategy call: ' + SPREAD_CONFIG.calendlyUrl);

  const spreadsheet = SpreadsheetApp.openById(SPREAD_CONFIG.spreadsheetId);
  ScriptApp.getProjectTriggers()
    .filter((trigger) => trigger.getHandlerFunction() === 'handleSpreadGlobalSubmit')
    .forEach((trigger) => ScriptApp.deleteTrigger(trigger));
  ScriptApp.newTrigger('handleSpreadGlobalSubmit')
    .forSpreadsheet(spreadsheet)
    .onFormSubmit()
    .create();

  Logger.log('Responder URL: ' + form.getPublishedUrl());
  Logger.log('Confirm the form has an optional File upload item titled exactly: ' + SPREAD_CONFIG.uploadQuestion);
  Logger.log('Google Forms does not support creating File upload items with Apps Script; add that item manually in the form editor.');
  return form.getPublishedUrl();
}

function handleSpreadGlobalSubmit(event) {
  if (!event || !event.range || !event.namedValues) {
    throw new Error('This function must run from the installed spreadsheet form-submit trigger.');
  }

  const sheet = event.range.getSheet();
  const row = event.range.getRow();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  const fileNameColumn = ensureOutputColumn(sheet, headers, 'Stored resume filename');
  const fileUrlColumn = ensureOutputColumn(sheet, headers, 'Stored resume Drive link');
  const processingColumn = ensureOutputColumn(sheet, headers, 'Resume processing status');
  const uploadedValue = (event.namedValues[SPREAD_CONFIG.uploadQuestion] || []).join(', ');
  const fileIds = [...uploadedValue.matchAll(/[A-Za-z0-9_-]{25,}/g)].map((match) => match[0]);

  if (fileIds.length === 0) {
    sheet.getRange(row, fileNameColumn).setValue('');
    sheet.getRange(row, fileUrlColumn).setValue('');
    sheet.getRange(row, processingColumn).setValue('No resume uploaded');
    return;
  }

  const folder = DriveApp.getFolderById(SPREAD_CONFIG.driveFolderId);
  const name = answer(event, 'Full name');
  const location = answer(event, 'Current location');
  const role = answer(event, 'Target role');
  const years = sanitizeYears(answer(event, 'Years of experience'));
  const storedNames = [];
  const storedLinks = [];

  try {
    fileIds.forEach((fileId) => {
    const file = DriveApp.getFileById(fileId);
    const extension = file.getName().match(/\.[A-Za-z0-9]{1,8}$/)?.[0] || '';
    if (!/^\.(pdf|doc|docx)$/i.test(extension)) {
      throw new Error('Resume must be a PDF, DOC, or DOCX file.');
    }

    const baseName = [
      sanitizePart(name, '_'),
      sanitizePart(location, '-'),
      sanitizePart(role, '_'),
      years,
    ].join('-');
    const finalName = uniqueDriveName(folder, baseName, extension);
    file.setName(finalName);
    file.moveTo(folder);
    storedNames.push(finalName);
    storedLinks.push(file.getUrl());
    });

    sheet.getRange(row, fileNameColumn).setValue(storedNames.join(', '));
    sheet.getRange(row, fileUrlColumn).setValue(storedLinks.join(', '));
    sheet.getRange(row, processingColumn).setValue('Resume moved and renamed');
  } catch (error) {
    sheet.getRange(row, processingColumn).setValue('Resume processing failed; see Apps Script execution log');
    console.error(error);
  }
}

function ensureOutputColumn(sheet, headers, title) {
  const existingIndex = headers.indexOf(title);
  if (existingIndex >= 0) return existingIndex + 1;
  const nextColumn = sheet.getLastColumn() + 1;
  sheet.getRange(1, nextColumn).setValue(title);
  headers.push(title);
  return nextColumn;
}

function answer(event, title) {
  return (event.namedValues[title] || [''])[0].trim();
}

function sanitizePart(value, separator) {
  return String(value || 'candidate')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, separator)
    .replace(new RegExp('^' + separator + '+|' + separator + '+$', 'g'), '') || 'candidate';
}

function sanitizeYears(value) {
  const cleaned = String(value || '0').trim().replace(/[^0-9.]/g, '');
  return cleaned || '0';
}

function uniqueDriveName(folder, baseName, extension) {
  let candidate = baseName + extension;
  let suffix = 2;
  while (folder.getFilesByName(candidate).hasNext()) {
    candidate = baseName + '-' + suffix + extension;
    suffix += 1;
  }
  return candidate;
}
