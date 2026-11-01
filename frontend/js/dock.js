/**
 * Campus Connect - Universal Floating Top Dynamic Island Dock Controller
 * Integrates natively with dc-dynamic-island.js for true Apple-grade Dynamic Island physics.
 */

import { api } from './api.js';
import { setupThemeToggleListener } from './theme.js';

export function renderDock(activeFileName = '', explicitRole = null) {
  if (typeof window.dcSetupDynamicIsland === 'function') {
    window.dcSetupDynamicIsland();
  }
  if (typeof window.dcSyncProfile === 'function') {
    window.dcSyncProfile();
  }
  setupThemeToggleListener();
  setupNavTransitions();
}

export function renderTopCapsule(activeFileName = '') {
  renderDock(activeFileName, 'STUDENT');
}

export function renderHODCapsule(activeFileName = '') {
  renderDock(activeFileName, 'HOD');
}

export function updateMorphPill() {
  // Maintained for backward compatibility
}

function setupNavTransitions() {
  const mainContent = document.querySelector('.main-content') || document.querySelector('.dashboard-canvas') || document.querySelector('.portal-viewport-wrapper');

  // Sign out action
  const logoutBtns = document.querySelectorAll('.util-btn.logout, .logout-btn, #dockLogoutBtn');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.clear();
      sessionStorage.clear();
      if (api && api.clearAuth) api.clearAuth();
      if (mainContent) {
        mainContent.classList.add('view-exit');
      }
      setTimeout(() => {
        window.location.replace('/screens/01-auth/login.html');
      }, 120);
    });
  });
}

// Auto-run on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.includes('/01-auth/')) {
      renderDock();
    }
  });
} else {
  if (!window.location.pathname.includes('/01-auth/')) {
    renderDock();
  }
}
