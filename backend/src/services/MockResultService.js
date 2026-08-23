import { ResultService } from './ResultService.js';

export class MockResultService extends ResultService {
  constructor() {
    super();
    // In-memory cache for development simulation
    this.cache = new Map();
  }

  async getStudentResults(pin, semester = 5) {
    // Simulate slight network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      pin,
      semester,
      board: 'State Board of Technical Education and Training (SBTET)',
      scheme: 'C-20',
      cgpa: 8.42,
      sgpa: 8.60,
      totalCredits: 24,
      backlogs: 0,
      status: 'PROMOTED / ALL PASSED',
      lastSynced: new Date().toISOString(),
      subjects: [
        { code: 'CS-501', name: 'Industrial Management & Smart Technologies', internal: 38, external: 54, total: 92, status: 'PASS', grade: 'O', credits: 4 },
        { code: 'CS-502', name: 'Software Engineering with Agile', internal: 35, external: 48, total: 83, status: 'PASS', grade: 'A', credits: 4 },
        { code: 'CS-503', name: 'Advanced Java Programming', internal: 39, external: 56, total: 95, status: 'PASS', grade: 'O', credits: 4 },
        { code: 'CS-504', name: 'System Administration & Security', internal: 32, external: 45, total: 77, status: 'PASS', grade: 'B+', credits: 4 },
        { code: 'CS-505', name: 'Web Technologies Lab', internal: 48, external: 49, total: 97, status: 'PASS', grade: 'O', credits: 4 },
        { code: 'CS-506', name: 'Java Programming Lab', internal: 47, external: 48, total: 95, status: 'PASS', grade: 'O', credits: 4 },
      ],
    };
  }

  async getStudentAttendance(pin) {
    await new Promise(resolve => setTimeout(resolve, 200));

    return {
      pin,
      cumulativePercentage: 88.5,
      totalWorkingHours: 420,
      attendedHours: 372,
      condonationEligible: true,
      lastBiometricDate: new Date().toISOString().split('T')[0],
      subjects: [
        { name: 'Advanced Java Programming', held: 50, attended: 46, percentage: 92.0 },
        { name: 'Software Engineering', held: 48, attended: 42, percentage: 87.5 },
        { name: 'System Administration', held: 44, attended: 38, percentage: 86.3 },
        { name: 'Web Tech Lab', held: 60, attended: 56, percentage: 93.3 },
      ],
    };
  }

  async syncAcademicSnapshot(pin) {
    const [results, attendance] = await Promise.all([
      this.getStudentResults(pin),
      this.getStudentAttendance(pin),
    ]);

    const snapshot = {
      pin,
      attendancePct: attendance.cumulativePercentage,
      cgpa: results.cgpa,
      backlogs: results.backlogs,
      results,
      attendance,
      lastSynced: new Date().toISOString(),
      source: 'MOCK_SBTET_SERVICE',
    };

    this.cache.set(pin, snapshot);
    return snapshot;
  }
}
