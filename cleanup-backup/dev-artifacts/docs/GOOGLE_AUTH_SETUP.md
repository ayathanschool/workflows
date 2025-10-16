# Google OAuth Setup Guide for SchoolFlow

## Overview

This guide explains how to set up Google OAuth authentication for the SchoolFlow application. The application uses Google OAuth for user authentication and supports both access tokens and ID tokens for secure authentication with the backend.

## Prerequisites

1. A Google Cloud Platform (GCP) account
2. A Google Cloud project with API access enabled
3. A Google Apps Script project linked to your spreadsheet
4. Basic understanding of OAuth 2.0 authentication flow

## Step 1: Configure OAuth in Google Cloud Console

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth Client ID"
5. Configure the OAuth consent screen:
   - User Type: External or Internal (depending on your organization)
   - App name: SchoolFlow
   - User support email: Your email
   - Developer contact information: Your email
6. Add the following scopes:
   - openid
   - email
   - profile
7. Save and continue
8. Create an OAuth client ID:
   - Application type: Web application
   - Name: SchoolFlow Web Client
   - Authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - `http://localhost:3000` (alternative development port)
     - Your production URL (if deployed)
   - Authorized redirect URIs:
     - `http://localhost:5173` (for development)
     - `http://localhost:3000` (alternative development port)
     - `postmessage` (required for @react-oauth/google)
     - Your production URL (if deployed)
9. Click "Create"
10. Note your Client ID - you'll need it for the frontend configuration

## Step 2: Configure the Frontend

1. Create a `.env` file in the frontend project root with your OAuth client ID and backend URL:

   ```
   VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   VITE_GAS_WEB_APP_URL=https://script.google.com/macros/s/your-deployment-id/exec
   ```

2. Make sure the required dependencies are installed:

   ```bash
   npm install @react-oauth/google
   ```

3. If you are replacing existing files, make sure to update:
   - `src/contexts/GoogleAuthProvider.jsx` with the fixed version
   - `src/api.js` with the fixed version that supports multiple authentication methods

4. For production, make sure your environment includes both environment variables during the build process

## Step 3: Configure Backend (Google Apps Script)

1. Open your Google Apps Script project linked to your SchoolFlow spreadsheet
2. Replace or update your `Code.gs` file with the fixed version that includes:
   - Unified `doPost` function
   - Enhanced `_handleGoogleLogin` function supporting multiple authentication methods
   - Proper error handling and logging

3. Deploy a new version of your Apps Script project:
   - Click Deploy > Manage deployments
   - Create new deployment or update existing one
   - Set access to "Anyone" or "Anyone with Google Account" depending on your requirements
   - Copy the Web app URL - this is what you'll use for VITE_GAS_WEB_APP_URL

4. Verify that the backend script has the necessary permissions:
   - It needs permission to access your spreadsheet
   - It needs permission to use UrlFetchApp to validate tokens

## Step 4: Test the Authentication Flow

1. Run the frontend in development mode:
   ```bash
   npm run dev
   ```

2. Open the application in your browser (ideally in incognito/private mode)
3. Click the Google sign-in button
4. Complete the authentication flow
5. Verify you can access protected areas of the application
6. Check browser console for any errors

## Authentication Flow Details

Our implementation uses the following authentication flow:

1. **Implicit flow** to obtain an access token directly from Google
2. Frontend fetches user info from Google's userinfo endpoint using the access token
3. Frontend sends the user info and access token to our backend
4. Backend verifies the user exists in our system and returns application-specific roles and permissions

This approach offers several advantages:
- Avoids COOP warnings in modern browsers
- Provides reliable authentication across different environments
- Maintains compatibility with our existing user management system

## Backend Configuration Details

The backend `_handleGoogleLogin` function now supports two authentication methods:

1. **Direct user info method** (preferred):
   - Frontend sends `{ email, name, picture, google_id, access_token }` to backend
   - Backend looks up the email in the Users sheet and returns roles

2. **ID token validation method** (legacy support):
   - Frontend sends `{ idToken }` to backend
   - Backend validates the token with Google's tokeninfo endpoint
   - Backend extracts email from the validated token and looks up user in Users sheet

## Advanced Configuration: Enhanced Security Options

### 1. Implementing Auth Code Flow (Optional)

For increased security in production environments:

1. In Google Cloud Console, create a client secret for your OAuth client ID
2. In Apps Script, store the client secret in script properties:
   ```javascript
   function setupOAuthSecret() {
     const CLIENT_SECRET = 'your-client-secret-here';
     PropertiesService.getScriptProperties().setProperty('GOOGLE_CLIENT_SECRET', CLIENT_SECRET);
     return 'OAuth client secret configured successfully!';
   }
   ```
3. Modify GoogleAuthProvider.jsx to use auth-code flow:
   ```javascript
   const loginWithGoogle = useGoogleLogin({
     flow: 'auth-code',
     scope: 'email profile openid',
     access_type: 'online',
     // Rest of configuration
   });
   ```
4. Update backend to handle authorization code exchange

### 2. Implementing Token Refresh (Optional)

For longer user sessions:

1. Add refresh token support in the OAuth configuration
2. Implement token refresh logic in the frontend
3. Modify the backend to handle token refreshes

## Troubleshooting

If you encounter authentication issues:

1. **Browser Console Errors**:
   - Check for CORS errors: Make sure your backend URL is properly configured
   - Look for token validation errors: These indicate issues with your OAuth setup

2. **Google OAuth Popup Issues**:
   - If popup doesn't open: Check for popup blockers
   - If popup closes immediately: Check for misconfigured OAuth client origins

3. **Backend Authentication Failures**:
   - Check Apps Script logs for token validation errors
   - Verify the user email exists in your Users sheet
   - Make sure your script has proper permissions to make external requests

4. **Deployment Issues**:
   - Always create a new deployment after updating your Apps Script code
   - Make sure your frontend is using the correct deployment URL

For more detailed troubleshooting steps, refer to `GOOGLE_AUTH_TROUBLESHOOTING.md`
