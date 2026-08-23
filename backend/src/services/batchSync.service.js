/**
 * Samskruti College of Engineering & Technology (Code: 259)
 * Department of Computer Science (CS) - Full Batch Synchronization Engine
 * Manages concurrent attendance & backlog synchronization for all 180 students (PINs 001 to 180).
 */

import { SBTETAttendanceService } from './SBTETAttendanceService.js';
import { SBTETResultService } from './SBTETResultService.js';

import { getStudentNameForPin } from '../data/studentRoster.js';

const sbtetAttendanceService = new SBTETAttendanceService();
const sbtetResultService = new SBTETResultService();

// In-memory Database / Cache for all 180 department students
export const departmentStudentsStore = new Map();

/**
 * 1. PIN Range Generator: 24259-CS-001 to 24259-CS-180
 */
export const generateCSPins = () => 
  Array.from({ length: 180 }, (_, i) => `24259-CS-${String(i + 1).padStart(3, '0')}`);

/**
 * 2. Single-Student Extraction & Risk Calculation Pipeline
 */
export async function syncStudentAttendanceAndBacklogs(pin, forceRefresh = true) {
  const cleanPin = (pin || '').trim().toUpperCase();

  // Execute attendance and results extraction concurrently for this PIN
  const [attendanceData, resultsData] = await Promise.all([
    sbtetAttendanceService.syncStudentAttendance(cleanPin, forceRefresh),
    sbtetResultService.getStudentResults(cleanPin, forceRefresh)
  ]);

  // Extract attendance metrics
  const workingDays = attendanceData.metrics?.workingDays || 64;
  const daysPresent = attendanceData.metrics?.daysPresent || 0;
  const daysAbsent = attendanceData.metrics?.daysAbsent || (workingDays - daysPresent);

  let attendancePct = Number(attendanceData.metrics?.aggregatePercentage || 0);
  if ((attendancePct === 0 || isNaN(attendancePct)) && daysPresent > 0 && workingDays > 0) {
    attendancePct = Number(((daysPresent / workingDays) * 100).toFixed(1));
  } else {
    attendancePct = Number((attendancePct || 0).toFixed(1));
  }

  // Calculate Risk status
  let attendanceStatus = 'ELIGIBLE';
  if (attendancePct < 65) {
    attendanceStatus = 'CRITICAL';
  } else if (attendancePct < 75) {
    attendanceStatus = 'WARNING';
  }

  // Extract Backlog subjects across all semesters
  const failedSubjects = [];
  if (resultsData.semesters) {
    Object.values(resultsData.semesters).forEach(sem => {
      if (Array.isArray(sem.subjects)) {
        sem.subjects.forEach(sub => {
          const isFailed = sub.grade === 'F' || sub.examStatus === 'F' || sub.isPass === false;
          if (isFailed) {
            failedSubjects.push({
              semester: sem.semester || '3SEM',
              code: sub.code || 'CS-SUB',
              name: sub.name || 'Subject',
              internal: sub.internal || '0',
              external: sub.external || '0',
              total: sub.total || 0,
              grade: sub.grade || 'F'
            });
          }
        });
      }
    });
  }

  const backlogSubjects = failedSubjects.map(sub => ({
    semester: sub.semester || '1SEM',
    code: sub.code || 'CS-102',
    name: sub.name || 'Engineering Mathematics-I',
    internalMarks: Number(sub.internal ?? sub.internalMarks ?? 14),
    externalMarks: Number(sub.external ?? sub.externalMarks ?? 18),
    totalMarks: Number(sub.total ?? sub.totalMarks ?? 32),
    grade: sub.grade || 'F'
  }));

  const backlogCount = backlogSubjects.length;
  const studentName = attendanceData.studentName || resultsData.studentName || getStudentNameForPin(cleanPin);

  const studentRecord = {
    pin: cleanPin,
    rollNumber: parseInt(cleanPin.slice(-3), 10) || 1,
    name: studentName,
    branch: 'Computer Science & Engineering',
    scheme: 'C-24',
    semester: 3,
    collegeCode: '259',
    isSynced: true,
    attendancePercentage: attendancePct,
    backlogCount,
    backlogSubjects,
    attendance: {
      workingDays,
      daysPresent,
      daysAbsent,
      percentage: attendancePct,
      examPercentage: attendanceData.metrics?.examAttendancePercentage || attendancePct,
      status: attendanceStatus, // 'ELIGIBLE' | 'WARNING' | 'CRITICAL'
      condonationEligible: attendancePct >= 65 && attendancePct < 75
    },
    results: {
      cgpa: resultsData.summary?.cgpa || 0,
      totalCredits: resultsData.summary?.creditsGained || 0,
      backlogCount,
      failedSubjects: backlogSubjects,
      backlogSubjects,
      allCleared: backlogCount === 0
    },
    lastSynced: new Date().toISOString()
  };

  // Upsert into master department store
  departmentStudentsStore.set(cleanPin, studentRecord);

  return studentRecord;
}

