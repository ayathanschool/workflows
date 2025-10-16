/**
 * Test the OAuth2 code exchange
 * Run this from the Apps Script editor to verify your OAuth configuration
 */
function testOAuth2Exchange() {
  // Test values - replace with actual ones
  const authCode = '4/EXAMPLE_AUTH_CODE';
  const CLIENT_ID = '414597183450-3okhv6vrk0i28vkrrse8de4io2odu62r.apps.googleusercontent.com';
  const CLIENT_SECRET = PropertiesService.getScriptProperties().getProperty('GOOGLE_CLIENT_SECRET');
  
  if (!CLIENT_SECRET) {
    return "ERROR: No CLIENT_SECRET in script properties. Run setupOAuthProperties first.";
  }
  
  Logger.log("Testing OAuth2 code exchange with:");
  Logger.log("Client ID: " + CLIENT_ID);
  Logger.log("Client Secret: " + (CLIENT_SECRET ? "Found (not shown)" : "MISSING"));
  Logger.log("Auth Code (example): " + authCode);
  
  return {
    message: "This is a test function. In real usage, the code would be exchanged for tokens.",
    configStatus: CLIENT_SECRET ? "OAuth config ready" : "OAuth config missing",
    nextStep: "Deploy your script and test with the actual frontend application"
  };
}