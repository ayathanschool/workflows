@echo off
echo ===============================
echo SchoolFlow Apps Script Updater
echo ===============================
echo This script helps update your Apps Script backend with the latest code.

echo.
echo Step 1: Opening deployment guide...
start APPS_SCRIPT_DEPLOYMENT.md

echo.
echo Step 2: Opening Apps Script updated file for copying...
start Appscript\Code.gs.updated

echo.
echo Step 3: Opening Google Apps Script in browser...
start https://script.google.com/home

echo.
echo Instructions:
echo 1. Copy the contents of Code.gs.updated
echo 2. Paste into your Apps Script editor
echo 3. Deploy as a new version (see APPS_SCRIPT_DEPLOYMENT.md)
echo 4. Copy the deployment URL and update your .env file if needed
echo.
echo Done! Follow the deployment guide for detailed steps.