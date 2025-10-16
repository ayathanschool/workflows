# SchoolFlow Google Login Deployment Guide

This guide walks you through fixing the Google Login issues in your SchoolFlow application.

## 1. Update Your Google Apps Script Backend

### Option A: Minimally Invasive Update (Recommended)

1. Open your Google Apps Script project at [script.google.com](https://script.google.com)
2. Open your existing `Code.gs` file
3. Add these functions if they don't exist:
   - `_parsePost(e)` - Parses POST request data 
   - `_handleGoogleLogin(payload)` - Processes Google OAuth tokens

4. Update your `doGet` function to include the Google Login fallback:
   ```javascript
   // Near the end of your doGet function, before the final return statement:
   
   // Fallback GET handler for googleLogin (primarily for troubleshooting / legacy)
   if (action === 'googleLogin' && e.parameter.idToken) {
     return _handleGoogleLogin({ idToken: e.parameter.idToken });
   }
   ```

5. Update your `doPost` function (or add it if missing):
   ```javascript
   function doPost(e) {
     const action = (e.parameter.action || '').trim();
     const data = _parsePost(e);
     try {
       _bootstrapSheets();
       
       // Handle Google login via POST
       if (action === 'googleLogin') {
         return _handleGoogleLogin(data);
       }
       
       // Your existing doPost handlers...
       
       return _respond({ error: 'Unknown POST action' });
     } catch (err) {
       return _respond({ error: String(err && err.message ? err.message : err) });
     }
   }
   ```

See the full code in `Appscript/GOOGLE_LOGIN_FIX.gs` for reference.

### Option B: Replace Entire File

If you prefer to replace the entire file and you don't have many custom functions:

1. Copy the contents of `Appscript/GOOGLE_LOGIN_FIX.gs`
2. Review it to ensure it includes all your existing functionality
3. Replace your `Code.gs` file contents with it

## 2. Deploy a New Version

1. In the Google Apps Script editor, click **Deploy > New deployment**
2. Select **Web app** as the deployment type
3. Set **Execute as:** to your account
4. Set **Who has access:** to the appropriate level (usually "Anyone" or "Anyone with Google Account")
5. Click **Deploy**
6. Copy the deployment URL (it should end with `/exec`)

## 3. Update Your Frontend Environment

1. Create or edit the `.env` file in your frontend project:
   ```
   VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
   VITE_GAS_WEB_APP_URL=YOUR_NEW_DEPLOYMENT_URL_HERE
   ```
   
   Replace:
   - `YOUR_GOOGLE_CLIENT_ID_HERE` with your Google OAuth Client ID
   - `YOUR_NEW_DEPLOYMENT_URL_HERE` with the URL from step 2.6

## 4. Rebuild and Deploy Frontend

1. Run these commands to build your frontend:
   ```
   npm run build
   ```

2. Deploy the built files from the `dist` directory to your web hosting service

## 5. Testing

1. Open your application in a browser
2. Click the Google Login button
3. Verify that you're redirected to the Google login page
4. After logging in, verify that you're properly authenticated in your app

## Troubleshooting

If you still encounter issues:

1. Check browser console for errors
2. Verify your Google OAuth Client ID is correct
3. Ensure your Apps Script deployment URL is correct
4. Verify that your `doPost` function in Apps Script is properly handling the `googleLogin` action
5. Test the GET fallback by visiting your Apps Script URL directly with a test token

For additional help, refer to `GOOGLE_AUTH_TROUBLESHOOTING.md` in your project.