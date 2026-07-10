const { getTOTP } = require('../services/totp');

const BASE_URL = 'http://localhost:5050/api';

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  const data = await response.json();
  if (!response.ok) {
    const err = new Error(data.message || 'Request failed');
    err.status = response.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function test2FA() {
  const email = `test_2fa_${Date.now()}@immunitrack.test`;
  const password = 'Password123!';
  const phone = `+25670000${Math.floor(100000 + Math.random() * 900000)}`;

  console.log('--- Step 1: Registering new user ---');
  let data = await request(`${BASE_URL}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({
      full_name: 'Test 2FA User',
      phone,
      email,
      password,
      preferred_reminder_method: 'in_app',
      role: 'caregiver'
    })
  });
  
  const token = data.token;
  const user = data.user;
  console.log(`Registered user: ${user.email}, ID: ${user.id}`);
  console.log('two_factor_enabled:', user.two_factor_enabled);
  if (user.two_factor_enabled !== false) throw new Error('2FA should be disabled by default');

  const authHeaders = { Authorization: `Bearer ${token}` };

  console.log('\n--- Step 2: Initiating 2FA setup ---');
  data = await request(`${BASE_URL}/auth/2fa/setup`, {
    method: 'POST',
    headers: authHeaders
  });
  const { secret, qrCodeUrl } = data;
  console.log('Generated Secret:', secret);
  console.log('QR Code API URL:', qrCodeUrl);
  if (!secret) throw new Error('Secret not returned in setup');

  console.log('\n--- Step 3: Verifying 2FA with invalid code (should fail) ---');
  try {
    await request(`${BASE_URL}/auth/2fa/verify`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ code: '000000' })
    });
    throw new Error('Verify should have failed with invalid code');
  } catch (err) {
    console.log('Success: Invalid code rejected as expected:', err.message);
  }

  console.log('\n--- Step 4: Verifying 2FA with correct code ---');
  const code = getTOTP(secret);
  console.log('Generated TOTP verification code:', code);
  data = await request(`${BASE_URL}/auth/2fa/verify`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ code })
  });
  console.log('Verification Response:', data.message);

  console.log('\n--- Step 5: Getting user profile to verify 2FA status ---');
  data = await request(`${BASE_URL}/auth/me`, {
    headers: authHeaders
  });
  console.log('two_factor_enabled in profile:', data.user.two_factor_enabled);
  if (data.user.two_factor_enabled !== true) throw new Error('2FA status in profile should be true');

  console.log('\n--- Step 6: Logging in (should trigger 2FA intercept) ---');
  data = await request(`${BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  console.log('Login response:', data);
  if (!data.two_factor_required || data.userId !== user.id) {
    throw new Error('Login should have returned two_factor_required and userId');
  }
  const userId = data.userId;

  console.log('\n--- Step 7: Verifying login 2FA with invalid code (should fail) ---');
  try {
    await request(`${BASE_URL}/auth/login/2fa`, {
      method: 'POST',
      body: JSON.stringify({ userId, code: '000000' })
    });
    throw new Error('Login 2FA verification should have failed');
  } catch (err) {
    console.log('Success: Login code rejected:', err.message);
  }

  console.log('\n--- Step 8: Verifying login 2FA with correct code ---');
  const loginCode = getTOTP(secret);
  console.log('Generated TOTP login code:', loginCode);
  data = await request(`${BASE_URL}/auth/login/2fa`, {
    method: 'POST',
    body: JSON.stringify({ userId, code: loginCode })
  });
  const loginToken = data.token;
  console.log('Successfully logged in! Token received:', loginToken ? 'Yes' : 'No');
  if (!loginToken) throw new Error('Token not received after 2FA login');

  const loginAuthHeaders = { Authorization: `Bearer ${loginToken}` };

  console.log('\n--- Step 9: Disabling 2FA ---');
  data = await request(`${BASE_URL}/auth/2fa/disable`, {
    method: 'POST',
    headers: loginAuthHeaders
  });
  console.log('Disable response:', data.message);

  console.log('\n--- Step 10: Logging in again (should bypass 2FA) ---');
  data = await request(`${BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  console.log('Direct login response user email:', data.user.email);
  console.log('Direct login token received:', data.token ? 'Yes' : 'No');
  if (!data.token) throw new Error('Token not received on direct login');
  if (data.user.two_factor_enabled !== false) throw new Error('2FA should be disabled now');

  console.log('\n====================================');
  console.log('ALL Two-Factor Authentication tests PASSED!');
  console.log('====================================');
}

test2FA().catch(err => {
  console.error('\nTest failed:', err.message);
  if (err.data) {
    console.error('Response data:', err.data);
  }
  process.exit(1);
});
