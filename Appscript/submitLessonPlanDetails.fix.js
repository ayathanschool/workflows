/**
 * This file contains a modified version of the submitLessonPlanDetails function
 * that incorporates enhanced duplicate detection logic.
 * Copy and paste this function into your Code.gs file to replace the existing function.
 */

if (action === 'submitLessonPlanDetails') {
  // Check if we have the enhanced version of the function available
  if (typeof submitLessonPlanDetailsEnhanced === 'function') {
    try {
      // Use the enhanced version
      const result = submitLessonPlanDetailsEnhanced(data);
      
      // Pass the result through
      if (result.error) {
        return _respond({ error: result.error });
      } else {
        return _respond({ submitted: true });
      }
    } catch (err) {
      // If the enhanced version fails, log the error and fall back to the original implementation
      Logger.log("Enhanced submitLessonPlanDetails failed: " + err);
      // Continue to original implementation below
    }
  }
  
  // Original implementation with fixes for duplicate detection
  Logger.log("LP_SUBMIT: Starting lesson plan submission");

  // Extract data fields
  const { lpId, objectives, activities, date, class: cls, subject, session, schemeId, teacherEmail, teacherName } = data;

  Logger.log(`LP_SUBMIT: Received - class:"${cls}", subject:"${subject}", session:${session}, lpId:${lpId || 'new'}`);
  
  const sh = _getSheet('LessonPlans');
  _ensureHeaders(sh, SHEETS.LessonPlans);
  const headers = _headers(sh);
  
  // Get relevant column indices
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

  // Get chapter from scheme
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

  // Normalize inputs
  const clsStr = String(cls || '').trim();
  const subjStr = String(subject || '').trim();
  const sessNum = Number(session || 0);
  
  // DUPLICATE DETECTION - Check for existing plans with same class/subject/session/chapter
  // Skip duplicate check only if we have a specific lpId we're updating
  if (!lpId) {
    for (let i = 0; i < values.length; i++) {
      const rowClass = String(values[i][classIdx] || '').trim();
      const rowSubj = String(values[i][subjIdx] || '').trim();
      const rowSession = Number(values[i][sessionIdx] || 0);
      const rowChapter = String(values[i][chapterIdx] || '').trim();
      const rowStatus = String(values[i][statusIdx] || '').trim();
      
      // Skip placeholder rows (Pending Preparation)
      if (rowStatus === 'Pending Preparation') continue;
      
      // Check for duplicate based on class/subject/session and optionally chapter
      if (rowClass === clsStr && rowSubj === subjStr && rowSession === sessNum) {
        // If chapter provided and matches, definite duplicate
        if (chapterFromScheme && rowChapter === chapterFromScheme) {
          Logger.log(`LP_SUBMIT: Duplicate detected - matching class/subject/session/chapter`);
          return _respond({ error: 'A lesson plan already exists for this class, subject, session, and chapter combination.' });
        }
        
        // If both have empty chapters, also duplicate
        if (!chapterFromScheme && !rowChapter) {
          Logger.log(`LP_SUBMIT: Duplicate detected - matching class/subject/session with empty chapters`);
          return _respond({ error: 'A lesson plan already exists for this class, subject, session combination.' });
        }
      }
    }
  }
  
  // Look for a row to update (by lpId or matching class/subject/session with placeholder status)
  let rowToUpdate = -1;
  
  // First try to find the specific lpId if provided
  if (lpId) {
    for (let i = 0; i < values.length; i++) {
      if (String(values[i][idIdx] || '') === String(lpId)) {
        rowToUpdate = i;
        break;
      }
    }
  }
  
  // If no lpId or not found, look for a placeholder row to update
  if (rowToUpdate === -1) {
    for (let i = 0; i < values.length; i++) {
      const rowClass = String(values[i][classIdx] || '').trim();
      const rowSubj = String(values[i][subjIdx] || '').trim();
      const rowSession = Number(values[i][sessionIdx] || 0);
      const rowStatus = String(values[i][statusIdx] || '').trim();
      
      if (rowClass === clsStr && rowSubj === subjStr && rowSession === sessNum && 
          rowStatus === 'Pending Preparation') {
        rowToUpdate = i;
        break;
      }
    }
  }
  
  // If we found a row to update
  if (rowToUpdate >= 0) {
    Logger.log(`LP_SUBMIT: Updating existing row at index ${rowToUpdate+2} with lpId ${values[rowToUpdate][idIdx]}`);
    
    values[rowToUpdate][objIdx] = objectives || '';
    values[rowToUpdate][actIdx] = activities || '';
    values[rowToUpdate][dateIdx] = date || '';
    values[rowToUpdate][statusIdx] = 'Pending Review';
    // Update class/subject/session/chapter if needed
    if (clsStr) values[rowToUpdate][classIdx] = clsStr;
    if (subjStr) values[rowToUpdate][subjIdx] = subjStr;
    if (sessNum) values[rowToUpdate][sessionIdx] = sessNum;
    if (chapterFromScheme) values[rowToUpdate][chapterIdx] = chapterFromScheme;
    
    sh.getRange(rowToUpdate+2, 1, 1, headers.length).setValues([values[rowToUpdate]]);
    Logger.log(`LP_SUBMIT: Successfully updated row. New status: Pending Review`);
    return _respond({ submitted: true });
  }

  // If no row found to update, create a new one
  Logger.log(`LP_SUBMIT: Creating new row with class:${clsStr}, subject:${subjStr}, session:${sessNum}, chapter:${chapterFromScheme || '(none)'}`);
  
  const now = new Date().toISOString();
  const newLpId = lpId || _uuid();
  
  // Create new row in the order of SHEETS.LessonPlans
  sh.appendRow([
    newLpId, // lpId
    (teacherEmail||'').toLowerCase().trim(), // teacherEmail
    teacherName || '', // teacherName
    clsStr, // class
    subjStr, // subject
    chapterFromScheme || '', // chapter
    sessNum, // session
    objectives || '',
    activities || '',
    'Pending Review', // status
    '', // reviewerRemarks
    date || '',
    now
  ]);
  
  Logger.log(`LP_SUBMIT: Successfully created new row with lpId ${newLpId}`);
  return _respond({ submitted: true });
}