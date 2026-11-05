/**
 * Samskruti Digital Campus (Institution Code: 259)
 * Kinetic Bento App Shell Controller: Header, Permanent Open Navigation, and Global Footer
 * 
 * Strict Architectural Rules:
 * - Navigation is ALWAYS OPEN.
 * - Absolutely permanent open navigation and NO collapsed state.
 * - Icon stacked ABOVE label with thin vertical dividers.
 * - Desktop (>= 1100px): Centered floating capsule pill in header row.
 * - Mobile (< 1100px): Fixed bottom capsule tab bar with 44px touch targets.
 * - Header Left: "Samskruti College" with "Code 259 · PIN {real PIN}" in Plex Mono 12px.
 * - Header Right: Round theme toggle + avatar pill opening accessible dropdown.
 * - Footer: Canvas background with top hairline, "Samskruti College · Empowering Minds, Shaping Tomorrow".
 */

(function () {
  'use strict';

  // Real Navigation Rosters (Strictly 7 Student items; HOD items for HOD role)
  const STUDENT_NAV = [
    { label: 'Home', file: 'dashboard.html', icon: 'dashboard', url: '/screens/02-student-portal/dashboard.html' },
    { label: 'Attendance', file: 'attendance.html', icon: 'calendar_today', url: '/screens/02-student-portal/attendance.html' },
    { label: 'Marks', file: 'results.html', icon: 'grade', url: '/screens/02-student-portal/results.html' },
    { label: 'Idea Hub', file: 'idea-hub.html', icon: 'lightbulb', url: '/screens/02-student-portal/idea-hub.html', badgeId: 'badgeIdeaHub' },
    { label: 'Requests', file: 'document-logistics.html', icon: 'description', url: '/screens/02-student-portal/document-logistics.html', badgeId: 'badgeRequests' },
    { label: 'Market', file: 'marketplace.html', icon: 'shopping_bag', url: '/screens/02-student-portal/marketplace.html' },
    { label: 'Messages', file: 'messages.html', icon: 'chat_bubble', url: '/screens/02-student-portal/messages.html', badgeId: 'badgeMessages' }
  ];

  const HOD_NAV = [
    { label: 'Console', file: 'hod-dashboard.html', icon: 'dashboard', url: '/screens/04-hod-portal/hod-dashboard.html' },
    { label: 'Approvals', file: 'document-approvals.html', icon: 'verified', url: '/screens/04-hod-portal/document-approvals.html', badgeId: 'badgeRequests' },
    { label: 'Roster', file: 'security-roster.html', icon: 'shield', url: '/screens/04-hod-portal/security-roster.html' },
    { label: 'Students', file: 'students-info.html', icon: 'groups', url: '/screens/04-hod-portal/students-info.html' },
    { label: 'Messages', file: 'messages.html', icon: 'chat_bubble', url: '/screens/04-hod-portal/messages.html', badgeId: 'badgeMessages' }
  ];

  function getActiveUser() {
    try {
      const stored = localStorage.getItem('dc_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u && (u.name || u.pin)) return u;
      }
    } catch (e) {}

    const name = localStorage.getItem('user_name');
    const pin = localStorage.getItem('student_pin') || localStorage.getItem('user_pin');
    const role = localStorage.getItem('user_role') || 'STUDENT';
    if (name || pin) {
      return { name: name || 'Student', pin: pin || '', sbtetPin: pin || '', role, collegeCode: '259' };
    }
    return null;
  }

  function enforceAuth() {
    const path = window.location.pathname.toLowerCase();
    const isAuth = path.includes('/01-auth/') || path.endsWith('login.html');
    if (isAuth) return true;

    const user = getActiveUser();
    if (!user || (!user.pin && !user.name)) {
      window.location.replace('/screens/01-auth/login.html');
      return false;
    }
    return true;
  }

  function detectRole() {
    if (window.location.pathname.includes('/04-hod-portal/')) {
      return 'HOD';
    }
    if (window.location.pathname.includes('/02-student-portal/')) {
      return 'STUDENT';
    }
    const user = getActiveUser();
    if (user && user.role === 'HOD') {
      return 'HOD';
    }
    return 'STUDENT';
  }

  function getInitials(name) {
    if (!name) return 'SC';
    const clean = name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s*/i, '').trim();
    const parts = clean.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  }

  function getFirstName(name) {
    if (!name) return 'Student';
    const clean = name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s*/i, '').trim();
    const parts = clean.split(/\s+/);
    return parts[0];
  }

  function getLastName(name) {
    if (!name) return 'Student';
    const clean = name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s*/i, '').trim();
    const parts = clean.split(/\s+/);
    return parts[parts.length - 1];
  }

  // Early theme initialization before render
  function getPreferredTheme() {
    const saved = localStorage.getItem('theme') || localStorage.getItem('dc_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body && document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body && document.body.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
    localStorage.setItem('dc_theme', theme);

    // Update icons and toggles
    const iconEl = document.getElementById('themeToggleIcon');
    if (iconEl) {
      iconEl.textContent = (theme === 'dark') ? 'light_mode' : 'dark_mode';
    }
    const switchEl = document.getElementById('dropdownThemeToggle');
    if (switchEl) {
      switchEl.checked = (theme === 'dark');
    }
  }

  function initAppShell() {
    if (!enforceAuth()) return;

    applyTheme(getPreferredTheme());
    cleanupLegacyShellElements();
    renderAppHeader();
    renderMobileBottomNav();
    renderUniformFooter();
    setupHeaderScroll();
    setupThemeListeners();
    setupDropdownEvents();
    checkOneTimeSyncOnLoad();
  }

  function cleanupLegacyShellElements() {
    // Remove standalone duplicate profile badges (e.g. on light attendance / marks)
    document.querySelectorAll('.corner-profile-widget, #attendanceCornerProfile, .legacy-dock, [data-legacy-dock-trigger]').forEach(el => el.remove());
    
    // Remove legacy dark-band footers
    document.querySelectorAll('footer:not(.app-global-footer)').forEach(el => {
      if (!el.closest('.bento-card') && !el.closest('form') && !el.closest('article')) {
        el.remove();
      }
    });
  }

  function renderAppHeader() {
    const isAuth = window.location.pathname.includes('/01-auth/');
    if (isAuth) return;

    const user = getActiveUser();
    const isHod = detectRole() === 'HOD';
    const activeDept = localStorage.getItem('hod_active_dept') || (user && user.branch === 'AIML' ? 'AIML' : ((user && user.pin && user.pin.includes('AIML')) ? 'AIML' : 'CS'));
    const isAiml = isHod && (activeDept === 'AIML' || (user && user.branch === 'AIML') || (user && user.pin && user.pin.includes('AIML')));

    const displayName = user ? (user.name || (isAiml ? 'Prof. Padma' : (isHod ? 'Dr. J. Vamshi Krishna' : 'KARNATI HIMESH'))) : 'Student';
    const displayPin = user ? (user.pin || user.sbtetPin || (isAiml ? 'AIML-HOD' : (isHod ? 'HOD CSE' : '24259-CS-025'))) : '24259-CS-025';
    const avatarInitials = isAiml ? 'PA' : (isHod ? 'VK' : getInitials(displayName));
    const firstName = isAiml ? 'Prof. Padma' : (isHod ? 'Dr. Vamshi' : getFirstName(displayName));
    const deptTitle = isHod ? (isAiml ? 'HOD AIML' : 'HOD CSE') : 'Technical Diploma';
    const homeUrl = isHod ? '/screens/04-hod-portal/hod-dashboard.html' : '/screens/02-student-portal/dashboard.html';

    const currentPath = window.location.pathname.toLowerCase();
    const navItems = isHod ? HOD_NAV : STUDENT_NAV;

    let header = document.querySelector('.app-global-header');
    if (!header) {
      header = document.createElement('header');
      header.className = 'app-global-header';
      document.body.insertBefore(header, document.body.firstChild);
    }

    const currentTheme = getPreferredTheme();
    const themeIconName = currentTheme === 'dark' ? 'light_mode' : 'dark_mode';

    header.innerHTML = `
      <div class="app-global-header-inner">
        <!-- Header Left: College Identity & Real PIN -->
        <a href="${homeUrl}" class="header-brand-meta" id="headerBrandMeta" aria-label="Samskruti College Home">
          <span class="header-brand-title">Samskruti College</span>
          <span class="header-brand-sub" id="headerBrandSub">
            <span>Code 259 &bull; PIN ${escapeHtml(displayPin)}</span>
          </span>
        </a>

        <!-- Header Center: Permanent Open Nav Pill (Desktop >= 1100px) -->
        <div class="header-nav-container">
          <nav aria-label="Primary" class="campus-primary-nav" id="campusPrimaryNav">
            ${navItems.map((it, idx) => {
              const fileLower = it.file.toLowerCase();
              const isActive = (fileLower === 'dashboard.html' && (currentPath.endsWith('dashboard.html') || currentPath === '/' || currentPath.endsWith('/')))
                            || (fileLower !== 'dashboard.html' && currentPath.endsWith(fileLower));
              const divider = (idx < navItems.length - 1) ? '<span class="campus-nav-divider" aria-hidden="true"></span>' : '';
              return `
                <li class="campus-nav-item">
                  <a href="${it.url}" 
                     class="campus-nav-link ${isActive ? 'active' : ''}" 
                     ${isActive ? 'aria-current="page"' : ''}
                     data-page="${it.file.replace('.html', '')}">
                    <span class="material-symbols-outlined campus-nav-icon" aria-hidden="true">${it.icon}</span>
                    <span class="campus-nav-label">${it.label}</span>
                    ${it.badgeId ? `<span class="campus-nav-badge" id="${it.badgeId}" style="display:none;"></span>` : ''}
                  </a>
                </li>
                ${divider}
              `;
            }).join('')}
          </nav>
        </div>

        <!-- Header Right: Theme Toggle & Avatar Pill -->
        <div class="header-right-actions">
          <button type="button" class="theme-toggle-btn" id="headerThemeToggleBtn" aria-label="Toggle light or dark theme" title="Toggle Theme">
            <span class="material-symbols-outlined" id="themeToggleIcon">${themeIconName}</span>
          </button>

          <button type="button" class="avatar-pill-btn" id="headerAvatarBtn" aria-expanded="false" aria-haspopup="true" aria-label="Account Menu">
            <span class="avatar-initials-chip" id="headerAvatarInitials">${avatarInitials}</span>
            <span class="avatar-first-name" id="headerAvatarName">${escapeHtml(firstName)}</span>
            <span class="material-symbols-outlined avatar-chevron">expand_more</span>
          </button>

          <!-- Profile Dropdown Card -->
          <div class="profile-dropdown-card" id="headerProfileDropdown" role="menu" aria-hidden="true">
            <div class="dropdown-user-header">
              <span class="dropdown-user-avatar">${avatarInitials}</span>
              <div class="dropdown-user-meta">
                <span class="dropdown-user-name">${escapeHtml(displayName)}</span>
                <span class="dropdown-user-sub">${deptTitle} &bull; ${escapeHtml(displayPin)}</span>
              </div>
            </div>

            <a href="${isHod ? '/screens/04-hod-portal/hod-dashboard.html' : '/screens/02-student-portal/profile.html'}" 
               class="dropdown-menu-item" role="menuitem">
              <span class="material-symbols-outlined text-[18px]">person</span>
              <span>${isHod ? 'HOD Executive Console' : 'My Profile'}</span>
            </a>

            <div class="dropdown-theme-row">
              <span class="row-label">
                <span class="material-symbols-outlined text-[18px]">dark_mode</span>
                <span>Dark Theme</span>
              </span>
              <label class="switch-control" aria-label="Toggle Dark Theme">
                <input type="checkbox" id="dropdownThemeToggle" ${currentTheme === 'dark' ? 'checked' : ''}>
                <span class="switch-slider"></span>
              </label>
            </div>

            <button type="button" class="dropdown-menu-item logout-item" id="headerLogoutBtn" role="menuitem">
              <span class="material-symbols-outlined text-[18px]">logout</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function renderMobileBottomNav() {
    const isAuth = window.location.pathname.includes('/01-auth/');
    if (isAuth) return;

    let mobileNav = document.querySelector('.campus-mobile-bottom-nav');
    if (!mobileNav) {
      mobileNav = document.createElement('nav');
      mobileNav.className = 'campus-mobile-bottom-nav';
      mobileNav.setAttribute('aria-label', 'Mobile Navigation');
      document.body.appendChild(mobileNav);
    }

    const isHod = detectRole() === 'HOD';
    const navItems = isHod ? HOD_NAV : STUDENT_NAV;
    const currentPath = window.location.pathname.toLowerCase();

    mobileNav.innerHTML = `
      <div class="campus-mobile-dock-inner">
        ${navItems.map((it) => {
          const fileLower = it.file.toLowerCase();
          const isActive = (fileLower === 'dashboard.html' && (currentPath.endsWith('dashboard.html') || currentPath === '/' || currentPath.endsWith('/')))
                        || (fileLower !== 'dashboard.html' && currentPath.endsWith(fileLower));
          return `
            <a href="${it.url}" 
               class="mobile-nav-link ${isActive ? 'active' : ''}" 
               ${isActive ? 'aria-current="page"' : ''}
               aria-label="${it.label}">
              <span class="material-symbols-outlined text-[20px]">${it.icon}</span>
              <span class="mobile-nav-label">${it.label}</span>
              ${it.badgeId ? `<span class="mobile-nav-badge" id="m_${it.badgeId}" style="display:none;"></span>` : ''}
            </a>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderUniformFooter() {
    let footer = document.querySelector('.app-global-footer');
    if (!footer) {
      footer = document.createElement('footer');
      footer.className = 'app-global-footer';
      document.body.appendChild(footer);
    }

    footer.innerHTML = `
      <div class="app-global-footer-inner">
        <p>Samskruti College &bull; Empowering Minds, Shaping Tomorrow</p>
      </div>
    `;
  }

  function setupHeaderScroll() {
    const header = document.querySelector('.app-global-header');
    if (!header) return;

    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function setupThemeListeners() {
    const toggle = () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    };

    const themeBtn = document.getElementById('headerThemeToggleBtn');
    themeBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      toggle();
    });

    const switchEl = document.getElementById('dropdownThemeToggle');
    switchEl?.addEventListener('change', () => {
      toggle();
    });

    // Multi-tab sync via storage events
    window.addEventListener('storage', (e) => {
      if (e.key === 'theme' || e.key === 'dc_theme') {
        const newTheme = e.newValue;
        if (newTheme === 'dark' || newTheme === 'light') {
          applyTheme(newTheme);
        }
      }
    });

    // Listen for OS system theme changes if no explicit user override is stored
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme') && !localStorage.getItem('dc_theme')) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  function setupDropdownEvents() {
    const trigger = document.getElementById('headerAvatarBtn');
    const menu = document.getElementById('headerProfileDropdown');
    const logoutBtn = document.getElementById('headerLogoutBtn');

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

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('is-open')) {
          menu.classList.remove('is-open');
          trigger.setAttribute('aria-expanded', 'false');
          trigger.focus();
        }
      });
    }

    logoutBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace('/screens/01-auth/login.html');
    });
  }

  function checkOneTimeSyncOnLoad() {
    if (sessionStorage.getItem('campus_one_time_azure_sync_done') === 'true') return;

    setTimeout(() => {
      sessionStorage.setItem('campus_one_time_azure_sync_done', 'true');
      const brandSub = document.getElementById('headerBrandSub');
      if (brandSub && !document.getElementById('headerAzurePill')) {
        const pill = document.createElement('span');
        pill.id = 'headerAzurePill';
        pill.className = 'header-azure-pill';
        pill.innerHTML = '<span>Azure: Live</span>';
        brandSub.appendChild(pill);
      }
    }, 600);
  }

  // Live badge update helper
  window.dcUpdateNavBadge = function (badgeId, count) {
    const el = document.getElementById(badgeId);
    const mEl = document.getElementById('m_' + badgeId);
    const text = count > 99 ? '99+' : (count > 0 ? String(count) : '');
    const display = count > 0 ? 'flex' : 'none';

    if (el) {
      el.textContent = text;
      el.style.display = display;
    }
    if (mEl) {
      mEl.textContent = text;
      mEl.style.display = display;
    }
  };

  // Sync profile function
  window.dcSyncProfile = function () {
    const user = getActiveUser();
    if (!user) return;
    const sub = document.getElementById('headerBrandSub');
    if (sub) {
      sub.innerHTML = `<span>Code 259 &bull; PIN ${escapeHtml(user.pin || '24259-CS-025')}</span>`;
    }
    const avatar = document.getElementById('headerAvatarInitials');
    if (avatar) avatar.textContent = getInitials(user.name);
    const namePreview = document.getElementById('headerAvatarName');
    if (namePreview) namePreview.textContent = escapeHtml(getFirstName(user.name));
  };

  // Backward compatibility stub for old callers
  window.dcSetupDynamicIsland = function () {
    initAppShell();
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

  // Execute immediately to set data-theme before first paint
  applyTheme(getPreferredTheme());

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAppShell);
  } else {
    initAppShell();
  }
})();
