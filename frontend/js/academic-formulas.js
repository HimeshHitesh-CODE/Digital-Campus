/**
 * Samskruti Digital Campus — Institutional Academic & Telemetry Formulas
 * State Board of Technical Education & Training (SBTET) Polytechnic Standard
 *
 * All attendance, condonation, backlogs, and marks totals are derived through this
 * single unified calculation engine to ensure 100% mathematical consistency.
 */

(function (global) {
  'use strict';

  const AcademicFormulas = {
    // -------------------------------------------------------------
    // 1. ATTENDANCE & ELIGIBILITY FORMULAS
    // -------------------------------------------------------------

    /**
     * Calculates the attendance percentage rounded to two decimals.
     * Formula: (presentDays / workingDays) * 100
     */
    calculateAttendancePercentage(presentDays, workingDays) {
      const p = parseFloat(presentDays) || 0;
      const w = parseFloat(workingDays) || 0;
      if (w <= 0) return 0.0;
      return Math.round((p / w) * 10000) / 100;
    },

    /**
     * Determines statutory SBTET eligibility status based on cutoff thresholds:
     * - >= 75.00%: Regular Eligible (Hall Ticket Issued)
     * - 65.00% to 74.99%: Condonable Warning (HOD / Medical Condonation Required)
     * - < 65.00%: Detained / Shortage Alert (Not eligible for board examination)
     */
    getAttendanceEligibility(percentage) {
      const pct = parseFloat(percentage) || 0.0;
      if (pct >= 75.0) {
        return {
          code: 'REGULAR',
          status: 'Regular Eligible',
          isEligible: true,
          condonationRequired: false,
          isDetained: false,
          colorClass: 'success', // Signal Lime
          textClass: 'text-[#1A1A1A]',
          bgClass: 'bg-[#D6F25E]',
          message: 'Your attendance is above the 75% cutoff. Fully eligible for Board Exams.'
        };
      }
      if (pct >= 65.0) {
        return {
          code: 'CONDONABLE',
          status: 'Condonable Warning',
          isEligible: true,
          condonationRequired: true,
          isDetained: false,
          colorClass: 'warning', // Warning Gold
          textClass: 'text-[#8A5A00]',
          bgClass: 'bg-[#FFF0C7]',
          message: `Your attendance is ${pct.toFixed(1)}%, below the 75% cutoff threshold. Condonation window open.`
        };
      }
      return {
        code: 'DETAINED',
        status: 'Critical Detainment Alert (<65%)',
        isEligible: false,
        condonationRequired: false,
        isDetained: true,
        colorClass: 'danger', // Danger Coral
        textClass: 'text-[#B42318]',
        bgClass: 'bg-[#FFE1DE]',
        message: `Your attendance is ${pct.toFixed(1)}%, critically below the 65% condonation minimum. Detention risk.`
      };
    },

    /**
     * Calculates consecutive days of attendance needed to reach 75.0%:
     * Equation: (present + x) / (working + x) >= 0.75
     * => present + x >= 0.75 * working + 0.75 * x
     * => 0.25 * x >= 0.75 * working - present
     * => x = ceil(3 * working - 4 * present)
     */
    calculateDaysNeededFor75(presentDays, workingDays) {
      const p = parseFloat(presentDays) || 0;
      const w = parseFloat(workingDays) || 0;
      if (w <= 0) return 0;
      const currentPct = (p / w) * 100;
      if (currentPct >= 75.0) return 0;

      const needed = Math.ceil(3 * w - 4 * p);
      return Math.max(0, needed);
    },

    /**
     * Calculates remaining working days in the semester.
     * Formula: max(0, totalSemesterDays - workingDays)
     */
    calculateRemainingDays(workingDays, totalSemesterDays = 180) {
      const w = parseFloat(workingDays) || 0;
      const t = parseFloat(totalSemesterDays) || 180;
      return Math.max(0, t - w);
    },

    /**
     * Attendance deficit relative to 75% statutory requirement.
     * Returns negative if below cutoff, e.g. -47.22%.
     */
    calculateDeficit(percentage, cutoff = 75.0) {
      const pct = parseFloat(percentage) || 0.0;
      return Math.round((pct - cutoff) * 100) / 100;
    },

    // -------------------------------------------------------------
    // 2. MARKS, TRANSCRIPTS & CGPA FORMULAS
    // -------------------------------------------------------------

    /**
     * Derives Total Marks strictly as Internal + EndSem.
     * Formula: internal + endSem
     */
    calculateMarksTotal(internal, endSem) {
      const i = parseFloat(internal) || 0;
      const e = parseFloat(endSem) || 0;
      return Math.round((i + e) * 100) / 100;
    },

    /**
     * Derives pass/fail result based on SBTET C-24 standards:
     * - End Sem minimum: >= 35% of max end sem marks (typically >= 14 out of 40, or >= 28 out of 80)
     * - Total minimum: >= 40% of max total marks (typically >= 40 out of 100)
     */
    getSubjectResult(internal, endSem, maxEndSem = 80, maxTotal = 100) {
      const i = parseFloat(internal) || 0;
      const e = parseFloat(endSem) || 0;
      const tot = this.calculateMarksTotal(i, e);
      const endSemPass = (e >= (maxEndSem * 0.35));
      const totalPass = (tot >= (maxTotal * 0.40));
      const passed = endSemPass && totalPass;

      return {
        total: tot,
        passed,
        grade: passed ? (tot >= 75 ? 'Distinction' : (tot >= 60 ? 'First Class' : 'Pass')) : 'F',
        status: passed ? 'PASSED' : 'BACKLOG'
      };
    },

    /**
     * Calculates Cumulative Grade Point Average (CGPA) from semester courses:
     * Formula: sum(credit * gradePoint) / sum(credit)
     */
    calculateCGPA(courses) {
      if (!Array.isArray(courses) || courses.length === 0) return 0.0;
      let totalWeighted = 0;
      let totalCredits = 0;

      courses.forEach(c => {
        const cred = parseFloat(c.credits) || 0;
        const gp = parseFloat(c.gradePoint) || (c.passed ? (c.total / 10) : 0);
        totalWeighted += cred * gp;
        totalCredits += cred;
      });

      if (totalCredits <= 0) return 0.0;
      return Math.round((totalWeighted / totalCredits) * 100) / 100;
    }
  };

  // Export globally for browser and node environments
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AcademicFormulas;
  } else {
    global.AcademicFormulas = AcademicFormulas;
  }
})(typeof window !== 'undefined' ? window : this);
