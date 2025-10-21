/**
 * Fix for the submitLessonPlanDetails function to ensure session numbers are correctly preserved
 * 
 * This function replaces the existing submitLessonPlanDetails in Code.gs
 */
function submitLessonPlanDetails() {
  // Accepts payload: lpId, class, subject, session, schemeId (optional),
  // objectives, activities, date, teacherEmail, teacherName, notes
  const { lpId, objectives, activities, date, class: cls, subject, session, schemeId, teacherEmail, teacherName, notes } = data;

  Logger.log(`LP_SUBMIT: Received - class:"${cls}", subject:"${subject}", session:${session}, lpId:${lpId || 'new'}`);
  Logger.log(`LP_SUBMIT: Received - objectives:"${objectives}", activities:"${activities}", date:"${date}"`);
  
  const sh = _getSheet('LessonPlans');
  _ensureHeaders(sh, SHEETS.LessonPlans);
  const headers = _headers(sh);
  const idIdx = headers.indexOf('lpId');
  const classIdx = headers.indexOf('class');
  const subjIdx = headers.indexOf('subject');
  const sessionIdx = headers.indexOf('session');
  const chapterIdx = headers.indexOf('chapter');
  const objIdx = headers.indexOf('objectives');
  const actIdx = headers.indexOf('activities');
  const dateIdx = headers.indexOf('date');
  const statusIdx = headers.indexOf('status');
  const createdAtIdx = headers.indexOf('createdAt');

  const last = sh.getLastRow();
  const values = last >= 2 ? sh.getRange(2,1,last-1,headers.length).getValues() : [];

  // Determine chapter from provided schemeId (if available) to include in duplicate check
  let chapterFromScheme = '';
  if (schemeId) {
    try {
      const sSh = _getSheet('Schemes');
      const sHdr = _headers(sSh);
      const sVals = _rows(sSh).map(r => _indexByHeader(r, sHdr));
      const foundScheme = sVals.find(s => String(s.schemeId || '') === String(schemeId));
      if (foundScheme) chapterFromScheme = String(foundScheme.chapter || '');
    } catch (e) {
      // ignore and continue
    }
  }

  const clsStr = String(cls || '').trim();
  const subjStr = String(subject || '').trim();
  
  // IMPORTANT FIX: Ensure session number is properly converted to a number
  // and never gets lost in the process
  const sessNum = Number(session || 0);
  
  Logger.log(`LP_SUBMIT: Using normalized values - class:"${clsStr}", subject:"${subjStr}", session:${sessNum}`);
  
  // If explicit lpId is provided, search for that specific row to update
  if (lpId) {
    Logger.log(`LP_SUBMIT: Looking for exact lpId match: ${lpId}`);
    for (let i=0; i<values.length; i++) {
      const rowLpId = String(values[i][idIdx] || '');
      if (rowLpId === String(lpId)) {
        Logger.log(`LP_SUBMIT: Updating existing row with lpId ${lpId} at position ${i+2}`);
        values[i][objIdx] = objectives || '';
        values[i][actIdx] = activities || '';
        values[i][dateIdx] = date || '';
        values[i][statusIdx] = 'Pending Review';
        // IMPORTANT FIX: Always update the session number if provided
        if (sessNum > 0) {
          values[i][sessionIdx] = sessNum;
          Logger.log(`LP_SUBMIT: Setting session to ${sessNum} for row ${i+2}`);
        }
        // Update other fields if provided
        if (clsStr) values[i][classIdx] = clsStr;
        if (subjStr) values[i][subjIdx] = subjStr;
        if (chapterFromScheme) values[i][chapterIdx] = chapterFromScheme;
        
        sh.getRange(2+i,1,1,headers.length).setValues([values[i]]);
        Logger.log(`LP_SUBMIT: Successfully updated row with lpId ${lpId}`);
        return _respond({ submitted: true });
      }
    }
    Logger.log(`LP_SUBMIT: No existing row found with lpId ${lpId}`);
  }

  // Search for a matching placeholder row based on class/subject/session combination
  Logger.log(`LP_SUBMIT: Looking for matching placeholder with class:${clsStr}, subject:${subjStr}, session:${sessNum}`);
  for (let i=0; i<values.length; i++) {
    const rowClass = String(values[i][classIdx] || '').trim();
    const rowSubj = String(values[i][subjIdx] || '').trim();
    const rowSession = Number(values[i][sessionIdx] || 0);
    const rowStatus = String(values[i][statusIdx] || '').trim();
    
    // Check for a placeholder (empty or Pending Preparation) with matching class, subject, session
    if (rowClass === clsStr && 
        rowSubj === subjStr && 
        rowSession === sessNum &&
        (rowStatus === 'Pending Preparation' || !values[i][objIdx] || !values[i][actIdx])) {
      
      Logger.log(`LP_SUBMIT: Found matching placeholder at row ${i+2}`);
      values[i][objIdx] = objectives || '';
      values[i][actIdx] = activities || '';
      values[i][dateIdx] = date || '';
      values[i][statusIdx] = 'Pending Review';
      // IMPORTANT FIX: Always ensure session is preserved
      values[i][sessionIdx] = sessNum;
      if (chapterFromScheme) values[i][chapterIdx] = chapterFromScheme;
      
      sh.getRange(2+i,1,1,headers.length).setValues([values[i]]);
      Logger.log(`LP_SUBMIT: Successfully updated placeholder row at ${i+2}`);
      return _respond({ submitted: true });
    }
  }

  // Check for duplicates with exact class/subject/session/chapter
  for (let i=0; i<values.length; i++) {
    const rowClass = String(values[i][classIdx] || '').trim();
    const rowSubj = String(values[i][subjIdx] || '').trim();
    const rowSession = Number(values[i][sessionIdx] || 0);
    const rowChapter = String(values[i][chapterIdx] || '').trim();
    
    // Only consider non-placeholder rows with actual content
    if (rowClass === clsStr && 
        rowSubj === subjStr && 
        rowSession === sessNum &&
        rowChapter === chapterFromScheme &&
        String(values[i][statusIdx] || '') !== 'Pending Preparation') {
      
      Logger.log(`LP_SUBMIT: Found duplicate at row ${i+2} - class:${rowClass}, subject:${rowSubj}, session:${rowSession}, chapter:${rowChapter}`);
      return _respond({ error: 'Duplicate lesson plan exists for this class/subject/session/chapter' });
    }
  }

  // Create a new lesson plan row
  Logger.log(`LP_SUBMIT: No matching row found, creating new lesson plan with session ${sessNum}`);
  const now = new Date().toISOString();
  const newLpId = _uuid();
  const newRow = [];
  // Build row in the SHEETS.LessonPlans order
  newRow[0] = newLpId; // lpId
  newRow[1] = (teacherEmail||'').toLowerCase().trim(); // teacherEmail
  newRow[2] = teacherName || ''; // teacherName
  newRow[3] = clsStr; // class
  newRow[4] = subjStr; // subject
  newRow[5] = chapterFromScheme || ''; // chapter
  newRow[6] = sessNum; // IMPORTANT FIX: Explicitly assign the session number
  newRow[7] = objectives || '';
  newRow[8] = activities || '';
  newRow[9] = 'Pending Review'; // status
  newRow[10] = ''; // reviewerRemarks
  newRow[11] = date || '';
  newRow[12] = now;
  
  Logger.log(`LP_SUBMIT: Creating new row with session ${sessNum}`);
  sh.appendRow(newRow);
  Logger.log(`LP_SUBMIT: Successfully created new row with lpId ${newLpId} and session ${sessNum}`);
  return _respond({ submitted: true });
}