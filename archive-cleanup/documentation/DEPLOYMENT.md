# Deployment Notes

## Quick Deployment Options

### 1. Vercel (Recommended)
- Fork/clone this repository
- Connect to Vercel via GitHub
- Set environment variable: `VITE_GAS_WEB_APP_URL`
- Auto-deploy on push to main

### 2. Netlify
- Connect repository to Netlify
- Build command: `npm run build`
- Publish directory: `dist`
- Set environment variables in Netlify dashboard

### 3. GitHub Pages
- Enable GitHub Actions in repository
- Set `VITE_GAS_WEB_APP_URL` in repository secrets
- Push to main branch to trigger deployment

## Prerequisites

1. **Google Apps Script Setup:**
   - Deploy your Code.gs as a web app
   - Set permissions: "Execute as: Me", "Who has access: Anyone"
   - Copy the web app URL for environment variables

2. **Environment Variables:**
   - Copy `.env.production.example` to `.env.production`
   - Update `VITE_GAS_WEB_APP_URL` with your actual web app URL

3. **CORS Configuration:**
   - Ensure your Google Apps Script has proper CORS headers
   - The current code includes CORS handling in the `jsonResponse` function

## Testing Deployment

1. Build locally first: `npm run build`
2. Serve locally: `npm run preview`
3. Test all functionality before deploying
4. Verify API endpoints are accessible

## Mobile Considerations

- The app is responsive and works on mobile devices
- Test thoroughly on mobile browsers
- Consider PWA features for mobile app-like experience

## Monitoring

- Check deployment logs for any build errors
- Monitor API calls to Google Apps Script
- Set up error tracking if needed