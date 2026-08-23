/**
 * Fixed Left-Aligned Neumorphic Curved Dock Component & View Transitions Controller
 * Supports Strict Role-Based Navigation for Students, HODs, and Administrators.
 */

import { api } from './api.js';
import { setupThemeToggleListener } from './theme.js';

const STUDENT_NAV_ITEMS = [
  {
    label: 'Dashboard',
    file: '/screens/02-student-portal/dashboard.html',
    alias: 'dashboard.html',
    icon: `<svg class="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`
  },
  {
    label: 'Attendance',
    file: '/screens/02-student-portal/attendance.html',
    alias: 'attendance.html',
    icon: `<svg class="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`
  },
  {
    label: 'SBTET Results',
    file: '/screens/02-student-portal/results.html',
    alias: 'results.html',
    icon: `<svg class="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>`
  },
  {
    label: 'Idea Hub',
    file: '/screens/02-student-portal/idea-hub.html',
    alias: 'idea-hub.html',
    icon: `<svg class="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6m-4 4h2M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3 6h8c1.5-1.5 3-3.5 3-6a7 7 0 0 0-7-7z"></path></svg>`
  },
  {
    label: 'Marketplace',
    file: '/screens/02-student-portal/marketplace.html',
    alias: 'marketplace.html',
    icon: `<svg class="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`
  },
  {
    label: 'Messages',
    file: '/screens/02-student-portal/messages.html',
    alias: 'messages.html',
    icon: `<svg class="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`
  },
  {
    label: 'Document Requests',
    file: '/screens/02-student-portal/document-logistics.html',
    alias: 'doc-request.html',
    icon: `<svg class="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`
  },
  {
    label: 'Fee Payments',
    file: '/screens/02-student-portal/fee-payments.html',
    alias: 'payments.html',
    icon: `<svg class="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>`
  },
  {
    label: 'My Profile',
    file: '/screens/02-student-portal/profile.html',
    alias: 'profile.html',
    icon: `<svg class="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
  }
];

const HOD_NAV_ITEMS = [
  {
    label: 'HOD Console',
    file: '/screens/03-admin-portal/hod-dashboard.html',
    alias: 'hod-dashboard.html',
    icon: `<svg class="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`
  },
  {
    label: 'Students Info (001–180)',
    file: '/screens/03-admin-portal/students-info.html',
    alias: 'students-info.html',
    icon: `<svg class="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`
  },
  {
    label: 'Idea Hub',
    file: '/screens/02-student-portal/idea-hub.html',
    alias: 'idea-hub.html',
    icon: `<svg class="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6m-4 4h2M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3 6h8c1.5-1.5 3-3.5 3-6a7 7 0 0 0-7-7z"></path></svg>`
  },
  {
    label: 'Marketplace',
    file: '/screens/02-student-portal/marketplace.html',
    alias: 'marketplace.html',
    icon: `<svg class="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`
  },
  {
    label: 'Fee Analytics',
    file: '/screens/03-admin-portal/fee-analytics.html',
    alias: 'fee-analytics.html',
    icon: `<svg class="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>`
  },
  {
    label: 'Document Approvals',
    file: '/screens/03-admin-portal/document-approvals.html',
    alias: 'document-approvals.html',
    icon: `<svg class="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`
  },
  {
    label: 'Security Keys (180)',
    file: '/screens/03-admin-portal/security-roster.html',
    alias: 'security-roster.html',
    icon: `<svg class="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`
  }
];

