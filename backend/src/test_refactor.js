/**
 * Comprehensive Automated Test Suite:
 * 1. Student Sign In via Email + Password
 * 2. 2-Step Registration with Anti-Spoofing Secret Key
 * 3. CS HOD Admin Login (Vamshi-CS-HOD)
 * 4. Password Recovery via Institutional Key
 */

async function runRefactorTests() {
  console.log('\n========================================================================');
  console.log(' SAMSKRUTI COLLEGE - AUTH REFACTOR & 2-STEP REGISTRATION TESTS        ');
  console.log('========================================================================\n');

  let passed = 0;
  let total = 6;

  // 1. Student Sign In via Registered Email
  try {
    console.log('[TEST 1] Testing Student Sign In via Email (k.himesh@samskruti.ac.in)...');
    const res1 = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'k.himesh@samskruti.ac.in', password: 'Himesh@259' }),
    });
    const data1 = await res1.json();
    if (res1.status === 200 && data1.success && data1.user.name === 'K. Himesh') {
      console.log(' ✓ PASS: Signed in as K. Himesh | PIN:', data1.user.sbtetPin);
      passed++;
    } else {
      console.error(' ✗ FAIL:', data1);
    }
  } catch (e) {
    console.error(' ✗ ERROR Test 1:', e.message);
  }

  // 2. CS HOD Login with Vamshi-CS-HOD and H-Gz25Do
  try {
    console.log('\n[TEST 2] Testing CS HOD Admin Login (Vamshi-CS-HOD / H-Gz25Do)...');
    const res2 = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'Vamshi-CS-HOD', password: 'H-Gz25Do' }),
    });
    const data2 = await res2.json();
    if (res2.status === 200 && data2.success && data2.user.role === 'HOD_CS') {
      console.log(' ✓ PASS: HOD Authenticated | Name:', data2.user.name, '| Role:', data2.user.role);
      passed++;
    } else {
      console.error(' ✗ FAIL:', data2);
    }
  } catch (e) {
    console.error(' ✗ ERROR Test 2:', e.message);
  }

  // 3. Step 1 Registration (New Student)
  try {
    console.log('\n[TEST 3] Testing Step 1 Profile Registration (24259-CS-088)...');
    const res3 = await fetch('http://localhost:5000/api/v1/auth/register-step1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pin: '24259-CS-088',
        firstName: 'Dev',
        lastName: 'Rao',
        branch: 'CS',
        scheme: 'C-24',
        semester: 3,
        email: 'dev.rao@samskruti.ac.in',
        password: 'Password@123',
      }),
    });
    const data3 = await res3.json();
    if (res3.status === 200 && data3.success) {
      console.log(' ✓ PASS: Step 1 Saved | Next Step:', data3.nextStep);
      passed++;
    } else {
      console.error(' ✗ FAIL:', data3);
    }
  } catch (e) {
    console.error(' ✗ ERROR Test 3:', e.message);
  }

  // 4. Step 2 Secret Key Verification - Invalid Key Attempt (Spoofing prevention)
  try {
    console.log('\n[TEST 4] Testing Step 2 with FAKE Security Key (Anti-Spoofing Check)...');
    const res4 = await fetch('http://localhost:5000/api/v1/auth/verify-secret-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pin: '24259-CS-088',
        email: 'dev.rao@samskruti.ac.in',
        secretKey: 'STD-FAKETOKEN',
      }),
    });
    const data4 = await res4.json();
    if (res4.status === 400 && data4.code === 'INVALID_SECRET_KEY') {
      console.log(' ✓ PASS: Rejected Fake Token | Message:', data4.message);
      passed++;
    } else {
      console.error(' ✗ FAIL (Expected 400 rejection):', data4);
    }
  } catch (e) {
    console.error(' ✗ ERROR Test 4:', e.message);
  }

  // 5. Step 2 Secret Key Verification - Valid Key Attempt
  try {
    console.log('\n[TEST 5] Testing Step 2 with Official Security Key (STD-XAz10F)...');
    const res5 = await fetch('http://localhost:5000/api/v1/auth/verify-secret-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pin: '24259-CS-088',
        email: 'dev.rao@samskruti.ac.in',
        secretKey: 'STD-XAz10F',
      }),
    });
    const data5 = await res5.json();
    if (res5.status === 201 && data5.success && data5.token) {
      console.log(' ✓ PASS: Account Activated | Issued JWT:', data5.token.slice(0, 20) + '...');
      passed++;
    } else {
      console.error(' ✗ FAIL:', data5);
    }
  } catch (e) {
    console.error(' ✗ ERROR Test 5:', e.message);
  }

  // 6. Forgot Password via Institutional Key
  try {
    console.log('\n[TEST 6] Testing Password Reset via Institutional Security Key...');
    const res6 = await fetch('http://localhost:5000/api/v1/auth/forgot-password-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'k.himesh@samskruti.ac.in',
        pin: '24259-CS-025',
        secretKey: 'STD-XAz10F',
        newPassword: 'Himesh@NewPass259',
      }),
    });
    const data6 = await res6.json();
    if (res6.status === 200 && data6.success) {
      console.log(' ✓ PASS: Password Reset Successful | Message:', data6.message);
      passed++;
    } else {
      console.error(' ✗ FAIL:', data6);
    }
  } catch (e) {
    console.error(' ✗ ERROR Test 6:', e.message);
  }

  console.log(`\n========================================================================`);
  console.log(` RESULTS: ${passed} / ${total} TESTS PASSED!`);
  console.log(`========================================================================\n`);
}

runRefactorTests().catch(console.error);
