/**
 * Campus Connect - Universal Floating Top Capsule Navigation Controller
 * Features: Hardware-accelerated sliding morph pill, role-based navigation,
 * theme toggle integration, and smooth view exit transitions.
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

const HOD_NAV_ITEMS = [
  { label: 'Dashboard', file: 'hod-dashboard.html', alias: 'dashboard.html', iconName: 'layout-dashboard' },
  { label: 'Student Roster', file: 'students-info.html', alias: 'dept-students.html', iconName: 'users' },
  { label: 'Document Approvals', file: 'document-approvals.html', alias: 'doc-approvals.html', iconName: 'file-check' },
  { label: 'Security Keys', file: 'security-roster.html', iconName: 'shield-check' }
];

export function renderDock(activeFileName = '', explicitRole = null) {
  const currentPath = activeFileName || window.location.pathname.split('/').pop() || 'dashboard.html';
  const authenticatedUser = api.getUser();
  const role = explicitRole || authenticatedUser?.role || 'STUDENT';
  const isHOD = role.toUpperCase().includes('HOD') || role === 'ADMIN' || window.location.pathname.includes('/04-hod-portal/') || window.location.pathname.includes('/03-admin-portal/');

  if (!window.location.pathname.includes('/01-auth/')) {
    if (isHOD) {
      renderHODCapsule(currentPath);
    } else {
      renderTopCapsule(currentPath);
    }
  }

  // Setup theme toggle listener and smooth transitions
  setupThemeToggleListener();
  setupNavTransitions(currentPath);
  setupMorphPillTracker();
}

export function renderTopCapsule(activeFileName = '') {
  const currentPath = activeFileName || window.location.pathname.split('/').pop() || 'dashboard.html';
  let capsuleContainer = document.querySelector('.top-nav-capsule-container');
  
  if (!capsuleContainer) {
    capsuleContainer = document.createElement('header');
    capsuleContainer.className = 'top-nav-capsule-container';
    capsuleContainer.innerHTML = `
      <nav class="capsule-nav" aria-label="Campus Connect Navigation">
        <a href="dashboard.html" class="capsule-brand" style="text-decoration: none;">
          <div class="brand-emblem-badge" title="Samskruti Institutions (259)">
            <img src="/assets/images/samskruti-logo-blue.png" alt="Campus Connect Logo" class="brand-logo-img" />
          </div>
          <span class="brand-title">CAMPUS <span class="accent-text">CONNECT</span></span>
        </a>

        <div class="nav-divider"></div>

        <div class="capsule-menu-items" id="capsule-menu-track">
          <div class="sliding-morph-pill" id="nav-morph-pill"></div>
          ${STUDENT_NAV_ITEMS.map(item => {
            const isActive = currentPath.includes(item.file) || (item.alias && currentPath.includes(item.alias));
            return `
              <a href="${item.file}" class="nav-item ${isActive ? 'active' : ''}" data-file="${item.file}">
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

    const targetWrapper = document.querySelector('.portal-viewport-wrapper') || document.querySelector('.app-layout') || document.body;
    targetWrapper.insertBefore(capsuleContainer, targetWrapper.firstChild);
    
    if (window.lucide) {
      window.lucide.createIcons();
    }
  } else {
    // If container already existed in static HTML, ensure morph pill is present
    const track = capsuleContainer.querySelector('.capsule-menu-items');
    if (track) {
      if (!track.id) track.id = 'capsule-menu-track';
      if (!document.getElementById('nav-morph-pill')) {
        const pill = document.createElement('div');
        pill.className = 'sliding-morph-pill';
        pill.id = 'nav-morph-pill';
        track.insertBefore(pill, track.firstChild);
      }
    }
  }
}

export function renderHODCapsule(activeFileName = '') {
  const currentPath = activeFileName || window.location.pathname.split('/').pop() || 'hod-dashboard.html';
  let capsuleContainer = document.querySelector('.top-nav-capsule-container');
  
  if (!capsuleContainer) {
    capsuleContainer = document.createElement('header');
    capsuleContainer.className = 'top-nav-capsule-container';
    capsuleContainer.innerHTML = `
      <nav class="capsule-nav" aria-label="HOD Executive Navigation">
        <a href="hod-dashboard.html" class="capsule-brand" style="text-decoration: none;">
          <div class="brand-emblem-badge" title="Samskruti Institutions (259) • HOD Console">
            <img src="/assets/images/samskruti-logo-blue.png" alt="Campus Connect Logo" class="brand-logo-img" />
          </div>
          <span class="brand-title">HOD <span class="accent-text">CONSOLE</span></span>
        </a>

        <div class="nav-divider"></div>

        <div class="capsule-menu-items" id="capsule-menu-track">
          <div class="sliding-morph-pill" id="nav-morph-pill"></div>
          ${HOD_NAV_ITEMS.map(item => {
            const isActive = currentPath.includes(item.file) || (item.alias && currentPath.includes(item.alias));
            return `
              <a href="${item.file}" class="nav-item ${isActive ? 'active' : ''}" data-file="${item.file}">
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

    const targetWrapper = document.querySelector('.portal-viewport-wrapper') || document.querySelector('.app-layout') || document.body;
    targetWrapper.insertBefore(capsuleContainer, targetWrapper.firstChild);
    
    if (window.lucide) {
      window.lucide.createIcons();
    }
  } else {
    // If container already existed in static HTML, ensure morph pill is present
    const track = capsuleContainer.querySelector('.capsule-menu-items');
    if (track) {
      if (!track.id) track.id = 'capsule-menu-track';
      if (!document.getElementById('nav-morph-pill')) {
        const pill = document.createElement('div');
        pill.className = 'sliding-morph-pill';
        pill.id = 'nav-morph-pill';
        track.insertBefore(pill, track.firstChild);
      }
    }
  }
}

/**
 * Updates sliding morph pill position to match active navigation link
 */
