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

async function populateUserProfile() {
  if (!user) return;

  const greetingElem = document.getElementById('user-greeting');
  const profileNameElem = document.getElementById('profile-name');
  const profilePinElem = document.getElementById('profile-pin');
  const initialsElem = document.getElementById('avatar-initials');
  const statusElem = document.getElementById('academic-status');

  let displayName = user.name || '';
  const pin = user.sbtetPin || user.rollNumber || localStorage.getItem('student_pin') || '';
  const dept = user.department || 'Computer Science & Engineering';

  if (!displayName || displayName.includes('Roll #') || displayName.toLowerCase() === 'student') {
    try {
      const res = await api.get(`/student/profile?pin=${encodeURIComponent(pin)}`);
      if (res && res.success && res.data?.name) {
        displayName = res.data.name;
        user.name = displayName;
        localStorage.setItem('dc_user', JSON.stringify(user));
      }
    } catch (e) {
      console.warn('[Dashboard Profile Hydration Fallback]');
    }
  }

  if (!displayName) displayName = 'Student';

  if (greetingElem) greetingElem.textContent = `Welcome back, ${displayName}`;
  if (profileNameElem) profileNameElem.textContent = displayName;
  if (profilePinElem) profilePinElem.textContent = pin ? `PIN: ${pin}` : '';
  if (statusElem) {
    statusElem.textContent = `Samskruti College (259) • Diploma C-24 • ${dept}`;
  }

  if (initialsElem) {
    const parts = displayName.trim().split(' ').filter(Boolean);
    initialsElem.textContent = parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : displayName.substring(0, 2).toUpperCase();
  }
}

function setupInteractiveCards() {
  console.log('[Dashboard] Initialized with full institutional overview.');
}
