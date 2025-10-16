# Quickstart (2 minutes)

1) **Apps Script backend**
   - Open Google Apps Script → New project.
   - Create two files and paste from this repo:
     - `Appscript/Code.gs` (entire file)
     - `Appscript/CorsHandler.gs` (entire file)
   - Deploy → **New deployment** → type **Web app** → *Execute as: Me*, *Who has access: Anyone*.
   - Copy the deployment URL.

2) **Frontend env**
   - Copy `.env.example` to `.env`.
   - Set:
     - `VITE_GAS_WEB_APP_URL` = the URL you copied above
     - `VITE_GOOGLE_CLIENT_ID` = your OAuth client id (Web) from Google Cloud
     - (optional) `VITE_GAS_PROXY_TARGET` = same as `VITE_GAS_WEB_APP_URL` for local dev

3) **Run**
   ```bash
   npm install
   npm run dev  # or: npm run build && npm run preview
   ```

All API routes call your Apps Script backend; CORS is handled in `CorsHandler.gs`.
