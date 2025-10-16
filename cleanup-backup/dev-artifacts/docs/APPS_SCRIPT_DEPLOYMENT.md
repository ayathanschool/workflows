# Apps Script Deployment Guide

Follow these steps to properly deploy your Apps Script backend for the SchoolFlow app.

## Prerequisites
- Google account with access to Google Apps Script
- Your SchoolFlow spreadsheet already created

## Steps to Deploy

### 1. Copy the Code to Apps Script
1. Open [Google Apps Script](https://script.google.com/) in your browser
2. Create a new project named "SchoolFlow Backend"
3. Delete any existing code in the editor
4. Copy the full content of `Code.gs.updated` into the editor
5. Save the project (Ctrl+S or File > Save)

### 2. Configure Your Script

In the `Code.gs` file, update the SPREADSHEET_ID constant:

```javascript
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
```

Replace `YOUR_SPREADSHEET_ID_HERE` with your actual Google Sheet ID (the long string in the URL when viewing your spreadsheet).

### 3. Deploy as Web App

1. Click on "Deploy" > "New deployment"
2. Select "Web app" as the deployment type
3. Set the following options:
   - Description: "SchoolFlow API v1" (or any description you prefer)
   - Execute as: "Me" (your account)
   - Who has access: "Anyone" (for anonymous access) or "Anyone with Google account" (for extra security)
4. Click "Deploy"
5. **IMPORTANT**: Copy the provided URL - it should end with `/exec`
6. Authorize access when prompted

### 4. Update Your Frontend Environment

1. Open your `.env` file in the frontend project
2. Update the `VITE_GAS_WEB_APP_URL` with the URL you copied:
   ```
   VITE_GAS_WEB_APP_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```
   (replace `YOUR_SCRIPT_ID` with the actual ID from the copied URL)
3. Restart your development server

### 5. Update Existing Deployments

If you're updating an existing deployment:
1. In Apps Script, go to "Deploy" > "Manage deployments"
2. Find your current deployment and click the pencil icon to edit
3. Click "New version"
4. Click "Deploy"
5. Verify that the URL remains the same (this is important for your frontend config)

## Troubleshooting

### 404 Errors
If you're getting 404 errors when accessing the API:
1. Confirm you're using the correct URL ending with `/exec`
2. Make sure you've properly authorized the script
3. Check that the deployment is active and accessible
4. Try accessing the URL directly in your browser with `?action=ping` appended
5. If needed, redeploy the script and update your environment variables

### Cross-Origin Issues
The app uses a proxy during development to avoid CORS issues. In production:
1. Make sure your Apps Script is deployed as a web app
2. Verify the correct URL is configured in your production environment
3. The Apps Script must include `return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);` for proper CORS headers

## Advanced Configuration

### Setting Up Google OAuth
1. Configure your Google Cloud Platform project
2. Create OAuth credentials (Web application type)
3. Add your app's domain to authorized JavaScript origins
4. Copy the Client ID to your `.env` file as `VITE_GOOGLE_CLIENT_ID`

### Token Security
For production, consider implementing additional token validation:
1. Add domain restrictions in the `_handleGoogleLogin` function
2. Implement token expiry checks
3. Consider storing user sessions server-side
