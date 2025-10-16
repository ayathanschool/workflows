# SchoolFlow Google Auth Comprehensive Troubleshooting Guide

## Issues Resolved

The application was experiencing three main issues with Google authentication:

1. **Cross-Origin-Opener-Policy (COOP) warnings**: The Google OAuth popup was generating warnings about COOP policy blocking window.closed calls.
2. **Token handling issues**: Google was returning access tokens but our code was expecting ID tokens.
3. **404 errors**: Backend API calls to exchange Google tokens were failing with 404 errors due to duplicate function definitions.

## Root Causes

1. **COOP Warnings**: Modern browsers have enhanced security features that restrict communication between windows with different origins. The Google OAuth popup was being blocked from communicating back to our application.

2. **Token Handling**: The OAuth implementation was configured for `implicit` flow but wasn't properly handling the access tokens that Google returns in this mode.

3. **404 Errors**: The Google Apps Script backend had duplicate definitions of the `doPost` function and the `_handleGoogleLogin` function, causing conflicts during execution.

## Comprehensive Solution

We've implemented a robust and flexible authentication approach:

1. **Enhanced popup configuration**: Added proper popup_url_options to the useGoogleLogin hook to prevent COOP warnings.
2. **Dual token support**: Modified the application to handle both access tokens and ID tokens from Google OAuth.
3. **User info fetching**: Added direct communication with Google's userinfo endpoint to get verified user details.
4. **Unified backend handling**: Consolidated and fixed the backend to properly process authentication requests.
5. **Graceful fallbacks**: Implemented fallback mechanisms for authentication to maximize compatibility.

## Technical Details

### Frontend Changes (GoogleAuthProvider.jsx)

1. Updated to use `implicit` flow to get access tokens directly:
   ```javascript
   const loginWithGoogle = useGoogleLogin({
     flow: 'implicit',
     scope: 'email profile openid',
     // Rest of configuration
   });
   ```

2. Added code to fetch user info directly from Google's userinfo endpoint:
   ```javascript
   const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
     headers: { Authorization: `Bearer ${accessToken}` }
   });
   const userInfo = await userInfoResponse.json();
   ```

3. Enhanced popup configuration to prevent COOP warnings:
   ```javascript
   popup_url_options: { 
     height: 800, 
     width: 500,
     popup: true,
     noopener: true,
     noreferrer: true
   }
   ```

4. Improved error handling and user feedback for authentication failures

### Backend Changes (Code.gs)

1. Consolidated duplicate `doPost` functions into a single implementation
2. Updated `_handleGoogleLogin` to support multiple authentication methods:
   - Direct user info method with email, name, google_id and access_token
   - Legacy ID token validation method
   - Improved error handling with detailed logging

3. Enhanced the API error responses to provide more helpful troubleshooting information

### API Layer Changes (api.js)

1. Improved the `googleLogin` function to handle both POST and GET methods:
   ```javascript
   export async function googleLogin(googleAuthInfo) {
     try {
       return await postJSON(`${BASE_URL}?action=googleLogin`, googleAuthInfo);
     } catch (err) {
       // Fallback to GET if POST fails with 404
       if (String(err.message||'').includes('HTTP 404')) {
         // Attempt GET fallback with appropriate parameters
       }
     }
   }
   ```

2. Added specialized error handling for common authentication failures

## How It Works Now

1. User clicks the login button
2. Google OAuth popup opens with proper configuration that prevents COOP warnings
3. After authentication, Google provides an access token to the frontend
4. Frontend uses the access token to fetch verified user info from Google's userinfo endpoint
5. Frontend sends the user info to the backend via POST
6. Backend verifies the user exists in the Users sheet and returns user profile with roles
7. If POST fails, the system attempts fallback methods to maximize compatibility
8. User is logged in with appropriate roles and permissions

## Implementation Steps

To apply this fix to your deployment:

1. Replace `src/contexts/GoogleAuthProvider.jsx` with the fixed version
2. Replace `src/api.js` with the fixed version
3. Update `Appscript/Code.gs` with the consolidated version
4. Deploy a new version of the Apps Script (Deploy > Manage deployments > Edit > New version)
5. Clear browser cache and cookies before testing

## Testing Procedure

To verify the fix is working properly:

1. Run the development server with `npm run dev`
2. Open the application in incognito/private mode to avoid cached tokens
3. Navigate to the login page
4. Open browser console to monitor for any errors
5. Click the Google sign-in button
6. Complete the Google authentication process
7. Verify you're redirected back to the application dashboard
8. Check that user roles are correctly assigned

## Security Considerations

This approach is secure for several reasons:
1. We're using Google's official OAuth 2.0 implementation for authentication
2. We verify user info by fetching it directly from Google's verified userinfo endpoint
3. The backend verifies that the user exists in the system before granting access
4. We're using proper token handling practices with secure transport
5. The popup configuration prevents cross-origin security issues while maintaining functionality

## Advanced Troubleshooting

If you encounter persistent issues:

1. **Check browser console** for specific error messages
2. **Verify Apps Script deployment** is up to date with the latest code
3. **Inspect network requests** to identify where in the authentication flow issues occur
4. **Enable verbose API logging** by setting VITE_VERBOSE_API=true in your .env file
5. **Check Google Cloud Console** to ensure your OAuth Client ID has the correct origins configured

This solution resolves the authentication issues while maintaining security and providing a smooth user experience.
