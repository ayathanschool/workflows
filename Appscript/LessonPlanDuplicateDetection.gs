/**
 * Enhanced duplicate detection for lesson plans
 * This file contains helper functions to improve the duplicate detection logic
 * for lesson plans to prevent creating multiple plans for the same period
 */

/**
 * Check if a lesson plan already exists for the given class-subject-session-chapter combination
 * Returns the existing plan ID if found, null otherwise
 * 
 * @param {string} classStr - The class name
 * @param {string} subjectStr - The subject name
 * @param {number} sessionNum - The session/period number
 * @param {string} chapter - The chapter name (optional)
 * @param {string} date - The lesson date (optional)
 * @return {string|null} The existing plan ID or null if none found
 */
function checkDuplicateLessonPlan(classStr, subjectStr, sessionNum, chapter = '', date = '') {
  // Get all lesson plans
  const sh = _getSheet('LessonPlans');
  const headers = _headers(sh);
  const values = _rows(sh).map(r => _indexByHeader(r, headers));
  
  // Setup field indices for easier access
  const classIdx = headers.indexOf('class');
  const subjIdx = headers.indexOf('subject');
  const sessionIdx = headers.indexOf('session');
  const chapterIdx = headers.indexOf('chapter');
  const dateIdx = headers.indexOf('date');
  const idIdx = headers.indexOf('lpId');
  
  // Log our search parameters for debugging
  Logger.log(`Checking for duplicate: class="${classStr}", subject="${subjectStr}", session=${sessionNum}, chapter="${chapter}"`);
  
  // First look for exact match including chapter (strict match)
  for (let i = 0; i < values.length; i++) {
    const rowClass = String(values[i][classIdx] || '').trim();
    const rowSubj = String(values[i][subjIdx] || '').trim();
    const rowSession = Number(values[i][sessionIdx] || 0);
    const rowChapter = String(values[i][chapterIdx] || '').trim();
    
    // For strict matching, all fields must match exactly
    if (rowClass === classStr && 
        rowSubj === subjectStr && 
        rowSession === sessionNum &&
        (chapter && rowChapter === chapter)) {
      
      Logger.log(`Found duplicate: row ${i+2}, lpId=${values[i][idIdx]}, class="${rowClass}", subject="${rowSubj}", session=${rowSession}, chapter="${rowChapter}"`);
      return values[i][idIdx]; // Return the ID of the existing plan
    }
  }
  
  // If chapter is provided but no strict match was found, look for any match with same class-subject-session
  if (chapter) {
    for (let i = 0; i < values.length; i++) {
      const rowClass = String(values[i][classIdx] || '').trim();
      const rowSubj = String(values[i][subjIdx] || '').trim();
      const rowSession = Number(values[i][sessionIdx] || 0);
      
      // For looser matching, just check class-subject-session
      if (rowClass === classStr && 
          rowSubj === subjectStr && 
          rowSession === sessionNum) {
        
        Logger.log(`Found class-subject-session match: row ${i+2}, lpId=${values[i][idIdx]}, class="${rowClass}", subject="${rowSubj}", session=${rowSession}, chapter="${values[i][chapterIdx] || ''}"`);
        return values[i][idIdx]; // Return the ID of the existing plan
      }
    }
  }
  
  // If we reach here, no duplicate was found
  Logger.log(`No duplicate found for class="${classStr}", subject="${subjectStr}", session=${sessionNum}, chapter="${chapter}"`);
  return null;
}

/**
 * Find the best candidate row to update for a lesson plan
 * This looks through existing plans and returns the ID of the best candidate
 * to update based on a priority system, or null if a new plan should be created
 * 
 * @param {string} classStr - The class name
 * @param {string} subjectStr - The subject name
 * @param {number} sessionNum - The session/period number
 * @param {string} chapter - The chapter name (optional)
 * @param {string} currentLpId - The current lesson plan ID (if updating)
 * @return {Object} Result with bestLpId and whether duplicate was found
 */
function findBestLessonPlanMatch(classStr, subjectStr, sessionNum, chapter = '', currentLpId = '') {
  // Get all lesson plans
  const sh = _getSheet('LessonPlans');
  const headers = _headers(sh);
  const values = _rows(sh).map(r => _indexByHeader(r, headers));
  
  let bestRowIndex = -1;
  let bestPriority = -1; 
  let isDuplicate = false;
  
  // Loop through all rows looking for the best match
  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    const rowClass = String(row.class || '').trim();
    const rowSubj = String(row.subject || '').trim();
    const rowSession = Number(row.session || 0);
    const rowLpId = String(row.lpId || '');
    const rowStatus = String(row.status || '').trim();
    const rowObjectives = String(row.objectives || '').trim();
    const rowActivities = String(row.activities || '').trim();
    const rowChapter = String(row.chapter || '').trim();
    
    // Skip rows that don't match class/subject/session
    if (rowClass !== classStr || rowSubj !== subjectStr || rowSession !== sessionNum) {
      continue;
    }
    
    // Set priority based on various factors (higher = better match to update)
    let priority = 0;
    
    // If this is the exact lpId, highest priority (10)
    if (currentLpId && rowLpId === currentLpId) {
      priority = 10;
    }
    // If status is "Pending Preparation", very high priority (8)
    else if (rowStatus === 'Pending Preparation') {
      priority = 8;
    }
    // If empty objectives AND activities, high priority (6)
    else if (!rowObjectives && !rowActivities) {
      priority = 6;
    }
    // If chapter matches and empty objectives OR activities, medium priority (4)
    else if (chapter && rowChapter === chapter && (!rowObjectives || !rowActivities)) {
      priority = 4;
    }
    // If chapter matches, low priority (2)
    else if (chapter && rowChapter === chapter) {
      priority = 2;
    }
    // Any other matching row, lowest priority (1)
    else {
      priority = 1;
    }
    
    // If this is a real lesson plan (not Pending Preparation) with same chapter, flag as duplicate
    if (rowStatus !== 'Pending Preparation' && chapter && rowChapter === chapter) {
      isDuplicate = true;
    }
    
    // Update our best match if this one has higher priority
    if (priority > bestPriority) {
      bestPriority = priority;
      bestRowIndex = i;
    }
  }
  
  // Return the best match if found
  if (bestRowIndex >= 0) {
    return {
      bestLpId: String(values[bestRowIndex].lpId || ''),
      priority: bestPriority,
      isDuplicate: isDuplicate
    };
  }
  
  return { bestLpId: null, priority: 0, isDuplicate: false };
}

