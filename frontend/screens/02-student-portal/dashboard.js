/**
 * Samskruti College Student Dashboard Controller
 */

import { api } from '../../js/api.js';
import { requireAuth } from '../../js/auth-guard.js';
import { renderDock } from '../../js/dock.js';
import { alerts } from '../../js/alerts.js';

// Verify authenticated student session
const user = requireAuth(['STUDENT', 'HOD', 'HOD_CS', 'ADMIN']);

if (user) {
  // Mount the left dock with active state
  renderDock('dashboard.html', user.role || 'STUDENT');

  document.addEventListener('DOMContentLoaded', () => {
    populateUserProfile();
    setupInteractiveCards();
  });
}

function populateUserProfile() {
  if (!user) return;

  const greetingElem = document.getElementById('user-greeting');
  const profileNameElem = document.getElementById('profile-name');
  const profilePinElem = document.getElementById('profile-pin');
  const initialsElem = document.getElementById('avatar-initials');
  const statusElem = document.getElementById('academic-status');

  const displayName = user.name || 'Student';
  const pin = user.sbtetPin || user.rollNumber || '';
  const dept = user.department || 'Computer Science & Engineering';

  if (greetingElem) greetingElem.textContent = `Welcome back, ${displayName}`;
  if (profileNameElem) profileNameElem.textContent = displayName;
  if (profilePinElem) profilePinElem.textContent = pin ? `PIN: ${pin}` : '';
  if (statusElem) {
    statusElem.textContent = `Samskruti College (259) • Diploma C-24 • ${dept}`;
  }

  if (initialsElem) {
    const parts = displayName.split(' ');
    initialsElem.textContent = parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : displayName.substring(0, 2).toUpperCase();
  }
}

function setupInteractiveCards() {
  console.log('[Dashboard] Initialized with full institutional overview.');
}
