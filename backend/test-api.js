const API_URL = 'http://127.0.0.1:3001/api';

async function runTest() {
  console.log('🧪 Starting API Test...\n');

  // 1. Sign up a new user
  console.log('1️⃣ Testing Signup (POST /auth/signup)...');
  
  // Using a random email so we don't get 'already registered' errors on multiple runs
  const randomNum = Math.floor(Math.random() * 10000);
  const testEmail = `farmer${randomNum}@example.com`;
  
  const signupPayload = {
    email: testEmail,
    password: 'Password123!',
    full_name: 'John the Farmer',
    role: 'farmer',
    location: 'Iowa'
  };

  const signupRes = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(signupPayload)
  });

  const signupData = await signupRes.json();
  
  if (!signupData.success) {
    console.error('❌ Signup failed:', signupData.error);
    return;
  }
  
  console.log('✅ Signup successful!');
  console.log('   User ID:', signupData.data.user.id);
  console.log('   Email:', signupData.data.user.email);
  
  const token = signupData.data.session.access_token;
  console.log('\n   Got Access Token!');

  // 2. Fetch the user's profile using the token
  console.log('\n2️⃣ Testing Profile Fetch (GET /auth/me)...');
  
  const meRes = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const meData = await meRes.json();
  
  if (!meData.success) {
    console.error('❌ Fetching profile failed:', meData.error);
    return;
  }

  console.log('✅ Profile fetched successfully!');
  console.log('   Profile Data:', meData.data);
  
  console.log('\n🎉 All tests passed! The backend is working perfectly.');
}

runTest();
