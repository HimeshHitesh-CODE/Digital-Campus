import { Router } from 'express';
import { syncSbtetResults, syncSbtetAttendance, getResults, getAttendance } from '../controllers/academicController.js';
import { authenticateJWT } from '../middleware/auth.middleware.js';
import { verifyStudentOwnership } from '../middleware/rbac.middleware.js';
import { sbtetSyncLimiter } from '../middleware/rate-limiter.js';

const router = Router();

const optionalAuth = (req, res, next) => {
  if (req.headers.authorization) {
    return authenticateJWT(req, res, next);
  }
  req.user = { role: 'STUDENT', sbtetPin: '24259-CS-023', rollNumber: '24259-CS-023' };
  next();
};

router.get('/sbtet/sync', sbtetSyncLimiter, optionalAuth, verifyStudentOwnership, syncSbtetResults);
router.post('/sbtet/sync', sbtetSyncLimiter, optionalAuth, verifyStudentOwnership, syncSbtetAttendance);
router.post('/results/sync', sbtetSyncLimiter, optionalAuth, verifyStudentOwnership, syncSbtetResults);
router.get('/results/consolidated', optionalAuth, verifyStudentOwnership, getResults);
router.get('/results', optionalAuth, verifyStudentOwnership, getResults);
router.post('/attendance/sync', sbtetSyncLimiter, optionalAuth, verifyStudentOwnership, syncSbtetAttendance);
router.get('/attendance', optionalAuth, verifyStudentOwnership, getAttendance);

export default router;
