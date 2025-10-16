/**
 * Exchange Google ID token for application user profile/roles.
 * Expects payload: { idToken }
 * Validates token via Google tokeninfo endpoint, then maps email to Users sheet.
 * Enhanced for troubleshooting token issues.
 */
function _handleGoogleLogin(payload) {
  if (!payload || !payload.idToken) {
    return _respond({ error: 'Missing idToken' });
  }
  try {
    // Try validating as an ID token first
    let url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(payload.idToken);
    let resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    let responseCode = resp.getResponseCode();
    
    // If ID token validation fails, try access token validation
    if (responseCode !== 200) {
      url = 'https://oauth2.googleapis.com/tokeninfo?access_token=' + encodeURIComponent(payload.idToken);
      resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      responseCode = resp.getResponseCode();
      
      // If both validations fail, return error with more context
      if (responseCode !== 200) {
        const errorText = resp.getContentText();
        console.error("Google token validation failed:", errorText);
        return _respond({ 
          error: 'Invalid Google token - ' + errorText,
          details: errorText,
          tokenType: 'Both ID and Access token validation failed'
        });
      }
    }
    
    // Parse the token info
    const info = JSON.parse(resp.getContentText());
    
    // Log token info for debugging (remove in production)
    console.log("Token info:", JSON.stringify(info));
    
    // For ID tokens, check email verification
    if (info.email) {
      const verified = String(info.email_verified || info.emailVerified || '').toLowerCase();
      if (verified !== 'true') {
        return _respond({ error: 'Email not verified' });
      }
    }
    
    // Get email from token info
    const email = String(info.email || info.user_id || '').toLowerCase().trim();
    if (!email) {
      return _respond({ 
        error: 'Token missing email',
        tokenInfo: info,
        hint: 'Ensure your Google OAuth consent screen has email scope enabled'
      });
    }

    // Lookup user in Users sheet
    const sh = _getSheet('Users');
    const headers = _headers(sh);
    const list = _rows(sh).map(r => _indexByHeader(r, headers));
    const found = list.find(u => String(u.email || '').toLowerCase() === email);
    if (!found) {
      return _respond({ 
        error: 'User not registered',
        email: email,
        hint: 'This Google account is not registered in the system. Please contact your administrator.'
      });
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
    console.error("Google login error:", err.message || err);
    return _respond({ 
      error: 'googleLogin failed: ' + (err && err.message ? err.message : err),
      stack: String(err.stack || '')
    });
  }
}