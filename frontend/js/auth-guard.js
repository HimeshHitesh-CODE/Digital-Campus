/**
 * Digital Campus Client-Side Auth Guard & Unified Permission Matrix
 * Enforces role boundaries across Student and HOD administrative portals without lockouts.
 */

import { api } from './api.js';

// Unified Route Permission Matrix
export const ROUTE_PERMISSIONS = {
  // Common / Shared Modules (Both Students and HODs have full inspect & interact access)
  'marketplace.html': ['STUDENT', 'HOD', 'HOD_CS', 'ADMIN', 'FACULTY'],
  'idea-hub.html':    ['STUDENT', 'HOD', 'HOD_CS', 'ADMIN', 'FACULTY'],
  'messages.html':    ['STUDENT', 'HOD', 'HOD_CS', 'ADMIN', 'FACULTY'],

  // HOD & Administrative Modules
  'hod-dashboard.html':      ['HOD', 'HOD_CS', 'ADMIN', 'FACULTY'],
  'students-info.html':      ['HOD', 'HOD_CS', 'ADMIN', 'FACULTY'],
  'document-approvals.html': ['HOD', 'HOD_CS', 'ADMIN', 'FACULTY'],
  'doc-approvals.html':      ['HOD', 'HOD_CS', 'ADMIN', 'FACULTY'],
  'security-roster.html':    ['HOD', 'HOD_CS', 'ADMIN', 'FACULTY'],
  'dept-students.html':      ['HOD', 'HOD_CS', 'ADMIN', 'FACULTY'],
  'fee-analytics.html':      ['HOD', 'HOD_CS', 'ADMIN', 'FACULTY'],
  'fee-payments.html':       ['STUDENT', 'HOD', 'HOD_CS', 'ADMIN', 'FACULTY'],

  // Student Modules
  'attendance.html':         ['STUDENT', 'HOD', 'HOD_CS', 'ADMIN', 'FACULTY'],
  'doc-request.html':        ['STUDENT', 'HOD', 'HOD_CS', 'ADMIN', 'FACULTY'],
  'document-logistics.html': ['STUDENT', 'HOD', 'HOD_CS', 'ADMIN', 'FACULTY'],
  'results.html':            ['STUDENT', 'HOD', 'HOD_CS', 'ADMIN', 'FACULTY'],
  'profile.html':            ['STUDENT', 'HOD', 'HOD_CS', 'ADMIN', 'FACULTY'],
  'dashboard.html':          ['STUDENT', 'HOD', 'HOD_CS', 'ADMIN', 'FACULTY']
};

/**
 * Validate and Auto-Logout Invalidated Sessions
 */
export function validateActiveSession() {
  const token = api.getToken() || localStorage.getItem('auth_token') || localStorage.getItem('dc_auth_token') || localStorage.getItem('smsk_token');
  const user = api.getUser() || JSON.parse(localStorage.getItem('smsk_user') || localStorage.getItem('dc_user') || 'null');

  const currentPath = window.location.pathname;
  const isAuthPage = currentPath.includes('/01-auth/') || currentPath.endsWith('auth.html') || currentPath.endsWith('login.html') || currentPath.endsWith('register.html') || currentPath.endsWith('verify-identity.html');

  if (!token || !user || user.isRegistered === false || user.isActivated === false) {
    // Clear all stored credentials
    localStorage.removeItem('smsk_user');
    localStorage.removeItem('smsk_token');
    localStorage.removeItem('smsk_theme_session');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('dc_auth_token');
    localStorage.removeItem('dc_user');
    localStorage.removeItem('user_role');
    localStorage.removeItem('student_pin');
    localStorage.removeItem('user_name');
    localStorage.removeItem('session_start');

    if (!isAuthPage && !currentPath.endsWith('index.html')) {
      const prefix = currentPath.includes('/screens/') ? '..' : '/screens';
      window.location.replace(`${prefix}/01-auth/login.html`);
    }
    return false;
  }
  return true;
}

export function requireAuth(allowedRoles = []) {
  const token = api.getToken() || localStorage.getItem('auth_token') || localStorage.getItem('dc_auth_token') || localStorage.getItem('smsk_token');
  const user = api.getUser() || JSON.parse(localStorage.getItem('smsk_user') || localStorage.getItem('dc_user') || 'null');

  // If unauthenticated or unregistered
  if (!token || !user || user.isRegistered === false || user.isActivated === false) {
    validateActiveSession();
    return null;
  }

  const currentFile = window.location.pathname.split('/').pop() || 'dashboard.html';
  const role = user.role || 'STUDENT';

  // Check route permissions from matrix
  const matrixAllowed = ROUTE_PERMISSIONS[currentFile];
  let isAllowed = true;

  if (matrixAllowed) {
    isAllowed = matrixAllowed.includes(role);
  } else if (allowedRoles && allowedRoles.length > 0) {
    // If explicit roles passed, allow HOD/HOD_CS on shared modules
    isAllowed = allowedRoles.includes(role) || 
      (['HOD', 'HOD_CS', 'ADMIN'].includes(role) && ['marketplace.html', 'idea-hub.html', 'messages.html', 'fee-payments.html'].includes(currentFile));
  }

  if (!isAllowed) {
    console.warn(`[Auth Guard] Access restricted for role [${role}] on ${currentFile}. Redirecting cleanly.`);
    redirectToDefaultPortal(role);
    return null;
  }

  return user;
}

export function checkPageAccess() {
  const user = api.getUser() || JSON.parse(localStorage.getItem('smsk_user') || localStorage.getItem('dc_user') || '{}');
  const currentFile = window.location.pathname.split('/').pop() || 'dashboard.html';
  const allowedRoles = ROUTE_PERMISSIONS[currentFile];

  if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
    redirectToDefaultPortal(user.role);
    return false;
  }
  return true;
}

export function redirectToDefaultPortal(role) {
  const isInsideScreens = window.location.pathname.includes('/screens/');
  const prefix = isInsideScreens ? '..' : '/screens';

  if (role === 'HOD' || role === 'HOD_CS' || role === 'FACULTY') {
    window.location.replace(`${prefix}/04-hod-portal/hod-dashboard.html`);
  } else if (role === 'ADMIN' || role === 'SUPERADMIN') {
    window.location.replace(`${prefix}/04-hod-portal/hod-dashboard.html`);
  } else {
    window.location.replace(`${prefix}/02-student-portal/dashboard.html`);
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', validateActiveSession);
}
