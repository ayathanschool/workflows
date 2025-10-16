/**
 * === GOOGLE LOGIN FIX ===
 * Add these functions to your Code.gs file, replacing any duplicate functions.
 * This fixes the Google authentication 404 errors and Cross-Origin issues.
 */

/**
 * Parse POST request body data into JavaScript object.
 * Returns empty object if parsing fails.
 */
function _parsePost(e) {
  try {
    if (e.postData && e.postData.contents) {
      return JSON.parse(e.postData.contents);
    }
  } catch (err) {
    console.error("Error parsing POST data:", err);
  }
  return {};
}

/**
 * Exchange Google ID token for application user profile/roles.
 * Expects payload: { idToken }
 * Validates token via Google tokeninfo endpoint, then maps email to Users sheet.
 */
function _handleGoogleLogin(payload) {
  if (!payload || !payload.idToken) {
    return _respond({ error: 'Missing idToken' });
  }
  try {
    const url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(payload.idToken);
    const resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (resp.getResponseCode() !== 200) {
      return _respond({ error: 'Invalid Google token' });
    }
    const info = JSON.parse(resp.getContentText());
    const verified = String(info.email_verified || info.emailVerified || '').toLowerCase();
    if (verified !== 'true') {
      return _respond({ error: 'Email not verified' });
    }
    const email = String(info.email || '').toLowerCase().trim();
    if (!email) {
      return _respond({ error: 'Token missing email' });
    }

    // Lookup user in Users sheet
    const sh = _getSheet('Users');
    const headers = _headers(sh);
    const list = _rows(sh).map(r => _indexByHeader(r, headers));
    const found = list.find(u => String(u.email || '').toLowerCase() === email);
    if (!found) {
      return _respond({ error: 'User not registered' });
    }

    // Normalize roles/classes/subjects
    const roleStr = (found.roles || found.role || '').toString();
    const roles = roleStr.split(',').map(s => s.trim()).filter(Boolean);
    const classStr = (found.classes || found.Class || found.Classes || '').toString();
    const classes = classStr.split(',').map(s => s.trim()).filter(Boolean);
    const subjStr = (found.subjects || found.Subject || found.Subjects || '').toString();
    const subjects = subjStr.split(',').map(s => s.trim()).filter(Boolean);
    const classTeacherFor = found.classTeacherFor || found['Class Teacher For'] || '';

    return _respond({
      email,
      name: found.name || info.name || '',
      roles,
      classes,
      subjects,
      classTeacherFor,
      picture: info.picture || ''
    });
  } catch (err) {
    return _respond({ error: 'googleLogin failed: ' + (err && err.message ? err.message : err) });
  }
}

/**
 * === ADD THESE SECTIONS TO YOUR EXISTING doGet FUNCTION ===
 * Place inside your existing doGet function, just before the final return statement.
 */
/*
  // Fallback GET handler for googleLogin (primarily for troubleshooting / legacy).
  // Prefer POST for security, but allow GET with idToken parameter so the
  // client can retry when POST returns 404 (e.g. stale deployment without doPost).
  if (action === 'googleLogin' && e.parameter.idToken) {
    return _handleGoogleLogin({ idToken: e.parameter.idToken });
  }
*/

/**
 * === REPLACE YOUR EXISTING doPost FUNCTION WITH THIS ONE ===
 * If you already have functions inside doPost, merge them with this structure.
 */
function doPost(e) {
  const action = (e.parameter.action || '').trim();
  const data = _parsePost(e);
  try {
    _bootstrapSheets();
    
    // Handle Google login via POST
    if (action === 'googleLogin') {
      return _handleGoogleLogin(data);
    }
    
    // === ADD YOUR EXISTING doPost HANDLERS HERE ===
    // Example:
    if (action === 'submitPlan') {
      // Your existing submitPlan code
    }
    
    if (action === 'updatePlanStatus') {
      // Your existing updatePlanStatus code
    }
    
    // ... other action handlers
    
    return _respond({ error: 'Unknown POST action' });
  } catch (err) {
    return _respond({ error: String(err && err.message ? err.message : err) });
  }
}

/**
 * === HOW TO USE THIS FILE ===
 * 1. Open your Google Apps Script editor
 * 2. Look for your doGet function - add the googleLogin handler
 * 3. Replace or merge your doPost function with the one above
 * 4. Add the _parsePost and _handleGoogleLogin functions if they don't exist
 * 5. Deploy a new version of your script (Deploy > Manage deployments > Edit > New version)
 */