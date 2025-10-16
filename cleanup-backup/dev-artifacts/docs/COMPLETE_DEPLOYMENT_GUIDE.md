# SchoolFlow Google Login - Complete Deployment Guide

Follow these steps to fix the Google Login issues with your SchoolFlow application.

## 1. Update Your Google Apps Script Backend

### Step 1: Open your Google Apps Script project

1. Go to [script.google.com](https://script.google.com) and open your SchoolFlow backend project
2. Open your `Code.gs` file

### Step 2: Add the required functions

Add these three essential functions to your `Code.gs` file:

```javascript
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
 * Handle POST requests - supports actions like googleLogin, submitPlan, updatePlanStatus, etc.
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
    
    // If you already have other POST handlers, add them here
    
    return _respond({ error: 'Unknown POST action' });
  } catch (err) {
    return _respond({ error: String(err && err.message ? err.message : err) });
  }
}
```

### Step 3: Check that you have the GET fallback in your doGet function

Your `doGet` function should already have this code:

```javascript
// Inside your doGet function, before the final return
// Fallback GET handler for googleLogin (primarily for troubleshooting / legacy).
if (action === 'googleLogin' && e.parameter.idToken) {
  return _handleGoogleLogin({ idToken: e.parameter.idToken });
}
```

If it doesn't, add it right before the end of the function.

### Step 4: Save your changes

Click the Save button (disk icon) to save your changes.

## 2. Deploy a New Version of Your Apps Script

### Step 1: Create a new deployment

1. Click "Deploy" > "New deployment" 
2. Select "Web app" as the deployment type
3. Add a description like "Google Login Fix"
4. Set "Execute as" to your account
5. Set "Who has access" to the appropriate level (typically "Anyone" or "Anyone with Google account")
6. Click "Deploy"

### Step 2: Get the deployment URL

After deployment, you'll see a URL that ends with `/exec`. This is your Apps Script Web App URL.

Make sure this URL matches the `VITE_GAS_WEB_APP_URL` in your `.env` file:
```
VITE_GAS_WEB_APP_URL=https://script.google.com/macros/s/YOUR-DEPLOYMENT-ID-HERE/exec
```

## 3. Verify Your Environment Configuration

Your `.env` file should already contain:

```properties
# REQUIRED: Your deployed Google Apps Script Web App URL (must end with /exec)
VITE_GAS_WEB_APP_URL=https://script.google.com/macros/s/AKfycbzZbsoiP8NnNclk3riUGHMfP_5Odz6P8quabs0oveGHFByMUVEo4xcywjp_bSs3vQMvOw/exec

# REQUIRED: Google OAuth Web Client ID (from Google Cloud Console - OAuth credentials)
VITE_GOOGLE_CLIENT_ID=414597183450-3okhv6vrk0i28vkrrse8de4io2odu62r.apps.googleusercontent.com

# OPTIONAL: Enable verbose API logging in the browser console during development
VITE_VERBOSE_API=false
```

If your new deployment URL is different, update the `VITE_GAS_WEB_APP_URL` value accordingly.

## 4. Rebuild and Deploy the Frontend

Run the build command:

```bash
npm run build
```

The built files will be in the `dist` directory. Deploy these files to your web hosting service.

## 5. Testing the Application

1. Open your application in a web browser
2. Click the Google Login button
3. Complete the Google authentication process
4. Verify that you're properly logged in

## Troubleshooting Common Issues

### 1. Cross-Origin Warnings

The "Cross-Origin-Opener-Policy policy would block the window.closed call" warnings in the console are normal with Google Auth and don't affect functionality. These warnings occur because Google's authentication popup uses a different origin.

### 2. 404 Errors 

If you still get 404 errors:

- Ensure your Apps Script is deployed as a web app with the correct permissions
- Verify the `VITE_GAS_WEB_APP_URL` is correct in your `.env` file
- Check that you've added the `doPost` function to your `Code.gs` file
- Deploy a new version after making any changes

### 3. Authentication Failures

If authentication completes but user data isn't returned:

- Verify the user's email exists in your Users sheet
- Check the browser console for specific error messages
- Enable verbose API logging by setting `VITE_VERBOSE_API=true` in your `.env` file

### 4. Deployment Issues

If you get an error when trying to deploy your Apps Script:

1. Check that you have the necessary permissions
2. Try closing and reopening the Apps Script editor
3. If you get a "Script ID not found" error, check your Google Drive permissions

### 5. Testing in Development

During development with `npm run dev`:

- The proxy in `vite.config.js` should be correctly configured to forward API calls to your deployed Apps Script
- Any Cross-Origin Resource Sharing (CORS) issues should be handled by the proxy