export function renderDock(activeFileName = '', explicitRole = null) {
  const currentPath = activeFileName || window.location.pathname.split('/').pop() || 'dashboard.html';
  const authenticatedUser = api.getUser();
  const role = explicitRole || (authenticatedUser?.role?.includes('HOD') || authenticatedUser?.role === 'ADMIN' ? 'HOD' : 'STUDENT');
  const isHOD = role === 'HOD' || role === 'HOD_CS' || window.location.pathname.includes('/04-hod-portal/') || window.location.pathname.includes('/03-admin-portal/');

  const navItems = isHOD ? HOD_NAV_ITEMS : STUDENT_NAV_ITEMS;

  // Apply entering view animation to main content
  const mainContent = document.querySelector('.main-content');
  if (mainContent && !mainContent.classList.contains('view-enter')) {
    mainContent.classList.add('view-enter');
  }

  // Check if dock already exists in DOM
  let dock = document.querySelector('.neumorphic-dock');
  
  if (!dock) {
    dock = document.createElement('aside');
    dock.className = 'neumorphic-dock';
    dock.setAttribute('aria-label', isHOD ? 'HOD Navigation' : 'Main Navigation');

    const homeLink = isHOD ? '/screens/03-admin-portal/hod-dashboard.html' : '/screens/02-student-portal/dashboard.html';

    dock.innerHTML = `
      <div class="dock-header" style="margin-bottom: 1.5rem; display: flex; justify-content: center; width: 100%;">
        <a href="${homeLink}" class="smsk-badge" title="Samskruti College of Engineering & Technology">SMSK</a>
      </div>

      <nav class="dock-nav">
        ${navItems.map(item => {
          const itemBaseName = item.file.split('/').pop();
          const isActive = currentPath.includes(itemBaseName) || (item.alias && currentPath.includes(item.alias)) || window.location.pathname.endsWith(itemBaseName);
          return `
            <a href="${item.file}" class="dock-item ${isActive ? 'active' : ''}" data-tooltip="${item.label}">
              <span class="active-indicator"></span>
              ${item.icon}
            </a>
          `;
        }).join('')}
      </nav>

      <!-- Bottom Utilities: Theme Switcher & Logout -->
      <div class="dock-footer">
        <button type="button" id="theme-toggle-btn" class="dock-item theme-btn" data-tooltip="Toggle Theme" aria-label="Toggle Light/Dark Theme">
          <!-- Sun Icon (shown in dark mode) -->
          <svg class="dock-icon theme-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
          <!-- Moon Icon (shown in light mode) -->
          <svg class="dock-icon theme-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
        </button>

        <button type="button" class="dock-item logout-btn" id="dock-signout-btn" data-tooltip="Sign Out" aria-label="Sign Out">
          <svg class="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        </button>
      </div>
    `;

    // Wrap page structure with .app-layout if needed
    const layoutWrapper = document.querySelector('.app-layout') || document.querySelector('.app-container');
    if (layoutWrapper) {
      layoutWrapper.classList.add('app-layout');
      layoutWrapper.insertBefore(dock, layoutWrapper.firstChild);
    } else {
      document.body.insertBefore(dock, document.body.firstChild);
    }
  }

  // Setup theme toggle listener and smooth transitions
  setupThemeToggleListener();
  setupDockTransitions(currentPath);
}

function setupDockTransitions(currentPath) {
  const mainContent = document.querySelector('.main-content');

  // Sign out action
  const logoutBtn = document.getElementById('dock-signout-btn') || document.querySelector('.logout-btn');
  logoutBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    api.clearAuth();
    if (mainContent) {
      mainContent.classList.add('view-exit');
    }
    setTimeout(() => {
      window.location.replace('/screens/01-auth/login.html');
    }, 140);
  });

  // Navigation transitions
  document.querySelectorAll('.dock-item:not(.logout-btn):not(.theme-btn)').forEach(link => {
    const targetUrl = link.getAttribute('href');
    const currentUrl = currentPath || window.location.pathname.split('/').pop() || 'dashboard.html';

    // Sync active state
    if (targetUrl === currentUrl || (targetUrl && (currentUrl.includes(targetUrl.split('/').pop()) || window.location.pathname.endsWith(targetUrl.split('/').pop())))) {
      link.classList.add('active');
    }

    link.addEventListener('click', function(e) {
      if (this.classList.contains('logout-btn') || this.classList.contains('theme-btn') || targetUrl === currentUrl || targetUrl === '#') return;

      e.preventDefault();

      const main = document.querySelector('.main-content');
      if (main) main.classList.add('view-exit');

      setTimeout(() => {
        window.location.href = targetUrl;
      }, 140);
    });
  });
}

// Auto-run if DOM loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const current = window.location.pathname.split('/').pop() || 'dashboard.html';
    if (!document.querySelector('.neumorphic-dock') && !window.location.pathname.includes('/01-auth/')) {
      renderDock(current);
    }
  });
} else {
  const current = window.location.pathname.split('/').pop() || 'dashboard.html';
  if (!document.querySelector('.neumorphic-dock') && !window.location.pathname.includes('/01-auth/')) {
    renderDock(current);
  }
}
