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

export function requireAuth(allowedRoles = []) {
  const token = api.getToken() || localStorage.getItem('auth_token') || localStorage.getItem('dc_auth_token');
  const user = api.getUser();

  // If unauthenticated
  if (!token || !user) {
    const isInsideScreens = window.location.pathname.includes('/screens/');
    const loginTarget = isInsideScreens ? '../01-auth/login.html' : '/screens/01-auth/login.html';
    
    // Prevent redirect loops if already on auth screens
    if (!window.location.pathname.includes('/01-auth/')) {
      console.warn('[Auth Guard] No active session found. Redirecting to login.');
      window.location.replace(loginTarget);
    }
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
  const user = api.getUser() || JSON.parse(localStorage.getItem('smsk_user') || '{}');
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