/**
 * 3. Seed initial baseline records for all 180 students if store is empty
 */
export async function initializeDepartmentStoreIfEmpty() {
  if (departmentStudentsStore.size > 0) return;

  console.log('[Department Store] Initializing baseline distinct roster for PINs 001 to 180...');
  const pins = generateCSPins();
  
  pins.forEach((pin, index) => {
    const rollNum = index + 1;
    const studentName = getStudentNameForPin(pin);

    departmentStudentsStore.set(pin, {
      pin,
      rollNumber: rollNum,
      name: studentName,
      branch: 'Computer Science & Engineering',
      scheme: 'C-24',
      semester: 3,
      collegeCode: '259',
      isSynced: false,
      attendance: null,
      results: null,
      backlogCount: 0,
      backlogSubjects: [],
      lastSynced: null
    });
  });
}

/**
 * 4. Get all department students & get by PIN
 */
export function getAllDepartmentStudents() {
  if (departmentStudentsStore.size === 0) {
    initializeDepartmentStoreIfEmpty();
  }
  return Array.from(departmentStudentsStore.values()).sort((a, b) => a.rollNumber - b.rollNumber);
}

export function getDepartmentStudentByPin(pin) {
  if (departmentStudentsStore.size === 0) {
    initializeDepartmentStoreIfEmpty();
  }
  return departmentStudentsStore.get(pin.toUpperCase());
}

/**
 * 5. Concurrency Pool for Batch Sync (Max 5 workers with jitter)
 */
let lastBatchSyncCompletedTime = null;

export const getLastBatchSyncTimestamp = () => lastBatchSyncCompletedTime;
export const isBatchSyncStale = () => 
  !lastBatchSyncCompletedTime || (Date.now() - new Date(lastBatchSyncCompletedTime).getTime() > 2 * 60 * 60 * 1000);

export async function runBatchSync(onProgress, onError, concurrency = 5) {
  const pins = generateCSPins();
  const total = pins.length;
  let completed = 0;
  let running = 0;
  let index = 0;

  return new Promise((resolve) => {
    const next = () => {
      if (completed === total) {
        lastBatchSyncCompletedTime = new Date().toISOString();
        return resolve();
      }

      while (running < concurrency && index < total) {
        const pin = pins[index++];
        running++;

        // Fast smooth streaming jitter (15ms-45ms)
        const jitter = Math.floor(Math.random() * 30) + 15;
        setTimeout(async () => {
          try {
            const student = await syncStudentAttendanceAndBacklogs(pin, true);
            completed++;
            running--;

            if (onProgress) {
              onProgress({
                type: 'PROGRESS',
                completed,
                total,
                percent: Math.round((completed / total) * 100),
                pin,
                student
              });
            }
          } catch (err) {
            completed++;
            running--;

            if (onError) {
              onError({
                type: 'ERROR',
                pin,
                message: err.message,
                completed,
                total,
                percent: Math.round((completed / total) * 100)
              });
            }
          }

          next();
        }, jitter);
      }
    };

    next();
  });
}
