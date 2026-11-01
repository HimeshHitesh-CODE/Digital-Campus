/**
 * Samskruti Digital Campus (Institution Code: 259)
 * Dynamic Island Morphing Navigation Dock & Header Shell Controller
 *
 * Master Specification:
 * - Collapsed: Small glass pill (72px x 56px) with bold light-mint "CC" monogram.
 * - Expanded: High-velocity fluent expanded dock with icon stacked ABOVE label,
 *   thin dividers between items, active mint pill with accent dot beneath.
 * - Animation: 380ms expand / 240ms collapse with cubic-bezier(0.22, 1, 0.36, 1).
 * - Single centered container alignment for brand, hero, and page content.
 */

(function () {
  'use strict';

  // Master Configuration Flags
  const DOCK_MODE = 'hover-expand'; // 'hover-expand' (default) | 'always-expanded'
  const EXPAND_DELAY_MS = 35;
  const COLLAPSE_BUFFER_MS = 220;
  const COLLAPSE_WIDTH_PX = 72;

  // Real Navigation Roster (7 student items; ZERO Profile in dock)
  const STUDENT_NAV = [
    { label: 'Home', file: 'dashboard.html', icon: 'layout-dashboard', url: '/screens/02-student-portal/dashboard.html' },
    { label: 'Attendance', file: 'attendance.html', icon: 'users', url: '/screens/02-student-portal/attendance.html' },
    { label: 'Marks', file: 'results.html', icon: 'award', url: '/screens/02-student-portal/results.html' },
    { label: 'Idea Hub', file: 'idea-hub.html', icon: 'lightbulb', url: '/screens/02-student-portal/idea-hub.html', badgeId: 'badgeIdeaHub' },
    { label: 'Requests', file: 'document-logistics.html', icon: 'file-text', url: '/screens/02-student-portal/document-logistics.html', badgeId: 'badgeRequests' },
    { label: 'Market', file: 'marketplace.html', icon: 'shopping-bag', url: '/screens/02-student-portal/marketplace.html' },
    { label: 'Messages', file: 'messages.html', icon: 'message-square', url: '/screens/02-student-portal/messages.html', badgeId: 'badgeMessages' }
  ];

  const HOD_NAV = [
    { label: 'Console', file: 'hod-dashboard.html', icon: 'shield-check', url: '/screens/04-hod-portal/hod-dashboard.html' },
    { label: 'Approvals', file: 'document-approvals.html', icon: 'file-check', url: '/screens/04-hod-portal/document-approvals.html', badgeId: 'badgeRequests' },
    { label: 'Roster', file: 'security-roster.html', icon: 'users', url: '/screens/04-hod-portal/security-roster.html' },
    { label: 'Students', file: 'students-info.html', icon: 'graduation-cap', url: '/screens/04-hod-portal/students-info.html' },
    { label: 'Messages', file: 'messages.html', icon: 'message-square', url: '/screens/02-student-portal/messages.html', badgeId: 'badgeMessages' }
  ];

  function getActiveUser() {
    try {
      const stored = localStorage.getItem('dc_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u && (u.name || u.pin)) return u;
      }
    } catch (e) {}

    const name = localStorage.getItem('user_name') || 'KARNATI HIMESH';
    const pin = localStorage.getItem('student_pin') || '24259-CS-025';
    const role = localStorage.getItem('user_role') || 'STUDENT';
    return { name, pin, sbtetPin: pin, role, collegeCode: '259' };
  }

  function detectRole() {
    const user = getActiveUser();
    if (user.role === 'HOD' || window.location.pathname.includes('/04-hod-portal/')) {
      return 'HOD';
    }
    return 'STUDENT';
  }

  function getInitials(name) {
    if (!name) return 'KH';
    const clean = name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s*/i, '').trim();
    const parts = clean.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  }

  function getLastName(name) {
    if (!name) return 'HIMESH';
    const clean = name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s*/i, '').trim();
    const parts = clean.split(/\s+/);
    return parts[parts.length - 1].toUpperCase();
  }

  let measuredExpandedWidth = 680;

  function initDynamicShell() {
    cleanupLegacyDocks();
    setupGlobalHeader();
    setupDynamicIslandDock();
    setupHeaderScroll();
    applyActiveThemeVisuals();
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  function cleanupLegacyDocks() {
    document.querySelectorAll('.corner-profile-widget, #attendanceCornerProfile').forEach(el => el.remove());
  }

  function setupGlobalHeader() {
    const user = getActiveUser();
    const isHod = detectRole() === 'HOD';
    const isAuth = window.location.pathname.includes('/01-auth/');

    let header = document.querySelector('.app-global-header');
    if (!header) {
      header = document.createElement('header');
      header.className = 'app-global-header';
      document.body.insertBefore(header, document.body.firstChild);
    }

    const displayName = user.name || (isHod ? 'Dr. J. Vamshi Krishna' : 'KARNATI HIMESH');
    const displayPin = user.pin || user.sbtetPin || (isHod ? 'HOD CSE' : '24259-CS-025');
    const avatarInitials = isHod ? 'VK' : getInitials(displayName);
    const lastName = isHod ? 'VAMSHI' : getLastName(displayName);

    header.innerHTML = `
      <div class="app-global-header-inner">
        <!-- Header Left: Clean College Identity without pill border -->
        <a href="${isHod ? '/screens/04-hod-portal/hod-dashboard.html' : '/screens/02-student-portal/dashboard.html'}" 
           class="header-brand-meta" 
           id="headerBrandMeta"
           aria-label="Samskruti College Home">
          <span class="header-brand-title">Samskruti College</span>
          <span class="header-brand-sub" id="headerBrandSub">Code: 259 &bull; PIN: ${escapeHtml(displayPin)}</span>
        </a>

        <!-- Header Center: Floating Dynamic Island Mount -->
        <div class="dc-floating-island-wrapper" id="campusIslandMount"></div>

        <!-- Header Right: Theme Switch, Divider & Profile Dropdown -->
        <div class="header-right-actions" id="headerRightActions">
          ${!isAuth ? `
            <button type="button" class="theme-switch-btn" id="headerThemeBtn" title="Toggle Light/Dark Theme" aria-label="Toggle Theme">
              <i data-lucide="moon" id="themeIcon"></i>
            </button>

            <div class="header-divider-v" aria-hidden="true"></div>

            <button type="button" class="profile-badge-btn" id="profileBadgeTrigger" aria-expanded="false" aria-haspopup="true">
              <span class="profile-badge-avatar" id="globalAvatarInitials">${avatarInitials}</span>
              <span class="profile-badge-name-preview" id="globalNamePreview">${escapeHtml(lastName)}</span>
              <i data-lucide="chevron-down" class="profile-badge-chevron"></i>
            </button>

            <!-- Profile Dropdown Card -->
            <div class="profile-dropdown-card" id="profileDropdownMenu" role="menu" aria-hidden="true">
              <div class="dropdown-user-header">
                <span class="dropdown-user-avatar">${avatarInitials}</span>
                <div class="dropdown-user-meta">
                  <span class="dropdown-user-name">${escapeHtml(displayName)}</span>
                  <span class="dropdown-user-sub">${isHod ? 'HOD Computer Science' : 'Student'} &bull; ${escapeHtml(displayPin)}</span>
                </div>
              </div>

              <div class="dropdown-divider-v" aria-hidden="true"></div>

              <div class="dropdown-menu-list">
                <a href="${isHod ? '/screens/04-hod-portal/hod-dashboard.html' : '/screens/02-student-portal/profile.html'}" 
                   class="dropdown-menu-item" role="menuitem">
                  <i data-lucide="${isHod ? 'shield-check' : 'user'}"></i>
                  <span>${isHod ? 'HOD Executive Console' : 'My Profile'}</span>
                </a>

                <div class="dropdown-theme-row">
                  <span class="row-label">
                    <i data-lucide="moon"></i>
                    <span>Dark Theme</span>
                  </span>
                  <label class="switch-control" aria-label="Toggle Dark Theme">
                    <input type="checkbox" id="dropdownThemeToggle">
                    <span class="switch-slider"></span>
                  </label>
                </div>

                <div class="dropdown-divider-v" aria-hidden="true"></div>

                <button type="button" class="dropdown-menu-item logout-item" id="dropdownLogoutBtn" role="menuitem">
                  <i data-lucide="log-out"></i>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ` : `
            <button type="button" class="theme-switch-btn" id="headerThemeBtn" title="Toggle Theme" aria-label="Toggle Theme">
              <i data-lucide="moon" id="themeIcon"></i>
            </button>
          `}
        </div>
      </div>
    `;

    attachDropdownEvents();
  }

  function setupDynamicIslandDock() {
    const mount = document.getElementById('campusIslandMount');
    if (!mount) return;

    const isHod = detectRole() === 'HOD';
    const isAuth = window.location.pathname.includes('/01-auth/');
    const currentPath = window.location.pathname.toLowerCase();

    if (isAuth) {
      mount.innerHTML = `
        <nav class="dc-dynamic-island-nav" id="campusDynamicIsland" aria-label="Primary">
          <div class="dock-cc-monogram">CC</div>
        </nav>
      `;
      return;
    }

    const items = isHod ? HOD_NAV : STUDENT_NAV;

    mount.innerHTML = `
      <nav class="dc-dynamic-island-nav expandable-dock" 
           id="campusDynamicIsland" 
           aria-label="Primary" 
           aria-expanded="false" 
           role="navigation">
        
        <!-- Collapsed State: Bold "CC" Monogram Pill -->
        <button type="button" 
                class="dock-collapsed-trigger" 
                id="dockCollapsedBtn" 
                aria-label="Expand Campus Navigation">
          <span class="dock-cc-monogram">CC</span>
        </button>

        <!-- Expanded State: Navigation Items with Icon ABOVE Label -->
        <div class="dock-expanded-content" id="dockExpandedContent">
          <ul class="dock-nav-track" id="dockNavTrack" role="menubar">
            ${items.map((it, idx) => {
              const fileLower = it.file.toLowerCase();
              const isActive = (fileLower === 'dashboard.html' && (currentPath.endsWith('dashboard.html') || currentPath === '/' || currentPath.endsWith('/')))
                            || (fileLower !== 'dashboard.html' && currentPath.endsWith(fileLower));
              const divider = (idx < items.length - 1) ? '<span class="dock-divider" aria-hidden="true"></span>' : '';
              return `
                <li class="dock-nav-item" role="none" style="--item-index: ${idx};">
                  <a href="${it.url}" 
                     class="dock-nav-link ${isActive ? 'active' : ''}" 
                     role="menuitem"
                     ${isActive ? 'aria-current="page"' : ''}
                     data-page="${it.file.replace('.html', '')}">
                    <i data-lucide="${it.icon}" aria-hidden="true"></i>
                    <span class="dock-nav-label">${it.label}</span>
                    ${it.badgeId ? `<span class="dock-badge" id="${it.badgeId}" style="display:none;"></span>` : ''}
                    ${isActive ? '<span class="active-dot" aria-hidden="true"></span>' : ''}
                  </a>
                </li>
                ${divider}
              `;
            }).join('')}
          </ul>
        </div>
      </nav>
    `;

    attachDockPhysics();
  }

  function attachDockPhysics() {
    const dock = document.getElementById('campusDynamicIsland');
    const expandedContent = document.getElementById('dockExpandedContent');
    const collapsedBtn = document.getElementById('dockCollapsedBtn');
    if (!dock || !expandedContent) return;

    // Measure natural expanded width with ResizeObserver
    function measureWidth() {
      const scrollW = expandedContent.scrollWidth;
      if (scrollW > 200) {
        measuredExpandedWidth = scrollW + 28;
      }
    }
    measureWidth();
    window.addEventListener('resize', measureWidth);

    let expandTimer = null;
    let collapseTimer = null;

    function expandDock() {
      clearTimeout(collapseTimer);
      expandTimer = setTimeout(() => {
        measureWidth();
        dock.style.width = `${measuredExpandedWidth}px`;
        dock.classList.add('is-expanded');
        dock.setAttribute('aria-expanded', 'true');
      }, EXPAND_DELAY_MS);
    }

    function collapseDock() {
      clearTimeout(expandTimer);
      collapseTimer = setTimeout(() => {
        if (!dock.contains(document.activeElement)) {
          dock.style.width = `${COLLAPSE_WIDTH_PX}px`;
          dock.classList.remove('is-expanded');
          dock.setAttribute('aria-expanded', 'false');
        }
      }, COLLAPSE_BUFFER_MS);
    }

    if (DOCK_MODE === 'always-expanded') {
      dock.classList.add('is-expanded');
      dock.style.width = `${measuredExpandedWidth}px`;
      dock.setAttribute('aria-expanded', 'true');
      return;
    }

    // Default collapsed width
    dock.style.width = `${COLLAPSE_WIDTH_PX}px`;

    // Hover-intent
    dock.addEventListener('mouseenter', expandDock);
    dock.addEventListener('mouseleave', collapseDock);

    // Keyboard focus
    dock.addEventListener('focusin', expandDock);
    dock.addEventListener('focusout', collapseDock);

    // Escape collapses
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        dock.style.width = `${COLLAPSE_WIDTH_PX}px`;
        dock.classList.remove('is-expanded');
        dock.setAttribute('aria-expanded', 'false');
        collapsedBtn?.focus();
      }
    });

    // Touch support
    collapsedBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (dock.classList.contains('is-expanded')) {
        collapseDock();
      } else {
        expandDock();
      }
    });

    document.addEventListener('click', (e) => {
      if (!dock.contains(e.target) && dock.classList.contains('is-expanded')) {
        dock.style.width = `${COLLAPSE_WIDTH_PX}px`;
        dock.classList.remove('is-expanded');
        dock.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function setupHeaderScroll() {
    const header = document.querySelector('.app-global-header');
    if (!header) return;

    const onScroll = () => {
      if (window.scrollY > 8) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function attachDropdownEvents() {
    const trigger = document.getElementById('profileBadgeTrigger');
    const menu = document.getElementById('profileDropdownMenu');
    const themeBtn = document.getElementById('headerThemeBtn');
    const dropdownToggle = document.getElementById('dropdownThemeToggle');
    const logoutBtn = document.getElementById('dropdownLogoutBtn');

    if (trigger && menu) {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = menu.classList.contains('is-open');
        menu.classList.toggle('is-open', !isOpen);
        trigger.setAttribute('aria-expanded', String(!isOpen));
      });

      document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !trigger.contains(e.target)) {
          menu.classList.remove('is-open');
          trigger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Theme toggles
    const toggleTheme = () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('dc_theme', next);
      applyActiveThemeVisuals();
    };

    themeBtn?.addEventListener('click', toggleTheme);
    dropdownToggle?.addEventListener('change', toggleTheme);

    // Logout
    logoutBtn?.addEventListener('click', () => {
      localStorage.removeItem('dc_user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('dc_auth_token');
      window.location.href = '/screens/01-auth/login.html';
    });
  }

  function applyActiveThemeVisuals() {
    const theme = localStorage.getItem('dc_theme') || document.documentElement.getAttribute('data-theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);

    const themeIcon = document.getElementById('themeIcon');
    const dropdownToggle = document.getElementById('dropdownThemeToggle');

    if (themeIcon) {
      themeIcon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
    }
    if (dropdownToggle) {
      dropdownToggle.checked = (theme === 'dark');
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // Profile data sync
  window.dcSyncProfile = function () {
    const user = getActiveUser();
    const sub = document.getElementById('headerBrandSub');
    if (sub) {
      sub.innerHTML = `Code: 259 &bull; PIN: ${escapeHtml(user.pin || '24259-CS-025')}`;
    }
    const avatar = document.getElementById('globalAvatarInitials');
    if (avatar) avatar.textContent = getInitials(user.name);
    const namePrev = document.getElementById('globalNamePreview');
    if (namePrev) namePrev.textContent = getLastName(user.name);
  };

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDynamicShell);
  } else {
    initDynamicShell();
  }
})();
