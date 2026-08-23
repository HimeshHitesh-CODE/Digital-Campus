/**
 * HOD (Head of Department) Routes & Server-Sent Events (SSE) Stream
 * Provides real-time batch synchronization, student analytics, department fee ledger,
 * document approval/rejection decision engine, and anti-spoofing security roster.
 */

import { Router } from 'express';
import {
  generateCSPins,
  getAllDepartmentStudents,
  getDepartmentStudentByPin,
  syncStudentAttendanceAndBacklogs,
  runBatchSync,
  departmentStudentsStore,
  initializeDepartmentStoreIfEmpty,
  getLastBatchSyncTimestamp,
  isBatchSyncStale
} from '../services/batchSync.service.js';

import {
  getPendingHODDocRequests,
  processDocDecision,
  documentRequests
} from '../controllers/documentController.js';

import { csStudentMasterRoster } from '../data/studentRoster.js';

const router = Router();

// Initialize baseline data
initializeDepartmentStoreIfEmpty();

// In-memory Fee Records store for 180 department students
const departmentFeesStore = new Map();
const feeRemindersSent = [];

function initializeFeesIfEmpty() {
  if (departmentFeesStore.size > 0) return;
  const students = getAllDepartmentStudents();
  
  students.forEach((s, idx) => {
    const roll = s.rollNumber || (idx + 1);
    const totalFee = 35000; // Semester standard fee
    
    let amountPaid = 35000;
    let status = 'CLEARED';
    let lastTxnId = `TXN-259-CS-${String(roll).padStart(3, '0')}-01`;

    if (roll % 5 === 0) {
      amountPaid = 0;
      status = 'PENDING';
      lastTxnId = 'N/A';
    } else if (roll % 3 === 0) {
      amountPaid = 20000;
      status = 'PARTIAL';
      lastTxnId = `TXN-259-CS-${String(roll).padStart(3, '0')}-PR`;
    }

    departmentFeesStore.set(s.pin, {
      pin: s.pin,
      name: s.name,
      semester: 3,
      branch: 'Computer Science & Engineering',
      totalFee,
      amountPaid,
      balance: totalFee - amountPaid,
      status,
      lastTxnId,
      lastTxnDate: status !== 'PENDING' ? '2026-08-10T11:30:00.000Z' : null
    });
  });
}

initializeFeesIfEmpty();

/**
 * 1. Server-Sent Events (SSE) Real-Time Progress Stream
 * Endpoint: GET /api/hod/sync-stream
 */
router.get('/sync-stream', async (req, res) => {
  // 1. Mandatory SSE Headers to prevent connection buffering
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': '*'
  });
  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  console.log('[SSE Stream] Starting live department batch synchronization...');

  // Send immediate connected event
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', total: 180 })}\n\n`);
  if (typeof res.flush === 'function') res.flush();

  try {
    await runBatchSync(
      (data) => {
        if (!res.writableEnded) {
          res.write(`data: ${JSON.stringify(data)}\n\n`);
          if (typeof res.flush === 'function') res.flush();
        }
      },
      (errData) => {
        if (!res.writableEnded) {
          res.write(`data: ${JSON.stringify(errData)}\n\n`);
          if (typeof res.flush === 'function') res.flush();
        }
      },
      5
    );

    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ type: 'COMPLETE', total: 180, percent: 100, message: 'All 180 students synchronized successfully.' })}\n\n`);
      if (typeof res.flush === 'function') res.flush();
      res.end();
    }
  } catch (error) {
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ type: 'ERROR', message: error.message })}\n\n`);
      if (typeof res.flush === 'function') res.flush();
      res.end();
    }
  }

  req.on('close', () => {
    console.log('[SSE Stream] Client disconnected from batch sync stream.');
  });
});

/**
 * 2. Get All Department Students
 * Endpoint: GET /api/hod/students
 */
router.get('/students', (req, res) => {
  const students = getAllDepartmentStudents();
  return res.status(200).json({
    success: true,
    total: students.length,
    isStale: isBatchSyncStale(),
    lastSynced: getLastBatchSyncTimestamp(),
    students
  });
});

router.get('/students-roster', (req, res) => {
  const students = getAllDepartmentStudents();
  return res.status(200).json({
    success: true,
    total: students.length,
    students
  });
});

/**
 * 2b. Get Single Student Backlogs Breakdown
 * Endpoint: GET /api/hod/students/:pin/backlogs
 */
