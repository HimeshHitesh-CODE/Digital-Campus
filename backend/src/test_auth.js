/**
 * Automated Verification Script for Pre-Seeded Students and HOD Vamshi Krishna
 */

const credentialsToTest = [
  { identity: '24259-CS-025', password: 'Himesh@259', expectedName: 'K. Himesh', role: 'STUDENT' },
  { identity: '24259-CS-023', password: 'Shankum@259', expectedName: 'P. Shankum', role: 'STUDENT' },
  { identity: '24259-CS-055', password: 'Harshika@259', expectedName: 'Harshika', role: 'STUDENT' },
  { identity: '24259-CS-036', password: 'Bindu@259', expectedName: 'Bindu', role: 'STUDENT' },
  { identity: '24259-CS-031', password: 'Abhilash@259', expectedName: 'Abhilash', role: 'STUDENT' },
  { identity: 'HOD-CSE-259', password: 'Vamshi@259', expectedName: 'Prof. Vamshi Krishna', role: 'HOD' },
  { identity: 'VAMSHI-HOD', password: 'Vamshi@259', expectedName: 'Prof. Vamshi Krishna', role: 'HOD' },
];

async function runTests() {
  console.log('\n================================================================');
  console.log(' SAMSKRUTI COLLEGE - PRE-SEEDED STUDENTS & HOD LOGIN TESTS     ');
  console.log('================================================================\n');

  let passed = 0;

  for (const cred of credentialsToTest) {
    try {
      const res = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: cred.identity, password: cred.password }),
      });
      const data = await res.json();

      if (res.status === 200 && data.success && data.user.name === cred.expectedName) {
        console.log(`[PASS] ID: ${cred.identity.padEnd(14)} | Pwd: ${cred.password.padEnd(13)} | User: ${data.user.name} (${data.user.role})`);
        passed++;
      } else {
        console.error(`[FAIL] ID: ${cred.identity} | Status: ${res.status} | Data:`, data);
      }
    } catch (e) {
      console.error(`[ERROR] ID: ${cred.identity}:`, e.message);
    }
  }

  console.log(`\nResults: ${passed} / ${credentialsToTest.length} credentials tested successfully.`);
  console.log('================================================================\n');
}

runTests().catch(console.error);
