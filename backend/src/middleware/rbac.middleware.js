/**
 * RBAC & Anti-IDOR Middleware
 * Enforces role boundaries and checks record/PIN ownership.
 */

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles [${allowedRoles.join(', ')}]`,
      });
    }
    next();
  };
};

/**
 * Anti-IDOR Guard for Student Endpoints
 * Ensures a student cannot query or modify another student's PIN/Roll Number.
 */
export const verifyStudentOwnership = (req, res, next) => {
  const { user } = req;
  const requestedPin = req.query.pin || req.params.pin || req.body.pin;
  const requestedRoll = req.query.rollNumber || req.params.rollNumber || req.body.rollNumber;

  // Faculty, HOD, and Admins can access records within their respective scopes
  if (['FACULTY', 'HOD', 'ADMIN', 'SUPERADMIN'].includes(user.role)) {
    return next();
  }

  // Student role must match their own authenticated profile
  if (user.role === 'STUDENT') {
    if (requestedPin && user.sbtetPin && user.sbtetPin !== requestedPin) {
      return res.status(403).json({
        success: false,
        message: 'Security Alert: You cannot access or sync academic records of another student.',
      });
    }

    if (requestedRoll && user.rollNumber && user.rollNumber !== requestedRoll) {
      return res.status(403).json({
        success: false,
        message: 'Security Alert: You cannot access or modify records belonging to another roll number.',
      });
    }
  }

  next();
};
