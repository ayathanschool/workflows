# SchoolFlow Deployment Summary

## 📋 Changes Made

### Cleanup Tasks:
- ✅ Removed duplicate API files (`api.js.fixed`, `api.enhanced.js`) to avoid confusion
- ✅ Moved test, mock, and debug files to a `dev-artifacts` folder for reference
- ✅ Configured proper environment variables in `.env` and `.env.production`
- ✅ Created a utils library for date formatting functions

### Added Features:
- ✅ Added time display to teacher timetable (Period numbers now show the actual time)
- ✅ Improved date formatting for better readability

### Code Improvements:
- ✅ Refactored duplicate date utility functions into `dateUtils.js`
- ✅ Verified build process completes successfully

## 🚀 Deployment Instructions

1. Ensure your Google Apps Script backend is properly deployed:
   - Verify the URL in `.env.production` points to your script
   - Make sure the correct Google Client ID is set

2. Deploy the frontend on Vercel (recommended):
    - Ensure `vercel.json` exists at repo root (already added) with SPA routing.
    - Commit and push your repo to GitHub/GitLab/Bitbucket.
    - In Vercel:
       - New Project → Import your repo
       - Framework preset: Vite (auto-detected)
       - Build command: `npm run build`
       - Output directory: `dist`
       - Environment Variables → add:
          - `VITE_GAS_WEB_APP_URL` = your Apps Script Web App URL (ends with `/exec`)
       - Deploy
    - Verification:
       - Visit the deployed URL → Login → open School Calendar → Create
       - Class/Subject dropdowns should populate for HM users

    Alternative hosts (optional):
    ```bash
    # Build locally
    npm run build

    # Netlify (requires Netlify CLI)
    npx netlify deploy --prod --dir=dist

    # Vercel (manual push of dist)
    npx vercel --prod dist
    ```

3. Configure your OAuth:
   - Add your production domain to Google OAuth authorized JavaScript origins
   - Update CORS settings in the Apps Script if needed

## 🔍 Troubleshooting

If you encounter issues:
1. Check browser console for errors
2. Verify backend (Apps Script) is accessible
3. Test API endpoints directly
4. Ensure OAuth is properly configured for your domain

## 📝 Notes


For additional assistance, refer to the documentation in the README.md file.

## 🌐 Deploy using only GitHub (GitHub Pages)

You can deploy the app with GitHub Actions and GitHub Pages (no Vercel required).

1) Add repository secrets (Settings → Secrets and variables → Actions):
   - VITE_GAS_WEB_APP_URL: Your Apps Script Web App URL ending with /exec
   - VITE_GOOGLE_CLIENT_ID: Your Google OAuth Web Client ID

2) Ensure the workflow exists at `.github/workflows/deploy-gh-pages.yml` (already added):
   - It builds with the correct Vite base path (handles username.github.io vs repo subpath)
   - Copies `index.html` to `404.html` for SPA routing on GitHub Pages

3) Enable Pages:
   - Settings → Pages → Source: GitHub Actions

4) Deploy:
   - Push to the `main` branch (or run the workflow via Actions → "Deploy to GitHub Pages")

5) URL:
   - If the repository is `username.github.io`, the URL is `https://username.github.io/`
   - Otherwise the URL is `https://username.github.io/<repo>/`

Notes:
- Make sure your Apps Script CORS allows the Pages origin.
- Update Google OAuth "Authorized JavaScript origins" to include your Pages URL.