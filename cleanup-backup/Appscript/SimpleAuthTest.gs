/**
 * Simple CORS-enabled test handler
 * 
 * This is a minimal implementation to test Google authentication with proper CORS support.
 */

// Main GET handler
function doGet(e) {
  const action = e.parameter.action || '';
  
  if (action === 'ping') {
    return createResponse({
      ok: true,
      now: new Date().toISOString()
    });
  }
  
  if (action === 'googleLogin') {
    const email = e.parameter.email || '';
    if (!email) {
      return createResponse({ error: 'Missing email parameter' });
    }
    
    // Lookup the email in the Users sheet
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName('Users') || ss.insertSheet('Users');
      const data = sheet.getDataRange().getValues();
      
      if (data.length <= 1) {
        return createResponse({ error: 'No users found in database' });
      }
      
      // Find email column
      const headers = data[0];
      let emailCol = -1;
      for (let i = 0; i < headers.length; i++) {
        if (headers[i].toString().toLowerCase() === 'email') {
          emailCol = i;
          break;
        }
      }
      
      if (emailCol === -1) {
        return createResponse({ error: 'Email column not found in Users sheet' });
      }
      
      // Find user with matching email
      let foundUser = null;
      for (let i = 1; i < data.length; i++) {
        if (data[i][emailCol].toString().toLowerCase() === email.toLowerCase()) {
          foundUser = data[i];
          break;
        }
      }
      
      if (!foundUser) {
        return createResponse({ error: 'User not registered' });
      }
      
      // Find role column (try both singular and plural forms)
      let roleCol = -1;
      for (let i = 0; i < headers.length; i++) {
        const header = headers[i].toString().toLowerCase();
        if (header === 'roles' || header === 'role') {
          roleCol = i;
          break;
        }
      }
      
      // Find name column
      let nameCol = -1;
      for (let i = 0; i < headers.length; i++) {
        if (headers[i].toString().toLowerCase() === 'name') {
          nameCol = i;
          break;
        }
      }
      
      // Prepare response
      const response = {
        email: email,
        name: nameCol >= 0 ? (foundUser[nameCol] || '') : '',
        roles: []
      };
      
      // Add roles if available
      if (roleCol >= 0) {
        const rolesStr = foundUser[roleCol] || '';
        response.roles = rolesStr.split(',').map(r => r.trim()).filter(Boolean);
      }
      
      return createResponse(response);
      
    } catch (err) {
      return createResponse({ 
        error: 'Server error: ' + (err.message || String(err))
      });
    }
  }
  
  return createResponse({ error: 'Unknown action' });
}

// Handle OPTIONS requests for CORS preflight
function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    .setHeader('Access-Control-Max-Age', '3600');
}

// Simple POST handler that delegates to doGet for testing
function doPost(e) {
  const action = e.parameter.action || '';
  
  if (action === 'ping') {
    return createResponse({
      ok: true,
      now: new Date().toISOString(),
      method: 'POST'
    });
  }
  
  // Parse POST data
  let payload = {};
  try {
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }
  } catch (err) {
    return createResponse({ error: 'Invalid JSON payload' });
  }
  
  if (action === 'googleLogin') {
    // If we have email in the payload, use that
    if (payload.email) {
      // Create a GET parameter style object to reuse the doGet handler
      const getParams = {
        parameter: {
          action: 'googleLogin',
          email: payload.email
        }
      };
      return doGet(getParams);
    }
    
    return createResponse({ error: 'Missing email in payload' });
  }
  
  return createResponse({ error: 'Unknown action' });
}

// Helper function to create CORS-enabled JSON responses
function createResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}