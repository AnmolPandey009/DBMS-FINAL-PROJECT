const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing Blood Bank API...');
    
    // Test health endpoint
    const healthResponse = await fetch('http://localhost:5000/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test signup endpoint
    const signupData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      full_name: 'Test User',
      phone: '+1234567890',
      role: 'staff'
    };
    
    const signupResponse = await fetch('http://localhost:5000/api/users/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupData),
    });
    
    const signupResult = await signupResponse.json();
    console.log('✅ Signup test:', signupResult);
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

// Wait a bit for server to start, then test
setTimeout(testAPI, 3000);
