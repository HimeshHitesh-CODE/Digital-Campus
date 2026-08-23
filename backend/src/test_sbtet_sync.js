/**
 * Test SBTET Live Sync & Mathematical Schema Mapping
 */

async function runSbtetSyncTests() {
  console.log('\n========================================================================');
  console.log(' TELANGANA SBTET LIVE ATTENDANCE PIPELINE & UI MAPPING VERIFICATION   ');
  console.log('========================================================================\n');

  // Test 1: Harshika (24259-CS-055) - Exact prompt values
  try {
    console.log('[TEST 1] Testing Live Sync for 24259-CS-055 (Harshika)...');
    const res1 = await fetch('http://localhost:5000/api/student/attendance/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: '24259-CS-055', force: true }),
    });
    const data1 = await res1.json();

    console.log('HTTP Status:', res1.status);
    console.log('Aggregate Percentage:', data1.aggregatePercentage + '% (Expected: 31.25%)');
    console.log('Eligibility Status:', data1.eligibilityStatus + ' (Expected: DETAINED)');
    console.log('Days Present:', data1.metrics.daysPresent + ' (Expected: 20)');
    console.log('Days Absent:', data1.metrics.daysAbsent + ' (Expected: 44)');
    console.log('Total Working Days:', data1.metrics.totalWorkingDays + ' (Expected: 64)');
    console.log('Left Working Days:', data1.metrics.leftWorkingDays + ' (Expected: 26)');
    console.log('Half Day / Biometric Error Count:', data1.metrics.errorCount);
    console.log('Calendar Days Generated:', data1.calendar.length);

    if (
      data1.aggregatePercentage === 31.25 &&
      data1.metrics.daysPresent === 20 &&
      data1.metrics.daysAbsent === 44 &&
      data1.metrics.totalWorkingDays === 64 &&
      data1.metrics.leftWorkingDays === 26 &&
      data1.eligibilityStatus === 'DETAINED'
    ) {
      console.log(' ✓ PASS: Harshika (24259-CS-055) exact mathematical mapping verified 100%!\n');
    } else {
      console.error(' ✗ FAIL: Mathematical values did not match expected specification.');
    }
  } catch (e) {
    console.error(' ✗ ERROR Test 1:', e.message);
  }

  // Test 2: K. Himesh (24259-CS-025) - Good Standing
  try {
    console.log('[TEST 2] Testing Live Sync for 24259-CS-025 (K. Himesh)...');
    const res2 = await fetch('http://localhost:5000/api/student/attendance/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: '24259-CS-025', force: true }),
    });
    const data2 = await res2.json();

    console.log('Aggregate Percentage:', data2.aggregatePercentage + '%');
    console.log('Eligibility Status:', data2.eligibilityStatus + ' (Expected: CLEARED)');
    console.log('Days Present:', data2.metrics.daysPresent);
    console.log('Total Working Days:', data2.metrics.totalWorkingDays);

    if (data2.aggregatePercentage >= 75 && data2.eligibilityStatus === 'CLEARED') {
      console.log(' ✓ PASS: K. Himesh (24259-CS-025) Good Standing verified!\n');
    } else {
      console.error(' ✗ FAIL: Expected CLEARED status.');
    }
  } catch (e) {
    console.error(' ✗ ERROR Test 2:', e.message);
  }

  console.log('========================================================================\n');
}

runSbtetSyncTests().catch(console.error);
