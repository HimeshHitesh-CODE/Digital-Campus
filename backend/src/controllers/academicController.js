import { sbtetResultService } from '../services/SBTETResultService.js';
import { sbtetAttendanceService } from '../services/SBTETAttendanceService.js';
import { config } from '../config/env.js';

export const getResults = async (req, res) => {
  try {
    const pin = req.query.pin || req.body?.pin || req.user?.sbtetPin || '24259-CS-023';
    const force = req.query.force === 'true' || req.body?.force === true;

    const results = await sbtetResultService.getStudentResults(pin, force);

    return res.status(200).json({
      success: true,
      data: results,
      results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Could not fetch examination results.',
      error: error.message,
    });
  }
};

export const syncSbtetResults = async (req, res) => {
  try {
    const pin = req.body?.pin || req.query?.pin || req.user?.sbtetPin || '24259-CS-023';
    const results = await sbtetResultService.getStudentResults(pin, true);

    return res.status(200).json({
      success: true,
      message: 'SBTET marksheet synchronized successfully.',
      data: results,
      results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Could not sync marksheet from SBTET.',
      error: error.message,
    });
  }
};

export const syncSbtetAttendance = async (req, res) => {
  try {
    const pin = req.body?.pin || req.query?.pin || req.user?.sbtetPin || '24259-CS-023';
    const force = req.body?.force !== false;

    const data = await sbtetAttendanceService.syncStudentAttendance(pin, force);
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error during SBTET live attendance sync:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to synchronize live SBTET biometrics.',
      error: error.message,
    });
  }
};

export const syncSBTET = async (req, res) => {
  try {
    const pin = req.query.pin || req.body?.pin || req.user?.sbtetPin || '24259-CS-023';
    const snapshot = await sbtetAttendanceService.syncStudentAttendance(pin, true);

    return res.status(200).json({
      success: true,
      message: 'SBTET live biometrics synchronized successfully.',
      data: snapshot,
      ...snapshot,
    });
  } catch (error) {
    console.error('Error during SBTET sync:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to synchronize with SBTET portal.',
      error: error.message,
    });
  }
};

export const getAttendance = async (req, res) => {
  try {
    const pin = req.query.pin || req.user?.sbtetPin || '24259-CS-037';
    const force = req.query.force === 'true';

    const attendance = await sbtetAttendanceService.syncStudentAttendance(pin, force);
    return res.status(200).json(attendance);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Could not fetch live attendance from SBTET.',
      error: error.message,
    });
  }
};

export const getStudentProfile = async (req, res) => {
  try {
    const pin = (req.query.pin || req.user?.sbtetPin || '24259-CS-037').trim().toUpperCase();
    const attendance = await sbtetAttendanceService.syncStudentAttendance(pin, false);
    return res.status(200).json({
      success: true,
      data: attendance,
      profile: attendance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Could not fetch student profile.',
      error: error.message,
    });
  }
};
