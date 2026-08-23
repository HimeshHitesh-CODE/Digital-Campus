/**
 * Abstract Result & Attendance Service Interface
 * All implementations (Mock, Live SBTET, Institutional API) must conform to this contract.
 */

export class ResultService {
  /**
   * Fetch student semester marks and backlogs
   * @param {string} pin - Student SBTET PIN / Hall Ticket number
   * @param {number} [semester] - Semester number
   * @returns {Promise<Object>} Formatted result payload
   */
  async getStudentResults(pin, semester) {
    throw new Error('Method getStudentResults(pin, semester) must be implemented.');
  }

  /**
   * Fetch live cumulative and subject-wise attendance
   * @param {string} pin - Student SBTET PIN
   * @returns {Promise<Object>} Formatted attendance payload
   */
  async getStudentAttendance(pin) {
    throw new Error('Method getStudentAttendance(pin) must be implemented.');
  }

  /**
   * Perform a unified sync of marks and attendance
   * @param {string} pin - Student SBTET PIN
   * @returns {Promise<Object>} Combined academic snapshot
   */
  async syncAcademicSnapshot(pin) {
    throw new Error('Method syncAcademicSnapshot(pin) must be implemented.');
  }
}
