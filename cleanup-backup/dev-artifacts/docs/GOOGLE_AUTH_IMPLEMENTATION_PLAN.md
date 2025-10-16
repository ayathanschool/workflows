# Google Authentication Implementation Plan

This document provides a step-by-step plan to fix the Google authentication issues in the SchoolFlow application.

## Implementation Steps

1. **Backup Current Files**
   - Make copies of these files before modifying them:
     - `Appscript/Code.gs`
     - `src/contexts/GoogleAuthProvider.jsx`
     - `src/api.js`

2. **Update Backend (Google Apps Script)**
   - Replace `Appscript/Code.gs` with the fixed version:
     - Copy content from `Code.gs.fixed` to `Code.gs`
     - This contains the unified `doPost` handler and improved `_handleGoogleLogin` function

3. **Update Frontend Authentication Provider**
   - Replace `src/contexts/GoogleAuthProvider.jsx` with the fixed version:
     - Copy content from `GoogleAuthProvider.jsx.fixed` to `GoogleAuthProvider.jsx`
     - This implements proper popup handling and multiple authentication methods

4. **Update API Layer**
   - Replace `src/api.js` with the fixed version:
     - Copy content from `api.js.fixed` to `src/api.js`
     - This includes improved error handling and fallback mechanisms

5. **Deploy Updated Backend**
   - In Google Apps Script editor:
     - Deploy > Manage deployments
     - Edit > New version
     - Deploy (keep the same deployment ID if possible)

6. **Update Environment Variables**
   - Ensure `.env` file contains:
     ```
     VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
     VITE_GAS_WEB_APP_URL=your-script-deployment-url
     ```

7. **Test Implementation**
   - Clear browser cache and cookies
   - Run the application in development mode
   - Test login flow and verify successful authentication

## File Changes Summary

### 1. `Appscript/Code.gs`
- Fixed duplicate function definitions
- Enhanced token handling and validation
- Improved error logging
- Consolidated POST handler

### 2. `src/contexts/GoogleAuthProvider.jsx`
- Updated to use implicit flow
- Added proper popup configuration
- Implemented user info fetching from Google
- Enhanced error handling

### 3. `src/api.js`
- Improved token handling and authentication payloads
- Added fallback mechanisms
- Better error messaging

## Verification Checklist

After implementation, verify the following:

- [ ] Application loads without console errors
- [ ] Google login button works without COOP warnings
- [ ] Authentication completes successfully
- [ ] User roles are correctly assigned after login
- [ ] Protected routes are accessible after authentication

## Rollback Plan

If issues persist after implementation:

1. Restore the backed-up files
2. Re-deploy the original backend code
3. Clear browser cache and test again
4. Consider implementing one change at a time to isolate the issue

## Documentation

Refer to these files for detailed information:
- `GOOGLE_AUTH_SETUP.md` - Complete setup instructions
- `GOOGLE_AUTH_TROUBLESHOOTING.md` - Detailed troubleshooting guide