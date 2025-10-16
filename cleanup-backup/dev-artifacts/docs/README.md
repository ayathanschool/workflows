# SchoolFlow - Production Deployment Guide

This document outlines the steps to deploy the SchoolFlow application to production.

## Project Structure

The SchoolFlow application consists of:
- Frontend: React SPA with Vite
- Backend: Google Apps Script connected to Google Sheets

## Prerequisites

1. Node.js (v16+) and npm installed
2. Google account with access to Google Cloud Console and Google Apps Script
3. A Google Sheets document set up for data storage

## Step 1: Deploy the Backend

### Option 1: Using the update-backend.bat Script
1. Run `update-backend.bat` in the project root
2. Follow the instructions in the opened documents

### Option 2: Manual Deployment
1. Open `Appscript/Code.gs.updated`
2. Copy the content
3. Open [Google Apps Script](https://script.google.com/)
4. Create a new project
5. Paste the code into the Code.gs file
6. Replace the `SPREADSHEET_ID` value with your Google Sheet ID
7. Deploy as a web app:
   - Deploy > New deployment
   - Select "Web app" type
   - Execute as: You
   - Who has access: Anyone (or Anyone with Google account)
   - Click "Deploy"
   - Copy the provided URL (ends with `/exec`)

See `APPS_SCRIPT_DEPLOYMENT.md` for detailed backend deployment instructions.

## Step 2: Configure Environment Variables

Create or update the `.env` file in the project root:

```
# REQUIRED: Your deployed Google Apps Script Web App URL (must end with /exec)
VITE_GAS_WEB_APP_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

# REQUIRED: Google OAuth Web Client ID (from Google Cloud Console)
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com

# OPTIONAL: Enable verbose API logging in browser console during development
VITE_VERBOSE_API=false
```

## Step 3: Clean Up Development Files

Run the provided cleanup script to remove test and debug files:

```bash
cleanup.bat
```

This creates a backup of all removed files in a `cleanup-backup` folder.

## Step 4: Build for Production

Build the frontend:

```bash
npm run build
```

This creates a `dist` folder with static assets ready for deployment.

## Step 5: Deploy the Frontend

Deploy the `dist` directory to your preferred static hosting provider:

### Option 1: Netlify
```bash
npx netlify deploy --prod --dir=dist
```

### Option 2: Vercel
```bash
npx vercel --prod dist
```

### Option 3: GitHub Pages
Create a `.github/workflows/deploy.yml` file to automate deployment.

### Option 4: Any Static Hosting
Upload the contents of the `dist` directory to any static hosting provider.

## Step 6: Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Credentials
3. Edit your OAuth 2.0 Client ID
4. Add your production domain to "Authorized JavaScript origins"
5. Save changes

## Troubleshooting

### Backend Issues:
- Ensure the Apps Script is deployed as a web app
- Verify the URL in `.env` ends with `/exec`
- Check CORS settings if hosting on a different domain
- See `GOOGLE_AUTH_TROUBLESHOOTING.md` for authentication issues

### Frontend Issues:
- Verify environment variables are correctly set
- Check browser console for errors
- Clear browser cache after deployment

## Security Recommendations

1. Add domain restrictions in the Google OAuth verification
2. Implement token expiration checks
3. Consider more robust authentication mechanisms for production
4. Review the security implementation guide in `Appscript/README-Security.md`

## Updates and Maintenance

To update the application:
1. Make code changes
2. Update the backend Apps Script if needed
3. Run `npm run build` again
4. Redeploy the frontend

## Support

For additional help, consult the documentation in the `docs` directory or contact the system administrator.