/**
 * Digital Campus Client-Side Auth Guard & Unified Permission Matrix
 * Prevents session lockouts, auto-heals missing tokens, and preserves seamless navigation across portals.
 */

// Unified Route Permission Matrix
export const ROUTE_PERMISSIONS = {
  'marketplace.html': ['STUDENT', 'HOD', 'HOD_CS', 'HOD_AIML', 'ADMIN', 'FACULTY'],
  'idea-hub.html':    ['STUDENT', 'HOD', 'HOD_CS', 'HOD_AIML', 'ADMIN', 'FACULTY'],
  'messages.html':    ['STUDENT', 'HOD', 'HOD_CS', 'HOD_AIML', 'ADMIN', 'FACULTY'],
  'hod-dashboard.html':      ['HOD', 'HOD_CS', 'HOD_AIML', 'ADMIN', 'FACULTY'],
  'students-info.html':      ['HOD', 'HOD_CS', 'HOD_AIML', 'ADMIN', 'FACULTY'],
  'document-approvals.html': ['HOD', 'HOD_CS', 'HOD_AIML', 'ADMIN', 'FACULTY'],
  'doc-approvals.html':      ['HOD', 'HOD_CS', 'HOD_AIML', 'ADMIN', 'FACULTY'],
  'security-roster.html':    ['HOD', 'HOD_CS', 'HOD_AIML', 'ADMIN', 'FACULTY'],
  'dept-students.html':      ['HOD', 'HOD_CS', 'HOD_AIML', 'ADMIN', 'FACULTY'],
  'fee-analytics.html':      ['HOD', 'HOD_CS', 'HOD_AIML', 'ADMIN', 'FACULTY'],
  'fee-payments.html':       ['STUDENT', 'HOD', 'HOD_CS', 'HOD_AIML', 'ADMIN', 'FACULTY'],
  'attendance.html':         ['STUDENT', 'HOD', 'HOD_CS', 'HOD_AIML', 'ADMIN', 'FACULTY'],
  'doc-request.html':        ['STUDENT', 'HOD', 'HOD_CS', 'HOD_AIML', 'ADMIN', 'FACULTY'],
  'document-logistics.html': ['STUDENT', 'HOD', 'HOD_CS', 'HOD_AIML', 'ADMIN', 'FACULTY'],
  'results.html':            ['STUDENT', 'HOD', 'HOD_CS', 'HOD_AIML', 'ADMIN', 'FACULTY'],
  'profile.html':            ['STUDENT', 'HOD', 'HOD_CS', 'HOD_AIML', 'ADMIN', 'FACULTY'],
  'dashboard.html':          ['STUDENT', 'HOD', 'HOD_CS', 'HOD_AIML', 'ADMIN', 'FACULTY']
};

export function validateActiveSession() {
  const user = getSessionUser();
  return Boolean(user);
}

export function getSessionUser() {
  try {
    const raw = localStorage.getItem('dc_user') || localStorage.getItem('smsk_user');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.name || parsed.pin || parsed.sbtetPin)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[AuthGuard] Parse error:', e);
  }

  const name = localStorage.getItem('user_name');
  const pin = localStorage.getItem('student_pin') || localStorage.getItem('user_pin');
  const role = localStorage.getItem('user_role');

  if (pin) {
    return {
      name: name || 'Student',
      pin: pin,
      sbtetPin: pin,
      rollNumber: pin,
      role: role || (pin.includes('HOD') ? 'HOD' : 'STUDENT'),
      branch: pin.includes('-AI') ? 'AIML' : 'CS',
      department: pin.includes('-AI') ? 'Artificial Intelligence & Machine Learning' : 'Computer Science & Engineering',
      collegeCode: '259',
      isRegistered: true,
      isActivated: true
    };
  }

  return null;
}

export function requireAuth(allowedRoles = []) {
  const path = window.location.pathname.toLowerCase();
  if (path.includes('/01-auth/') || path.endsWith('login.html')) {
    return null;
  }

  let user = getSessionUser();
  if (!user) {
    console.warn('[AuthGuard] Unauthenticated access attempt — redirecting to login.');
    window.location.replace('/screens/01-auth/login.html');
    return null;
  }

  const currentFile = window.location.pathname.split('/').pop() || 'dashboard.html';
  const role = ((user && user.role) || 'STUDENT').toUpperCase();
  const isHodRole = role.includes('HOD') || role === 'FACULTY' || role === 'ADMIN';

  // If HOD user landed on student dashboard, redirect them to HOD portal
  if (isHodRole && (currentFile === 'dashboard.html' && window.location.pathname.includes('/02-student-portal/'))) {
    console.warn(`[Auth Guard] HOD role [${role}] on student portal — redirecting to HOD Console.`);
    window.location.replace('/screens/04-hod-portal/hod-dashboard.html');
    return null;
  }

  // If Student user landed on HOD portal, redirect them to Student portal
  if (!isHodRole && window.location.pathname.includes('/04-hod-portal/')) {
    console.warn(`[Auth Guard] Student role [${role}] on HOD portal — redirecting to student dashboard.`);
    window.location.replace('/screens/02-student-portal/dashboard.html');
    return null;
  }

  return user;
}

export function redirectToDefaultPortal(role) {
  const upperRole = String(role || '').toUpperCase();
  if (upperRole.includes('HOD') || upperRole === 'ADMIN' || upperRole === 'FACULTY') {
    window.location.replace('/screens/04-hod-portal/hod-dashboard.html');
  } else {
    window.location.replace('/screens/02-student-portal/dashboard.html');
  }
}
