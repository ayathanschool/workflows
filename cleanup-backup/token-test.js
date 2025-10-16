// token-test.js - Utility to test token validation against Google's tokeninfo endpoint
const token = process.argv[2];

if (!token) {
  console.error('Usage: node token-test.js YOUR_TOKEN_HERE');
  process.exit(1);
}

async function testToken() {
  try {
    // Test ID token validation
    console.log('Testing as ID token...');
    let url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(token);
    let response = await fetch(url);
    let status = response.status;
    let body = await response.text();
    
    console.log('ID token validation status:', status);
    console.log('ID token validation response:', body);
    
    if (status === 200) {
      console.log('✅ Token is valid as ID token');
      try { console.log('Token payload:', JSON.parse(body)); } catch (e) {}
      return;
    }
    
    // Test access token validation
    console.log('\nTesting as access token...');
    url = 'https://oauth2.googleapis.com/tokeninfo?access_token=' + encodeURIComponent(token);
    response = await fetch(url);
    status = response.status;
    body = await response.text();
    
    console.log('Access token validation status:', status);
    console.log('Access token validation response:', body);
    
    if (status === 200) {
      console.log('✅ Token is valid as access token');
      try { console.log('Token payload:', JSON.parse(body)); } catch (e) {}
      return;
    }
    
    console.log('\n❌ Token validation failed for both ID token and access token');
  } catch (error) {
    console.error('Error testing token:', error);
  }
}

testToken();