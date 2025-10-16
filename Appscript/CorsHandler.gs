/**
 * CORS Handler for SchoolFlow
 * 
 * This file contains the necessary functions to enable Cross-Origin Resource Sharing (CORS)
 * which allows the frontend to communicate with the Google Apps Script backend.
 */

/**
 * Handle OPTIONS requests for CORS preflight
 * This is required for modern browsers to make cross-origin POST requests
 */
function doOptions(e) {
  // Log the options request for debugging
  Logger.log("Handling OPTIONS request");
  
  // Return proper CORS headers to allow the frontend to communicate with this script
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader('Access-Control-Allow-Origin', '*')  // Allow requests from any origin
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')  // Allow these HTTP methods
    .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')  // Allow these headers
    .setHeader('Access-Control-Max-Age', '3600')  // Cache preflight response for 1 hour
    // Add Cross-Origin-Opener-Policy header to allow popup communication
    .setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups')
    // Add Cross-Origin-Resource-Policy header to further enhance compatibility
    .setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
}

/**
 * Create a ContentService response with CORS headers
 * This creates a new response with CORS headers (we can't add headers to existing responses)
 */
function createCorsResponse(content, mimeType) {
  return ContentService.createTextOutput(content)
    .setMimeType(mimeType)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    // Add Cross-Origin-Opener-Policy header to allow popup communication
    .setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups')
    // Add Cross-Origin-Resource-Policy header to further enhance compatibility
    .setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
}

/**
 * Create a JSON response with CORS headers
 * This is a utility function to create a properly formatted JSON response with CORS headers
 */
function jsonResponse(data) {
  return createCorsResponse(
    JSON.stringify(data),
    ContentService.MimeType.JSON
  );
}

/**
 * Create an error response with CORS headers
 */
function errorResponse(message, code = 400) {
  return jsonResponse({
    error: message,
    code: code,
    timestamp: new Date().toISOString()
  });
}

/**
 * Legacy compatibility function (in case there are existing references)
 */
function addCorsHeaders() {
  Logger.log("Warning: addCorsHeaders is deprecated. Use createCorsResponse or jsonResponse instead.");
  throw new Error("addCorsHeaders is not supported. Use createCorsResponse or jsonResponse instead.");
}