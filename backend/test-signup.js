// Using built-in fetch (Node.js 18+)

async function testSignup() {
  try {
    console.log('🧪 Testing Blood Bank Signup API...');
    
    const signupData = {
      username: 'testuser' + Date.now(),
      email: 'test' + Date.now() + '@example.com',
      password: 'password123',
      full_name: 'Test User',
      phone: '1234567890',
      role: 'staff'
    };
    
    console.log('📤 Sending signup request:', signupData);
    
    const response = await fetch('http://localhost:5000/api/users/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupData)
    });
    
    console.log('📥 Response status:', response.status);
    
    const data = await response.json();
    console.log('📋 Response data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Signup test PASSED!');
      console.log('🎉 User created successfully with token:', data.data.token ? 'Yes' : 'No');
    } else {
      console.log('❌ Signup test FAILED!');
      console.log('Error:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testSignup();
