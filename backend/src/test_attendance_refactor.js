/**
 * SBTET Attendance Pipeline & Contract Test Script
 */

async function runAttendanceTests() {
  console.log('\n========================================================================');
  console.log(' SBTET ATTENDANCE PIPELINE & DAY-CENTRIC API CONTRACT VERIFICATION    ');
  console.log('========================================================================\n');

  try {
    const res = await fetch('http://localhost:5000/api/student/attendance?pin=24259-CS-025');
    const data = await res.json();

    console.log('HTTP Status:', res.status);
    console.log('Payload Success:', data.success);
    console.log('Student PIN:', data.pin);
    console.log('Aggregate Percentage:', data.aggregatePercentage + '%');
    console.log('Eligibility Status:', data.eligibilityStatus);
    console.log('Days Metrics:', data.metrics);
    console.log('Calendar Items Count:', data.calendar?.length);
    console.log('Sample Calendar Entry:', data.calendar?.[0]);

    if (
      data.success &&
      data.metrics &&
      typeof data.metrics.daysPresent === 'number' &&
      typeof data.metrics.daysAbsent === 'number' &&
      typeof data.metrics.totalWorkingDays === 'number' &&
      typeof data.metrics.leftWorkingDays === 'number' &&
      Array.isArray(data.calendar)
    ) {
      console.log('\n ✓ PASS: Attendance API Contract 100% Validated!');
    } else {
      console.error('\n ✗ FAIL: Contract mismatch');
    }
  } catch (e) {
    console.error('Error during test:', e.message);
  }

  console.log('========================================================================\n');
}

runAttendanceTests().catch(console.error);
