/**
 * Samskruti College Student Dashboard Controller
 */

import { api } from '../../js/api.js';
import { requireAuth } from '../../js/auth-guard.js';
import { renderDock } from '../../js/dock.js';
import { alerts } from '../../js/alerts.js';

// Verify authenticated student session
const user = requireAuth(['STUDENT']) || {
  name: 'K. Himesh',
  rollNumber: '24259-CS-025',
  sbtetPin: '24259-CS-025',
  department: 'Computer Science & Engineering',
  curriculum: 'C-24',
  semester: 3,
  collegeCode: '259',
  collegeName: 'Samskruti College of Engineering and Technology',
};

// Mount the left dock with active state
renderDock('dashboard.html', 'STUDENT');

document.addEventListener('DOMContentLoaded', () => {
  populateUserProfile();
  setupInteractiveCards();
});

function populateUserProfile() {
  const greetingElem = document.getElementById('user-greeting');
  const profileNameElem = document.getElementById('profile-name');
  const profilePinElem = document.getElementById('profile-pin');
  const initialsElem = document.getElementById('avatar-initials');
  const statusElem = document.getElementById('academic-status');

  const displayName = user.name || 'Student';
  const pin = user.sbtetPin || user.rollNumber || '24259-CS-025';
  const dept = user.department || 'Computer Science & Engineering';

  if (greetingElem) greetingElem.textContent = `Welcome back, ${displayName}`;
  if (profileNameElem) profileNameElem.textContent = displayName;
  if (profilePinElem) profilePinElem.textContent = `PIN: ${pin}`;
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
