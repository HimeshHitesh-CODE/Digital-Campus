/**
 * Campus Connect - Universal Floating Top Capsule Navigation Controller
 * Supports Strict Role-Based Navigation for Students, HODs, and Administrators.
 */

import { api } from './api.js';
import { setupThemeToggleListener } from './theme.js';

const STUDENT_NAV_ITEMS = [
  { label: 'Dashboard', file: 'dashboard.html', iconName: 'layout-dashboard' },
  { label: 'Attendance', file: 'attendance.html', iconName: 'calendar-check' },
  { label: 'Results', file: 'results.html', iconName: 'graduation-cap' },
  { label: 'Idea Hub', file: 'idea-hub.html', iconName: 'lightbulb' },
  { label: 'Marketplace', file: 'marketplace.html', iconName: 'shopping-bag' },
  { label: 'Messages', file: 'messages.html', iconName: 'message-square' },
  { label: 'Requests', file: 'document-logistics.html', alias: 'doc-request.html', iconName: 'file-text' },
  { label: 'Profile', file: 'profile.html', iconName: 'user' }
];

export function renderDock(activeFileName = '', explicitRole = null) {
  const currentPath = activeFileName || window.location.pathname.split('/').pop() || 'dashboard.html';
  const authenticatedUser = api.getUser();
  const role = explicitRole || (authenticatedUser?.role?.includes('HOD') || authenticatedUser?.role === 'ADMIN' ? 'HOD' : 'STUDENT');
  const isHOD = role === 'HOD' || role === 'HOD_CS' || window.location.pathname.includes('/04-hod-portal/') || window.location.pathname.includes('/03-admin-portal/');

  // If in Student Portal, ensure Top Floating Capsule is rendered
  if (!isHOD && !window.location.pathname.includes('/01-auth/')) {
    renderTopCapsule(currentPath);
  }

  // Setup theme toggle listener and smooth transitions
  setupThemeToggleListener();
  setupNavTransitions(currentPath);
}

export function renderTopCapsule(activeFileName = '') {
  const currentPath = activeFileName || window.location.pathname.split('/').pop() || 'dashboard.html';
  let capsuleContainer = document.querySelector('.top-nav-capsule-container');
  
  if (!capsuleContainer) {
    capsuleContainer = document.createElement('header');
    capsuleContainer.className = 'top-nav-capsule-container';
    capsuleContainer.innerHTML = `
      <nav class="capsule-nav" aria-label="Campus Connect Navigation">
        <div class="capsule-brand">
          <div class="brand-emblem-badge" title="Samskruti Institutions (259)">
            <img src="/assets/images/samskruti-logo-blue.png" alt="Campus Connect Logo" class="brand-logo-img" />
          </div>
          <span class="brand-title">CAMPUS <span class="accent-text">CONNECT</span></span>
        </div>

        <div class="nav-divider"></div>

        <div class="capsule-menu-items">
          ${STUDENT_NAV_ITEMS.map(item => {
            const isActive = currentPath.includes(item.file) || (item.alias && currentPath.includes(item.alias));
            return `
              <a href="${item.file}" class="nav-item ${isActive ? 'active' : ''}">
                <i data-lucide="${item.iconName}"></i>
                <span>${item.label}</span>
              </a>
            `;
          }).join('')}
        </div>

        <div class="capsule-actions">
          <button type="button" id="theme-toggle-btn" class="util-btn" title="Toggle Theme" aria-label="Toggle Theme">
            <i data-lucide="sun"></i>
          </button>
          <a href="/screens/01-auth/login.html" class="util-btn logout" title="Sign Out" aria-label="Sign Out" onclick="localStorage.clear(); sessionStorage.clear();">
            <i data-lucide="log-out"></i>
          </a>
        </div>
      </nav>
    `;

    const targetWrapper = document.querySelector('.portal-viewport-wrapper') || document.body;
    targetWrapper.insertBefore(capsuleContainer, targetWrapper.firstChild);
    
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
}

function setupNavTransitions(currentPath) {
  const mainContent = document.querySelector('.main-content') || document.querySelector('.dashboard-canvas');

  // Sign out action
  const logoutBtns = document.querySelectorAll('.util-btn.logout, .logout-btn');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.clear();
      sessionStorage.clear();
      api.clearAuth();
      if (mainContent) {
        mainContent.classList.add('view-exit');
      }
      setTimeout(() => {
        window.location.replace('/screens/01-auth/login.html');
      }, 140);
    });
  });

  // Smooth link transitions
  document.querySelectorAll('.nav-item').forEach(link => {
    const targetUrl = link.getAttribute('href');
    const currentUrl = currentPath || window.location.pathname.split('/').pop() || 'dashboard.html';

    if (targetUrl === currentUrl || (targetUrl && currentUrl.includes(targetUrl))) {
      link.classList.add('active');
    }

    link.addEventListener('click', function(e) {
      if (targetUrl === currentUrl || targetUrl === '#') return;
      e.preventDefault();
      if (mainContent) mainContent.classList.add('view-exit');
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 120);
    });
  });
}

// Auto-run on DOMContentLoaded if not on login page
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const current = window.location.pathname.split('/').pop() || 'dashboard.html';
    if (!window.location.pathname.includes('/01-auth/')) {
      renderDock(current);
    }
  });
} else {
  const current = window.location.pathname.split('/').pop() || 'dashboard.html';
  if (!window.location.pathname.includes('/01-auth/')) {
    renderDock(current);
  }
}