/**
 * Enhanced version of submitLessonPlanDetails that prevents duplicates
 * This is a drop-in replacement for the original function with better duplicate detection
 * 
 * @param {Object} data - The lesson plan data
 * @return {Object} Response object with success or error message
 */
function submitLessonPlanDetailsEnhanced(data) {
  // Add debug logging
  Logger.log("LP_SUBMIT: Starting lesson plan submission");

  // Extract key data fields
  const { lpId, objectives, activities, date, class: cls, subject, session, schemeId, teacherEmail, teacherName } = data;

  Logger.log(`LP_SUBMIT: Received - class:"${cls}", subject:"${subject}", session:${session}, lpId:${lpId || 'new'}`);
  
  const sh = _getSheet('LessonPlans');
  _ensureHeaders(sh, SHEETS.LessonPlans);
  
  // Normalize inputs for consistency
  const clsStr = String(cls || '').trim();
  const subjStr = String(subject || '').trim();
  const sessNum = Number(session || 0);
  
  // Determine chapter from provided schemeId (if available)
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
  
  // Use our enhanced helper function to find the best match
  const matchResult = findBestLessonPlanMatch(clsStr, subjStr, sessNum, chapterFromScheme, lpId);
  
  // If we found a duplicate and it's not the row we're trying to update, return error
  if (matchResult.isDuplicate && (!lpId || matchResult.bestLpId !== lpId)) {
    Logger.log(`LP_SUBMIT: Duplicate detected for ${clsStr}/${subjStr}/session ${sessNum}/chapter ${chapterFromScheme}`);
    return { error: 'A lesson plan already exists for this class, subject, session, and chapter combination.' };
  }
  
  // If we found a good candidate row to update
  if (matchResult.bestLpId) {
    const headers = _headers(sh);
    const values = sh.getDataRange().getValues();
    
    // Find the row with the matching lpId
    for (let i = 1; i < values.length; i++) {
      if (String(values[i][headers.indexOf('lpId')]) === matchResult.bestLpId) {
        Logger.log(`LP_SUBMIT: Updating existing row at index ${i+1} with lpId ${matchResult.bestLpId}`);
        
        // Update the row with new values
        const rowData = [];
        for (let j = 0; j < headers.length; j++) {
          const field = headers[j];
          if (field === 'objectives') rowData.push(objectives || '');
          else if (field === 'activities') rowData.push(activities || '');
          else if (field === 'date') rowData.push(date || '');
          else if (field === 'status') rowData.push('Pending Review');
          else if (field === 'class' && clsStr) rowData.push(clsStr);
          else if (field === 'subject' && subjStr) rowData.push(subjStr);
          else if (field === 'session' && sessNum) rowData.push(sessNum);
          else if (field === 'chapter' && chapterFromScheme) rowData.push(chapterFromScheme);
          else rowData.push(values[i][j]); // Keep existing value
        }
        
        sh.getRange(i+1, 1, 1, headers.length).setValues([rowData]);
        Logger.log(`LP_SUBMIT: Successfully updated row. New status: Pending Review`);
        return { submitted: true };
      }
    }
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
  return { submitted: true };
}

/**
 * Test the enhanced lesson plan duplicate detection
 * This is a function you can run manually in the Apps Script editor
 */
function testLessonPlanDuplicateDetection() {
  try {
    Logger.log("=== Testing Enhanced Lesson Plan Duplicate Detection ===");
    
    // Sample test data
    const testData = {
      class: "STD 7A",
      subject: "Math",
      session: 3,
      chapter: "Algebra",
      objectives: "Learn basic algebraic equations",
      activities: "Solve problems on board",
      date: "2023-11-15",
      teacherEmail: "teacher@school.com",
      teacherName: "Math Teacher"
    };
    
    // Test 1: Check for duplicate
    Logger.log("1. Testing checkDuplicateLessonPlan...");
    const duplicate = checkDuplicateLessonPlan(
      testData.class, 
      testData.subject,
      testData.session,
      testData.chapter
    );
    
    Logger.log(`Duplicate check result: ${duplicate || 'No duplicate found'}`);
    
    // Test 2: Find best match
    Logger.log("2. Testing findBestLessonPlanMatch...");
    const match = findBestLessonPlanMatch(
      testData.class,
      testData.subject,
      testData.session,
      testData.chapter
    );
    
    Logger.log(`Best match: ${JSON.stringify(match)}`);
    
    Logger.log("=== Test completed ===");
    return "Test completed successfully";
  } catch (error) {
    Logger.log(`Error in test: ${error.message}`);
    return `Test failed: ${error.message}`;
  }
}