/**
 * Batch Synchronization Test Script for All 180 CS Students (24259-CS-001 to 24259-CS-180)
 */

async function testSyncAll180Students() {
  console.log('\n========================================================================');
  console.log(' SYNCHRONIZING ALL 180 COMPUTER SCIENCE STUDENTS (001 TO 180)          ');
  console.log('========================================================================\n');

  let passedCount = 0;
  let clearedCount = 0;
  let condonationCount = 0;
  let detainedCount = 0;

  const sampleHighlights = [1, 23, 25, 31, 36, 55, 100, 150, 180];

  for (let i = 1; i <= 180; i++) {
    const padded = String(i).padStart(3, '0');
    const pin = `24259-CS-${padded}`;

    try {
      const res = await fetch(`http://localhost:5000/api/student/attendance/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, force: true }),
      });
      const data = await res.json();

      if (
        data.success &&
        data.pin === pin &&
        typeof data.aggregatePercentage === 'number' &&
        data.metrics &&
        data.metrics.daysPresent + data.metrics.daysAbsent === data.metrics.totalWorkingDays &&
        data.metrics.totalWorkingDays + data.metrics.leftWorkingDays === data.metrics.targetSemesterDays &&
        Array.isArray(data.calendar)
      ) {
        passedCount++;

        if (data.eligibilityStatus === 'CLEARED') clearedCount++;
        else if (data.eligibilityStatus === 'CONDONATION') condonationCount++;
        else if (data.eligibilityStatus === 'DETAINED') detainedCount++;

        if (sampleHighlights.includes(i)) {
          console.log(`✓ [PIN ${pin}] Aggregate: ${data.aggregatePercentage}% | Present: ${data.metrics.daysPresent}/${data.metrics.totalWorkingDays} | Left: ${data.metrics.leftWorkingDays} | Status: ${data.eligibilityStatus}`);
        }
      } else {
        console.error(`✗ FAIL on PIN ${pin}: Invalid data structure`);
      }
    } catch (e) {
      console.error(`✗ ERROR on PIN ${pin}:`, e.message);
    }
  }

  console.log('\n------------------------------------------------------------------------');
  console.log(`TOTAL STUDENTS TESTED  : 180`);
  console.log(`SUCCESSFULLY SYNCED    : ${passedCount} / 180`);
  console.log(`  - CLEARED (≥75%)     : ${clearedCount}`);
  console.log(`  - CONDONATION (65-74%): ${condonationCount}`);
  console.log(`  - DETAINED (<65%)    : ${detainedCount}`);
  console.log('------------------------------------------------------------------------');

  if (passedCount === 180) {
    console.log('✓ ALL 180 ROLL NUMBERS SYNCHRONIZED & MATHEMATICALLY VERIFIED 100%!');
  } else {
    console.error(`✗ Only ${passedCount}/180 passed verification.`);
  }

  console.log('========================================================================\n');
}

testSyncAll180Students().catch(console.error);
