// Test FCM token generation directly with different configurations
const https = require('https');

// Test 1: Check if the Firebase project allows FCM token generation
const testFCMEndpoint = () => {
  const data = JSON.stringify({
    "web": {
      "applicationServerKey": "BJbhCDjg0hLxllQlzsveswOa1s5wN0sqRG7opcfI9UAP4UPMeztPd5gI1t1chiHpYbc0cmFB7ZvqvF02we4FSug",
      "auth": "test",
      "p256dh": "test"
    }
  });

  const options = {
    hostname: 'fcmregistrations.googleapis.com',
    port: 443,
    path: '/v1/projects/finance-to-dos/registrations',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'Authorization': 'key=AIzaSyD7aka6dAL8A-YWW4mxkD_9WsWUlh9dqrM'
    }
  };

  console.log('🧪 Testing FCM endpoint directly...');
  
  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', responseData);
      
      if (res.statusCode === 401) {
        console.log('❌ 401 Unauthorized - API key or project configuration issue');
      } else if (res.statusCode === 403) {
        console.log('❌ 403 Forbidden - Domain or app restrictions');
      } else {
        console.log('✅ FCM endpoint accessible');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request error:', error);
  });

  req.write(data);
  req.end();
};

testFCMEndpoint();