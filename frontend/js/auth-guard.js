/**
 * Digital Campus Client-Side Auth Guard & Unified Permission Matrix
 * Enforces role boundaries across Student and Multi-Department HOD administrative portals without lockouts.
 */

import { api } from './api.js';

// Unified Route Permission Matrix
export const ROUTE_PERMISSIONS = {
  // Common / Shared Modules (Both Students and HODs have full inspect & interact access)
  'marketplace.html': ['STUDENT', 'HOD', 'HOD_CS', 'HOD_AIML', 'ADMIN', 'FACULTY'],
  'idea-hub.html':    ['STUDENT', 'HOD', 'HOD_CS', 'HOD_AIML', 'ADMIN', 'FACULTY'],
  'messages.html':    ['STUDENT', 'HOD', 'HOD_CS', 'HOD_AIML', 'ADMIN', 'FACULTY'],

  // HOD & Administrative Modules
  'hod-dashboard.html':      ['HOD', 'HOD_CS', 'HOD_AIML', 'ADMIN', 'FACULTY'],
  'students-info.html':      ['HOD', 'HOD_CS', 'HOD_AIML', 'ADMIN', 'FACULTY'],
  'document-approvals.html': ['HOD', 'HOD_CS', 'HOD_AIML', 'ADMIN', 'FACULTY'],
  'doc-approvals.html':      ['HOD', 'HOD_CS', 'HOD_AIML', 'ADMIN', 'FACULTY'],
  'security-roster.html':    ['HOD', 'HOD_CS', 'HOD_AIML', 'ADMIN', 'FACULTY'],
  'dept-students.html':      ['HOD', 'HOD_CS', 'HOD_AIML', 'ADMIN', 'FACULTY'],
  'fee-analytics.html':      ['HOD', 'HOD_CS', 'HOD_AIML', 'ADMIN', 'FACULTY'],
  'fee-payments.html':       ['STUDENT', 'HOD', 'HOD_CS', 'HOD_AIML', 'ADMIN', 'FACULTY'],

  // Student Modules
  'attendance.html':         ['STUDENT', 'HOD', 'HOD_CS', 'HOD_AIML', 'ADMIN', 'FACULTY'],
  'doc-request.html':        ['STUDENT', 'HOD', 'HOD_CS', 'HOD_AIML', 'ADMIN', 'FACULTY'],
  'document-logistics.html': ['STUDENT', 'HOD', 'HOD_CS', 'HOD_AIML', 'ADMIN', 'FACULTY'],
  'results.html':            ['STUDENT', 'HOD', 'HOD_CS', 'HOD_AIML', 'ADMIN', 'FACULTY'],
  'profile.html':            ['STUDENT', 'HOD', 'HOD_CS', 'HOD_AIML', 'ADMIN', 'FACULTY'],
  'dashboard.html':          ['STUDENT', 'HOD', 'HOD_CS', 'HOD_AIML', 'ADMIN', 'FACULTY']
};

/**
 * Validate and Auto-Logout Invalidated Sessions
 */
export function validateActiveSession() {
  const token = api.getToken() || localStorage.getItem('auth_token') || localStorage.getItem('dc_auth_token') || localStorage.getItem('smsk_token');
  const user = api.getUser() || JSON.parse(localStorage.getItem('smsk_user') || localStorage.getItem('dc_user') || 'null');

  const currentPath = window.location.pathname;
  const isAuthPage = currentPath.includes('/01-auth/') || currentPath.endsWith('auth.html') || currentPath.endsWith('login.html') || currentPath.endsWith('register.html') || currentPath.endsWith('verify-identity.html');

  const isHodUser = user && (String(user.role || '').toUpperCase().includes('HOD') || user.role === 'ADMIN' || user.role === 'FACULTY');

  // HOD/Admin accounts don't carry isRegistered/isActivated — skip strict registration check for them
  if (!token || !user || (!isHodUser && (user.isRegistered === false || user.isActivated === false))) {

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

  const currentFile = window.location.pathname.split('/').pop() || 'dashboard.html';
  const role = ((user && user.role) || 'STUDENT').toUpperCase();
  const isHodRole = role.includes('HOD') || role === 'FACULTY' || role === 'ADMIN';

  // LOOP-BREAKER: If HOD user landed on student dashboard, redirect them to HOD portal immediately
  if (isHodRole && (currentFile === 'dashboard.html' && window.location.pathname.includes('/02-student-portal/'))) {
    console.warn(`[Auth Guard] HOD role [${role}] detected on student portal — redirecting to HOD Console.`);
    const prefix = window.location.pathname.includes('/screens/') ? '..' : '/screens';
    window.location.replace(`${prefix}/04-hod-portal/hod-dashboard.html`);
    return null;
  }

  // If unauthenticated — HOD/Admin bypass the isRegistered check since they don't have that field
  if (!token || !user || (!isHodRole && (user.isRegistered === false || user.isActivated === false))) {
    validateActiveSession();
    return null;
  }

  // If user is any HOD role and accessing HOD routes or shared modules, grant immediate access
  const isHodPage = window.location.pathname.includes('/04-hod-portal/') || 
                    ['hod-dashboard.html', 'students-info.html', 'document-approvals.html', 'doc-approvals.html', 'security-roster.html', 'dept-students.html', 'fee-analytics.html'].includes(currentFile);
  const isSharedPage = ['marketplace.html', 'idea-hub.html', 'messages.html', 'fee-payments.html'].includes(currentFile);

  if (isHodRole && (isHodPage || isSharedPage)) {
    return user;
  }

  // Check route permissions from matrix
  const matrixAllowed = ROUTE_PERMISSIONS[currentFile];
  let isAllowed = false;

  if (matrixAllowed) {
    isAllowed = matrixAllowed.includes(role) || (isHodRole && matrixAllowed.some(r => r.includes('HOD')));
  } else if (allowedRoles && allowedRoles.length > 0) {
    isAllowed = allowedRoles.includes(role) || (isHodRole && allowedRoles.some(r => r.includes('HOD')));
  } else {
    isAllowed = true;
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
  const role = (user.role || '').toUpperCase();
  const isHodRole = role.includes('HOD') || role === 'FACULTY' || role === 'ADMIN';

  const allowedRoles = ROUTE_PERMISSIONS[currentFile];
  if (allowedRoles) {
    const isAllowed = allowedRoles.includes(role) || (isHodRole && allowedRoles.some(r => r.includes('HOD')));
    if (!isAllowed) {
      redirectToDefaultPortal(role);
      return false;
    }
  }
  return true;
}

export function redirectToDefaultPortal(role) {
  const isInsideScreens = window.location.pathname.includes('/screens/');
  const prefix = isInsideScreens ? '..' : '/screens';
  const r = (role || '').toUpperCase();

  if (r.includes('HOD') || r === 'FACULTY' || r === 'ADMIN' || r === 'SUPERADMIN') {
    window.location.replace(`${prefix}/04-hod-portal/hod-dashboard.html`);
  } else {
    window.location.replace(`${prefix}/02-student-portal/dashboard.html`);
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', validateActiveSession);
}
