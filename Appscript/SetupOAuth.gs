/**
 * Set up the necessary script properties for Google OAuth
 * Run this function once from the Apps Script editor after deployment
 */
function setupOAuthProperties() {
  // IMPORTANT: Replace this with your actual client secret from Google Cloud Console
  const GOOGLE_CLIENT_SECRET = 'YOUR_CLIENT_SECRET_HERE';
  
  // Store in script properties
  PropertiesService.getScriptProperties().setProperty('GOOGLE_CLIENT_SECRET', GOOGLE_CLIENT_SECRET);
  
  return 'OAuth properties have been set successfully!';
}