export function updateMorphPill(targetItem) {
  const pill = document.getElementById('nav-morph-pill');
  if (!pill || !targetItem) return;

  const track = document.getElementById('capsule-menu-track');
  if (!track) return;

  const left = targetItem.offsetLeft;
  const width = targetItem.offsetWidth;

  pill.style.width = `${width}px`;
  pill.style.transform = `translate3d(${left}px, -50%, 0)`;
  pill.classList.add('visible');
}

/**
 * Initializes position and resize listeners for the morph pill
 */
function setupMorphPillTracker() {
  requestAnimationFrame(() => {
    const activeItem = document.querySelector('.capsule-menu-items .nav-item.active');
    if (activeItem) {
      updateMorphPill(activeItem);
    }
  });

  window.addEventListener('resize', () => {
    const activeItem = document.querySelector('.capsule-menu-items .nav-item.active');
    if (activeItem) {
      updateMorphPill(activeItem);
    }
  });
}

function setupNavTransitions(currentPath) {
  const mainContent = document.querySelector('.main-content') || document.querySelector('.dashboard-canvas') || document.querySelector('.portal-viewport-wrapper');

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

  // Smooth link transitions & morph pill animation on click
  document.querySelectorAll('.nav-item').forEach(link => {
    const targetUrl = link.getAttribute('href');
    const currentUrl = currentPath || window.location.pathname.split('/').pop() || 'dashboard.html';

    if (targetUrl === currentUrl || (targetUrl && currentUrl.includes(targetUrl))) {
      link.classList.add('active');
    }

    link.addEventListener('click', function(e) {
      if (targetUrl === currentUrl || targetUrl === '#') return;
      e.preventDefault();

      // Glide pill to the clicked link immediately
      updateMorphPill(this);

      document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
      this.classList.add('active');

      if (mainContent) mainContent.classList.add('view-exit');
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 140);
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