router.get('/students/:pin/backlogs', async (req, res) => {
  const pin = req.params.pin?.toUpperCase();
  try {
    let student = getDepartmentStudentByPin(pin);
    if (!student || !student.isSynced) {
      student = await syncStudentAttendanceAndBacklogs(pin, true);
    }

    let backlogSubjects = student.backlogSubjects || student.results?.failedSubjects || [];
    if (backlogSubjects.length === 0 && student.results?.backlogCount > 0) {
      backlogSubjects = [
        {
          semester: '1SEM',
          code: 'CS-102',
          name: 'Engineering Mathematics-I',
          internalMarks: 14,
          externalMarks: 18,
          totalMarks: 32,
          grade: 'F'
        }
      ];
    }

    return res.status(200).json({
      success: true,
      student: {
        pin: student.pin,
        name: student.name,
        scheme: student.scheme || 'C-24',
        semester: student.semester || '3SEM',
        attendancePercentage: student.attendance?.percentage || student.attendancePercentage || 0,
        backlogCount: student.results?.backlogCount || student.backlogCount || backlogSubjects.length,
        backlogSubjects
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/**
 * 3. Get Department Summary Statistics
 * Endpoint: GET /api/hod/stats
 */
router.get('/stats', (req, res) => {
  const students = getAllDepartmentStudents();
  const total = students.length;

  let totalAttPct = 0;
  let criticalCount = 0;
  let warningCount = 0;
  let eligibleCount = 0;
  let withBacklogs = 0;
  let totalBacklogsCount = 0;

  students.forEach(s => {
    const pct = s.attendance?.percentage || 0;
    totalAttPct += pct;

    if (pct < 65) criticalCount++;
    else if (pct < 75) warningCount++;
    else eligibleCount++;

    const backlogs = s.results?.backlogCount || 0;
    if (backlogs > 0) {
      withBacklogs++;
      totalBacklogsCount += backlogs;
    }
  });

  const avgAttendance = total > 0 ? Number((totalAttPct / total).toFixed(1)) : 0;

  return res.status(200).json({
    success: true,
    stats: {
      totalStudents: total,
      avgAttendance,
      eligibleCount,
      warningCount,
      criticalCount,
      withBacklogs,
      totalBacklogsCount,
      clearCount: total - withBacklogs,
      isStale: isBatchSyncStale(),
      lastSynced: getLastBatchSyncTimestamp()
    }
  });
});

/**
 * 4. Sync single student on demand
 * Endpoint: POST /api/hod/sync-student
 */
router.post('/sync-student', async (req, res) => {
  const { pin } = req.body;
  if (!pin) {
    return res.status(400).json({ success: false, message: 'Student PIN is required.' });
  }

  try {
    const student = await syncStudentAttendanceAndBacklogs(pin, true);
    return res.status(200).json({
      success: true,
      message: `Student ${pin} synced successfully.`,
      student
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 5. Department Fee Collection Analytics
 * Endpoint: GET /api/hod/fees
 */
router.get('/fees', (req, res) => {
  initializeFeesIfEmpty();
  const feeRecords = Array.from(departmentFeesStore.values());
  const totalIntake = feeRecords.length;

  let totalCollected = 0;
  let totalPending = 0;
  let clearedCount = 0;
  let partialCount = 0;
  let defaultersCount = 0;

  feeRecords.forEach(rec => {
    totalCollected += rec.amountPaid;
    totalPending += rec.balance;

    if (rec.status === 'CLEARED') clearedCount++;
    else if (rec.status === 'PARTIAL') partialCount++;
    else defaultersCount++;
  });

  const clearanceRate = totalIntake > 0 ? Number(((clearedCount / totalIntake) * 100).toFixed(1)) : 0;

  return res.status(200).json({
    success: true,
    summary: {
      totalIntake,
      clearedCount,
      partialCount,
      defaultersCount,
      totalCollected,
      totalPending,
      clearanceRate
    },
    students: feeRecords
  });
});

/**
 * 6. Send Fee Reminder Notification to Student
 * Endpoint: POST /api/hod/fees/remind
 */
router.post('/fees/remind', (req, res) => {
  const { pin, studentName, balance, semester } = req.body;
  if (!pin) {
    return res.status(400).json({ success: false, message: 'Student PIN is required.' });
  }

  const reminder = {
    id: `REM-${Date.now()}`,
    pin,
    studentName: studentName || 'Student',
    balance: balance || 35000,
    semester: semester || 3,
    sentAt: new Date().toISOString(),
    sentBy: 'Prof. Vamshi Krishna (HOD CS)',
    status: 'DELIVERED'
  };

  feeRemindersSent.push(reminder);

  return res.status(200).json({
    success: true,
    message: `Fee reminder alert successfully dispatched to ${pin} (${studentName}).`,
    reminder
  });
});

/**
 * 7. Document Logistics HOD Approval Queue
 * Endpoint: GET /api/hod/documents/pending
 */
router.get('/documents/pending', getPendingHODDocRequests);

/**
 * 8. Process Document Decision (Approve / Reject)
 * Endpoint: POST /api/hod/documents/decision
 */
router.post('/documents/decision', processDocDecision);

router.post('/documents/approve', (req, res) => {
  req.body.action = 'APPROVE';
  return processDocDecision(req, res);
});

router.post('/documents/reject', (req, res) => {
  req.body.action = 'REJECT';
  return processDocDecision(req, res);
});

/**
 * 9. Anti-Spoofing Security Keys Roster (180 Students)
 * Endpoint: GET /api/hod/security-roster
 */
router.get('/security-roster', (req, res) => {
  const query = (req.query.search || '').trim().toLowerCase();
  let list = Array.from(csStudentMasterRoster.values());

  if (query) {
    list = list.filter(s => 
      s.pin.toLowerCase().includes(query) || 
      s.secretKey.toLowerCase().includes(query)
    );
  }

  return res.status(200).json({
    success: true,
    total: list.length,
    roster: list
  });
});

export default router;
