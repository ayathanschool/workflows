// Google Login Test Script
// Add this to your Apps Script project as a new file called "TestGoogleAuth.gs"

/**
 * Test function to validate a Google token
 * Call this from the script editor to debug token validation issues
 */
function testValidateGoogleToken(token) {
  if (!token) {
    console.log("No token provided");
    return "No token provided";
  }
  
  try {
    // Try ID token validation
    console.log("Testing as ID token...");
    let url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(token);
    let resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    let responseCode = resp.getResponseCode();
    let responseText = resp.getContentText();
    
    console.log("ID token validation response code:", responseCode);
    console.log("ID token validation response:", responseText);
    
    if (responseCode === 200) {
      const info = JSON.parse(responseText);
      return {
        success: true,
        tokenType: "ID token",
        info: info
      };
    }
    
    // Try access token validation
    console.log("Testing as access token...");
    url = 'https://oauth2.googleapis.com/tokeninfo?access_token=' + encodeURIComponent(token);
    resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    responseCode = resp.getResponseCode();
    responseText = resp.getContentText();
    
    console.log("Access token validation response code:", responseCode);
    console.log("Access token validation response:", responseText);
    
    if (responseCode === 200) {
      const info = JSON.parse(responseText);
      return {
        success: true,
        tokenType: "Access token",
        info: info
      };
    }
    
    return {
      success: false,
      message: "Both ID and Access token validation failed",
      idTokenResponse: responseText
    };
  } catch (err) {
    console.error("Token validation error:", err);
    return {
      success: false,
      error: String(err.message || err),
      stack: String(err.stack || '')
    };
  }
}

/**
 * Test your Users sheet lookup logic
 */
function testUserLookup(email) {
  try {
    if (!email) {
      return "No email provided";
    }
    
    const sh = _getSheet('Users');
    const headers = _headers(sh);
    const list = _rows(sh).map(r => _indexByHeader(r, headers));
    console.log("All users:", list.map(u => u.email));
    
    const found = list.find(u => String(u.email || '').toLowerCase() === email.toLowerCase());
    
    if (!found) {
      return {
        success: false,
        message: "User not found",
        email: email,
        allUsers: list.map(u => u.email)
      };
    }
    
    return {
      success: true,
      user: found
    };
  } catch (err) {
    return {
      success: false,
      error: String(err.message || err)
    };
  }
}

// Run this function to check if your Google login implementation is set up correctly
function diagnoseGoogleLoginSetup() {
  const results = {
    appScriptSetup: {},
    userSheetSetup: {}
  };
  
  try {
    // Check if _handleGoogleLogin function exists
    results.appScriptSetup.handleGoogleLoginExists = typeof _handleGoogleLogin === 'function';
  } catch (e) {
    results.appScriptSetup.handleGoogleLoginExists = false;
  }
  
  try {
    // Check if doPost function exists
    results.appScriptSetup.doPostExists = typeof doPost === 'function';
  } catch (e) {
    results.appScriptSetup.doPostExists = false;
  }
  
  try {
    // Check Users sheet
    const sh = _getSheet('Users');
    const headers = _headers(sh);
    results.userSheetSetup.headersExist = headers.length > 0;
    results.userSheetSetup.headers = headers;
    
    const hasEmailColumn = headers.includes('email');
    results.userSheetSetup.hasEmailColumn = hasEmailColumn;
    
    const rows = _rows(sh).map(r => _indexByHeader(r, headers));
    results.userSheetSetup.rowCount = rows.length;
    
    if (rows.length > 0) {
      // Sample the first user (anonymize for security)
      const firstUser = rows[0];
      results.userSheetSetup.sampleUser = {
        hasEmail: !!firstUser.email,
        hasName: !!firstUser.name,
        hasRoles: !!(firstUser.roles || firstUser.role),
        emailFormat: firstUser.email ? (firstUser.email.includes('@') ? 'valid' : 'invalid') : 'missing'
      };
    }
  } catch (e) {
    results.userSheetSetup.error = String(e.message || e);
  }
  
  return results;
}