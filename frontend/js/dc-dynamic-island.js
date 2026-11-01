/**
 * Samskruti Digital Campus (Institution Code: 259)
 * Dynamic Island Dock, Global Navigation, Ambient Wave Graphics & Profile Controller
 * Matches Reference 1.png (Expanded Dock) and Reference 2.png (Collapsed "CC" Pill)
 */

(function () {
  'use strict';

  // Student Navigation Items (Exactly matching Reference 1.png: 8 items, all labeled)
  const STUDENT_NAV = [
    { label: 'Dashboard', file: 'dashboard.html', url: '/screens/02-student-portal/dashboard.html', icon: 'layout-dashboard' },
    { label: 'Attendance', file: 'attendance.html', url: '/screens/02-student-portal/attendance.html', icon: 'calendar-check' },
    { label: 'Marks', file: 'results.html', url: '/screens/02-student-portal/results.html', icon: 'graduation-cap' },
    { label: 'Idea Hub', file: 'idea-hub.html', url: '/screens/02-student-portal/idea-hub.html', icon: 'lightbulb' },
    { label: 'Requests', file: 'document-logistics.html', url: '/screens/02-student-portal/document-logistics.html', icon: 'file-text' },
    { label: 'Market', file: 'marketplace.html', url: '/screens/02-student-portal/marketplace.html', icon: 'shopping-bag' },
    { label: 'Messages', file: 'messages.html', url: '/screens/02-student-portal/messages.html', icon: 'message-square' }
  ];

  // HOD Navigation Items (8 items, all labeled)
  const HOD_NAV = [
    { label: 'Overview', file: 'hod-dashboard.html', url: '/screens/04-hod-portal/hod-dashboard.html', icon: 'layout-dashboard' },
    { label: 'Students Roster', file: 'students-info.html', url: '/screens/04-hod-portal/students-info.html', icon: 'users' },
    { label: 'Approvals', file: 'document-approvals.html', url: '/screens/04-hod-portal/document-approvals.html', icon: 'file-check' },
    { label: 'Security Keys', file: 'security-roster.html', url: '/screens/04-hod-portal/security-roster.html', icon: 'shield-check' },
    { label: 'Analytics', file: 'fee-analytics.html', url: '/screens/04-hod-portal/fee-analytics.html', icon: 'bar-chart-3' },
    { label: 'Idea Hub', file: 'idea-hub.html', url: '/screens/02-student-portal/idea-hub.html', icon: 'lightbulb' },
    { label: 'Marketplace', file: 'marketplace.html', url: '/screens/02-student-portal/marketplace.html', icon: 'shopping-bag' },
    { label: 'Home', file: 'dashboard.html', url: '/screens/02-student-portal/dashboard.html', icon: 'home' }
  ];

  /**
   * Safe Session User Resolution
   */
  function getActiveUser() {
    try {
      const raw = localStorage.getItem('dc_user') || localStorage.getItem('smsk_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.name || parsed.pin || parsed.sbtetPin)) {
          return {
            name: parsed.name,
            pin: parsed.pin || parsed.sbtetPin || parsed.rollNumber,
            role: parsed.role || 'STUDENT',
            branch: parsed.branch || 'CS',
            department: parsed.department || 'Computer Science & Engineering',
            collegeCode: parsed.collegeCode || '259'
          };
        }
      }
    } catch (e) {
      console.warn('[Session Sync]', e);
    }

    const pin = localStorage.getItem('student_pin');
    const name = localStorage.getItem('user_name');
    const role = localStorage.getItem('user_role');

    if (name || pin) {
      return {
        name: name || (detectRole() === 'HOD' ? 'Dr. J. Vamshi Krishna' : 'Student'),
        pin: pin || (detectRole() === 'HOD' ? 'VAMSHI-CS-HOD' : '24259-CS-040'),
        role: role || (detectRole() === 'HOD' ? 'HOD_CS' : 'STUDENT'),
        branch: 'CS',
        department: 'Computer Science & Engineering',
        collegeCode: '259'
      };
    }

    // Role-aware default reference baseline
    if (detectRole() === 'HOD') {
      return {
        name: 'Dr. J. Vamshi Krishna',
        pin: 'VAMSHI-CS-HOD',
        role: 'HOD_CS',
        branch: 'CS',
        department: 'Computer Science & Engineering',
        collegeCode: '259'
      };
    }

    return {
      name: 'Tallapalli Tulasi Ram Goud',
      pin: '24259-CS-040',
      role: 'STUDENT',
      branch: 'CS',
      department: 'Computer Science & Engineering',
      collegeCode: '259'
    };
  }

  function detectRole() {
    const path = window.location.pathname;
    if (path.includes('/04-hod-portal/')) return 'HOD';
    try {
      const raw = localStorage.getItem('dc_user') || localStorage.getItem('smsk_user');
      if (raw) {
        const u = JSON.parse(raw);
        if (u && u.role && (u.role.toUpperCase().includes('HOD') || u.role === 'ADMIN' || u.role === 'FACULTY')) {
          return 'HOD';
        }
      }
    } catch (_) {}
    const role = localStorage.getItem('user_role');
    if (role && (role.toUpperCase().includes('HOD') || role === 'ADMIN' || role === 'FACULTY')) {
      return 'HOD';
    }
    return 'STUDENT';
  }

  /**
   * Derive Clean User Initials
   */
  function getInitials(name) {
    if (!name) return 'ST';
    const clean = name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s*/i, '').trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return clean.substring(0, 2).toUpperCase();
  }

  /**
   * Global Animated Wave Background Graphics (Left & Bottom-Right)
   */
  function injectAmbientWaveGraphics() {
    if (document.getElementById('ambientWaveGraphics')) return;

    const container = document.createElement('div');
    container.id = 'ambientWaveGraphics';
    container.className = 'ambient-graphic-container';
    container.setAttribute('aria-hidden', 'true');

    container.innerHTML = `
      <!-- Left-Side Flowing Waves -->
      <div class="ambient-waves-left">
        <svg viewBox="0 0 520 1000" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M-80 0 C 140 180, 220 380, 120 540 C 20 700, 180 840, 220 1000 L -80 1000 Z" fill="url(#leftWaveGrad1)" opacity="0.65" />
          <path d="M-80 0 C 80 140, 160 320, 60 510 C -40 700, 110 820, 160 1000 L -80 1000 Z" fill="url(#leftWaveGrad2)" opacity="0.50" />
          <path d="M-80 0 C 40 220, 90 420, 10 600 C -70 780, 70 890, 90 1000 L -80 1000 Z" fill="url(#leftWaveGrad3)" opacity="0.40" />
          <defs>
            <linearGradient id="leftWaveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#10b981" stop-opacity="0.28" />
              <stop offset="50%" stop-color="#6ee7b7" stop-opacity="0.18" />
              <stop offset="100%" stop-color="#059669" stop-opacity="0.32" />
            </linearGradient>
            <linearGradient id="leftWaveGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#34d399" stop-opacity="0.22" />
              <stop offset="70%" stop-color="#a7f3d0" stop-opacity="0.15" />
              <stop offset="100%" stop-color="#047857" stop-opacity="0.25" />
            </linearGradient>
            <linearGradient id="leftWaveGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#059669" stop-opacity="0.20" />
              <stop offset="100%" stop-color="#10b981" stop-opacity="0.10" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <!-- Bottom-Right Flowing Graphic Waves -->
      <div class="ambient-waves-right">
        <svg viewBox="0 0 680 520" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M680 520 L 0 520 C 180 440, 310 460, 420 360 C 530 260, 580 120, 680 0 Z" fill="url(#rightWaveGrad1)" opacity="0.65" />
          <path d="M680 520 L 80 520 C 240 460, 360 470, 460 390 C 560 310, 610 180, 680 60 Z" fill="url(#rightWaveGrad2)" opacity="0.50" />
          <path d="M680 520 L 220 520 C 340 480, 420 490, 510 420 C 600 350, 630 240, 680 140 Z" fill="url(#rightWaveGrad3)" opacity="0.40" />
          <defs>
            <linearGradient id="rightWaveGrad1" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#0d4722" stop-opacity="0.30" />
              <stop offset="50%" stop-color="#10b981" stop-opacity="0.22" />
              <stop offset="100%" stop-color="#6ee7b7" stop-opacity="0.12" />
            </linearGradient>
            <linearGradient id="rightWaveGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#059669" stop-opacity="0.25" />
              <stop offset="100%" stop-color="#34d399" stop-opacity="0.15" />
            </linearGradient>
            <linearGradient id="rightWaveGrad3" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#064e26" stop-opacity="0.22" />
              <stop offset="100%" stop-color="#10b981" stop-opacity="0.10" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <!-- Sparkle Stars (✦) -->
      <div class="ambient-sparkles">
        <span class="ambient-sparkle" style="top: 15%; left: 8%;">✦</span>
        <span class="ambient-sparkle" style="top: 65%; left: 14%;">✦</span>
        <span class="ambient-sparkle" style="top: 25%; right: 12%;">✦</span>
        <span class="ambient-sparkle" style="top: 80%; right: 20%;">✦</span>
      </div>
    `;

    document.body.insertBefore(container, document.body.firstChild);
  }

  /**
   * Theme Initialization & Management (Light Default)
   */
  function initTheme() {
    const saved = localStorage.getItem('dc_theme') || 'light';
    applyTheme(saved);
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dc_theme', theme);
    localStorage.setItem('smsk_theme', theme);

    // Update icons
    const icons = document.querySelectorAll('#themeIcon, .theme-icon');
    icons.forEach(icon => {
      icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
    });

    const toggle = document.getElementById('dropdownThemeToggle');
    if (toggle) toggle.checked = (theme === 'dark');

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  /**
   * Remove any legacy hardcoded static docks or corner profile widgets from the page body
   */
  function cleanLegacyPageElements() {
    // Hide or remove old duplicate docks that were baked into static HTML
    document.querySelectorAll(
      '.portal-viewport-wrapper > header.expandable-dock-wrapper, ' +
      '.portal-viewport-wrapper > .dynamic-island-container, ' +
      '.app-layout > header.expandable-dock-wrapper, ' +
      '.app-layout > .dynamic-island-container, ' +
      '.top-nav-capsule-container, ' +
      'body > .dc-orb-bg, ' +
      'body > .expandable-dock-wrapper:not(.app-global-header .expandable-dock-wrapper), ' +
      'body > header.expandable-dock-wrapper:not(.app-global-header *)'
    ).forEach(el => {
      el.remove();
    });

    // Remove legacy corner profile widgets that clash with top right header avatar
    document.querySelectorAll(
      '.corner-profile-widget, ' +
      '#hodCornerProfile, ' +
      '#attendanceCornerProfile, ' +
      '#docCornerProfile, ' +
      '#messagesCornerProfile, ' +
      '#marketCornerProfile, ' +
      '#profileCornerProfile, ' +
      '#ideaHubCornerProfile, ' +
      '#resultsCornerProfile, ' +
      '[class*="corner-profile"], ' +
      '.fixed-profile-widget'
    ).forEach(el => {
      el.remove();
    });
  }

  /**
   * Setup Global Header Bar (Identity, Center Dock mount, Right Avatar & Dropdown)
   * Matches Reference 1.png and Reference 2.png
   */
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

    const displayName = user.name || (isHod ? 'Dr. J. Vamshi Krishna' : 'Tallapalli Tulasi Ram Goud');
    const displayPin = user.pin || (isHod ? 'HOD CSE' : '24259-CS-040');
    const avatarInitials = isHod ? 'VK' : getInitials(displayName);
    const firstName = displayName.split(/\s+/)[0] || displayName;

    header.innerHTML = `
      <!-- Header Left: College Identity (Reference 1.png & 2.png) -->
      <a href="${isHod ? '/screens/04-hod-portal/hod-dashboard.html' : '/screens/02-student-portal/dashboard.html'}" class="header-brand-meta" style="text-decoration: none; color: inherit;">
        <span class="header-brand-title">Samskruti College</span>
        <span class="header-brand-sub" id="headerBrandSub">Code: 259 • PIN: ${displayPin}</span>
      </a>

      <!-- Header Center: Expandable Dynamic Island Dock Mounting Point -->
      <div class="expandable-dock-wrapper" id="campusDockWrapper"></div>

      <!-- Header Right: Theme Switch, Divider & Profile Badge (Matches 1.png & 2.png) -->
      <div class="header-right-actions" id="headerRightActions">
        ${!isAuth ? `
          <button type="button" class="theme-switch-btn" id="headerThemeBtn" title="Toggle Theme" aria-label="Toggle Theme">
            <i data-lucide="moon" id="themeIcon"></i>
          </button>

          <!-- Vertical Divider (Reference 1.png) -->
          <div class="header-divider-v" style="width: 1px; height: 18px; background: rgba(16, 185, 129, 0.28); margin: 0 2px;" aria-hidden="true"></div>

          <button type="button" class="profile-badge-btn" id="profileBadgeTrigger" aria-expanded="false" aria-haspopup="true">
            <span class="profile-badge-avatar" id="globalAvatarInitials">${avatarInitials}</span>
            <span class="profile-badge-name-preview" id="globalNamePreview">${firstName}</span>
            <i data-lucide="chevron-down" class="profile-badge-chevron"></i>
          </button>

          <!-- Sleek Luxury Frosted Glass Dropdown Card -->
          <div class="profile-dropdown-card" id="profileDropdownMenu" role="menu" aria-hidden="true">
            <div class="dropdown-user-header">
              <span class="dropdown-user-avatar" id="dropdownAvatarInitials">${avatarInitials}</span>
              <div class="dropdown-user-meta">
                <span class="dropdown-user-name" id="dropdownUserName">${displayName}</span>
                <span class="dropdown-user-sub" id="dropdownUserSub">${isHod ? 'Head of Department' : 'Verified Student'} • ${displayPin}</span>
              </div>
            </div>

            <div class="dropdown-divider-v" aria-hidden="true"></div>

            <div class="dropdown-menu-list">
              <a href="${isHod ? '/screens/04-hod-portal/hod-dashboard.html' : '/screens/02-student-portal/profile.html'}" class="dropdown-menu-item" role="menuitem">
                <i data-lucide="${isHod ? 'shield-check' : 'user'}"></i>
                <span>${isHod ? 'HOD Executive Console' : 'My Student Profile'}</span>
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
    `;

    attachProfileDropdownEvents();
  }

  function setupDynamicIslandDock() {
    const dockWrapper = document.getElementById('campusDockWrapper');
    if (!dockWrapper) return;

    const isHod = detectRole() === 'HOD';
    const isAuth = window.location.pathname.includes('/01-auth/');
    const currentPath = window.location.pathname.toLowerCase();

    // If on auth page, provide simple links to Student / HOD
    if (isAuth) {
      dockWrapper.innerHTML = `
        <nav class="expandable-dock capsule-nav" id="campusDynamicIsland" aria-label="Primary" role="navigation">
          <button class="dock-collapsed-trigger" id="dockCollapsedTrigger" type="button" aria-label="Expand Navigation Dock">
            <img src="/assets/images/samskruti-green-s.png" alt="Samskruti" class="dock-collapsed-logo" onerror="this.src='/frontend/assets/images/samskruti-green-s.png';" />
          </button>
          <div class="dock-expanded-content" role="region">
            <div class="dock-brand-container">
              <div class="dock-logo-badge">
                <img src="/assets/images/samskruti-green-s.png" alt="Samskruti" onerror="this.src='/frontend/assets/images/samskruti-green-s.png';" />
              </div>
              <span class="dock-wordmark">
                <span class="wordmark-campus">CAMPUS</span>
                <span class="wordmark-connect">CONNECT</span>
              </span>
            </div>
            <div class="dock-divider"></div>
            <ul class="dock-nav-track" role="menubar">
              <li class="dock-nav-item"><a href="/screens/01-auth/login.html" class="dock-nav-link active"><i data-lucide="lock"></i><span class="dock-nav-label">Portal Access</span></a></li>
            </ul>
          </div>
        </nav>
      `;
      attachDockPhysics();
      return;
    }

    const navItems = isHod ? HOD_NAV : STUDENT_NAV;
    const brandPrefix = isHod ? 'HOD' : 'CAMPUS';
    const brandSuffix = isHod ? 'CONSOLE' : 'CONNECT';
    const brandHomeUrl = isHod ? '/screens/04-hod-portal/hod-dashboard.html' : '/screens/02-student-portal/dashboard.html';

    dockWrapper.innerHTML = `
      <nav class="expandable-dock capsule-nav" 
           id="campusDynamicIsland" 
           aria-label="Primary Navigation" 
           aria-expanded="false" 
           role="navigation">
        
        <!-- 1. Collapsed State: Green Stylized S Logo inside Pill (Matches User Request & Image 3) -->
        <button class="dock-collapsed-trigger" 
                id="dockCollapsedTrigger" 
                type="button" 
                aria-label="Expand Navigation Dock" 
                aria-haspopup="true">
          <img src="/assets/images/samskruti-green-s.png" 
               alt="Samskruti" 
               class="dock-collapsed-logo" 
               onerror="this.src='/frontend/assets/images/samskruti-green-s.png';" />
        </button>

        <!-- 2. Expanded State: Full Nav with all 8 items labeled + Options After Profile -->
        <div class="dock-expanded-content" role="region" aria-label="Navigation Menu">
          
          <!-- Logo Mark + Wordmark (Reference 1.png) -->
          <a href="${brandHomeUrl}" class="dock-brand-container" title="Samskruti College (Code: 259)">
            <div class="dock-logo-badge brand-emblem-badge">
              <img src="/assets/images/samskruti-green-s.png" 
                   alt="SCET" 
                   onerror="this.src='/frontend/assets/images/samskruti-green-s.png';" />
            </div>
            <span class="dock-wordmark brand-title">
              <span class="wordmark-campus">${brandPrefix}</span>
              <span class="wordmark-connect">${brandSuffix}</span>
            </span>
          </a>

          <!-- Thin Vertical Divider (Reference 1.png) -->
          <div class="dock-divider nav-divider" aria-hidden="true"></div>

          <!-- All Navigation Items Track -->
          <ul class="dock-nav-track capsule-menu-items" id="dockNavTrack" role="menubar">
            
            <!-- Sliding Glass Indicator -->
            <div class="dock-sliding-indicator" id="dockSlidingIndicator" aria-hidden="true"></div>

            ${navItems.map((item) => {
              const itemFile = item.file.toLowerCase();
              const isActive = (itemFile === 'dashboard.html' && (currentPath.endsWith('dashboard.html') || currentPath === '/' || currentPath.endsWith('/')))
                            || (itemFile !== 'dashboard.html' && currentPath.endsWith(itemFile));
              return `
                <li class="dock-nav-item" role="none">
                  <a href="${item.url}" 
                     class="dock-nav-link nav-item ${isActive ? 'active' : ''}" 
                     role="menuitem"
                     ${isActive ? 'aria-current="page"' : ''}
                     data-page="${item.file.replace('.html', '')}">
                    <i data-lucide="${item.icon}" aria-hidden="true"></i>
                    <span class="dock-nav-label">${item.label}</span>
                  </a>
                </li>
              `;
            }).join('')}
          </ul>

          <!-- Thin Divider Before Quick Options -->
          <div class="dock-divider nav-divider" aria-hidden="true"></div>

          <!-- Options after Profile: Theme Toggle & Logout -->
          <div class="dock-actions-cluster" aria-label="Quick Actions">
            <button type="button" class="dock-util-btn" id="dockThemeToggleBtn" title="Toggle Dark/Light Theme" aria-label="Toggle Theme">
              <i data-lucide="moon" class="theme-icon"></i>
            </button>
            <button type="button" class="dock-util-btn dock-logout-btn" id="dockLogoutActionBtn" title="Sign Out" aria-label="Sign Out">
              <i data-lucide="log-out"></i>
            </button>
          </div>

        </div>
      </nav>
    `;

    attachDockPhysics();
  }

  function attachDockPhysics() {
    const dock = document.getElementById('campusDynamicIsland');
    const track = document.getElementById('dockNavTrack');
    const indicator = document.getElementById('dockSlidingIndicator');

    if (!dock) return;

    let expandTimeout = null;
    let collapseTimeout = null;

    // Hover intent handlers (40ms expand delay, 260ms collapse buffer)
    dock.addEventListener('mouseenter', () => {
      clearTimeout(collapseTimeout);
      expandTimeout = setTimeout(() => {
        dock.classList.add('is-expanded');
        dock.setAttribute('aria-expanded', 'true');
        positionIndicatorToActive();
      }, 40);
    });

    dock.addEventListener('mouseleave', () => {
      clearTimeout(expandTimeout);
      collapseTimeout = setTimeout(() => {
        if (!dock.contains(document.activeElement)) {
          dock.classList.remove('is-expanded');
          dock.setAttribute('aria-expanded', 'false');
        }
      }, 260);
    });

    // Keyboard focus support
    dock.addEventListener('focusin', () => {
      dock.classList.add('is-expanded');
      dock.setAttribute('aria-expanded', 'true');
      positionIndicatorToActive();
    });

    dock.addEventListener('focusout', (e) => {
      setTimeout(() => {
        if (!dock.contains(document.activeElement)) {
          dock.classList.remove('is-expanded');
          dock.setAttribute('aria-expanded', 'false');
        }
      }, 100);
    });

    // Touch support for mobile / tablet
    dock.addEventListener('click', (e) => {
      if (e.target.closest('.dock-nav-link')) return;
      dock.classList.toggle('is-expanded');
      const isExp = dock.classList.contains('is-expanded');
      dock.setAttribute('aria-expanded', String(isExp));
      if (isExp) positionIndicatorToActive();
    });

    // Sliding indicator track logic
    if (track && indicator) {
      const items = track.querySelectorAll('.dock-nav-link');

      function moveIndicator(linkEl) {
        if (!linkEl) {
          indicator.style.opacity = '0';
          return;
        }
        const linkRect = linkEl.getBoundingClientRect();
        const trackRect = track.getBoundingClientRect();

        const offsetLeft = linkRect.left - trackRect.left;
        const width = linkRect.width;

        indicator.style.transform = `translate3d(${offsetLeft}px, -50%, 0)`;
        indicator.style.width = `${width}px`;
        indicator.style.opacity = '1';
      }

      function positionIndicatorToActive() {
        const activeLink = track.querySelector('.dock-nav-link.active');
        if (activeLink) {
          track.classList.add('has-active');
          moveIndicator(activeLink);
        } else {
          indicator.style.opacity = '0';
        }
      }

      items.forEach(link => {
        link.addEventListener('mouseenter', () => {
          track.classList.add('has-hover');
          moveIndicator(link);
        });

        link.addEventListener('mouseleave', () => {
          track.classList.remove('has-hover');
          positionIndicatorToActive();
        });
      });

      // Initial active position
      setTimeout(positionIndicatorToActive, 100);
    }
  }

  /**
   * Profile Dropdown & Theme Toggle Events
   */
  function attachProfileDropdownEvents() {
    const trigger = document.getElementById('profileBadgeTrigger');
    const menu = document.getElementById('profileDropdownMenu');
    const headerThemeBtn = document.getElementById('headerThemeBtn');
    const dockThemeBtn = document.getElementById('dockThemeToggleBtn');
    const dockLogoutBtn = document.getElementById('dockLogoutActionBtn');
    const themeToggle = document.getElementById('dropdownThemeToggle');
    const logoutBtn = document.getElementById('dropdownLogoutBtn');

    function toggleMenu(show) {
      if (!menu || !trigger) return;
      const isOpen = typeof show === 'boolean' ? show : !menu.classList.contains('is-open');
      menu.classList.toggle('is-open', isOpen);
      menu.classList.toggle('is-active', isOpen);
      trigger.classList.toggle('open', isOpen);
      trigger.setAttribute('aria-expanded', String(isOpen));
      menu.setAttribute('aria-hidden', String(!isOpen));
    }

    if (trigger && menu) {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
      });

      document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !trigger.contains(e.target)) {
          toggleMenu(false);
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          toggleMenu(false);
        }
      });
    }

    function handleThemeSwitch() {
      const curr = document.documentElement.getAttribute('data-theme') || 'light';
      const next = curr === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    }

    if (headerThemeBtn) {
      headerThemeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleThemeSwitch();
      });
    }

    if (dockThemeBtn) {
      dockThemeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleThemeSwitch();
      });
    }

    if (themeToggle) {
      themeToggle.addEventListener('change', (e) => {
        applyTheme(e.target.checked ? 'dark' : 'light');
      });
    }

    function handleLogout() {
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace('/screens/01-auth/login.html');
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }
    if (dockLogoutBtn) {
      dockLogoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleLogout();
      });
    }
  }

  function syncStudentProfile() {
    const user = getActiveUser();
    const initials = getInitials(user.name);

    // Sync header brand subtitle PIN
    const headerBrandSub = document.getElementById('headerBrandSub');
    if (headerBrandSub) {
      headerBrandSub.textContent = `Code: 259 • PIN: ${user.pin}`;
    }

    // Sync header avatar initials
    const globalInitialsEl = document.getElementById('globalAvatarInitials');
    if (globalInitialsEl) globalInitialsEl.textContent = initials;

    const dropdownAvatarEl = document.getElementById('dropdownAvatarInitials');
    if (dropdownAvatarEl) dropdownAvatarEl.textContent = initials;

    const dropdownNameEl = document.getElementById('dropdownUserName');
    if (dropdownNameEl) dropdownNameEl.textContent = user.name;

    const globalNameEl = document.getElementById('globalNamePreview');
    if (globalNameEl) globalNameEl.textContent = (user.name || 'Student').split(/\s+/)[0];

    const dropdownSubEl = document.getElementById('dropdownUserSub');
    if (dropdownSubEl) dropdownSubEl.textContent = `${user.role || 'Student'} • ${user.pin}`;

    // Sync hero greeting if on dashboard
    const heroName = document.getElementById('heroStudentName');
    if (heroName) {
      const parts = user.name.trim().split(' ');
      const last = parts.length > 1 ? parts.pop() : '';
      const first = parts.join(' ');
      heroName.innerHTML = `${first} <span class="accent-name">${last}</span>`;
    }

    const heroMeta = document.getElementById('heroStudentMeta');
    if (heroMeta) {
      heroMeta.textContent = `Samskruti College (Code: 259) • PIN: ${user.pin}`;
    }

    // Sync profile page elements if present
    const profileName = document.getElementById('profile-student-name');
    if (profileName) profileName.textContent = user.name;

    const profileAvatar = document.getElementById('profile-avatar');
    if (profileAvatar) profileAvatar.textContent = initials;

    const profileDeptSub = document.getElementById('profile-dept-sub');
    if (profileDeptSub) profileDeptSub.textContent = `${user.department || 'Computer Science & Engineering'} • Samskruti College (259)`;

    const profileBadgePin = document.getElementById('profile-badge-pin');
    if (profileBadgePin) profileBadgePin.textContent = user.pin;

    const profPin = document.getElementById('prof-pin');
    if (profPin) profPin.textContent = user.pin;

    const profBranch = document.getElementById('prof-branch');
    if (profBranch) profBranch.textContent = user.department || 'Computer Science & Engineering';

    // Sync attendance page elements if present
    const attGreeting = document.getElementById('greeting-title');
    if (attGreeting && !attGreeting.textContent.includes('Live Biometric')) {
      attGreeting.textContent = `Good morning, ${user.name}`;
    }
    const attSub = document.getElementById('student-meta-subtitle');
    if (attSub) {
      attSub.textContent = `Samskruti College (Code: 259) • ${user.name} • PIN: ${user.pin}`;
    }
    const attDisplayName = document.getElementById('student-display-name');
    if (attDisplayName) attDisplayName.textContent = user.name;
    const attDisplayPin = document.getElementById('student-display-pin');
    if (attDisplayPin) attDisplayPin.textContent = user.pin;
    const attAvatar = document.getElementById('student-avatar-initials');
    if (attAvatar) attAvatar.textContent = initials;

    // Sync results page subtitle
    const resultsSub = document.getElementById('results-student-meta');
    if (resultsSub) {
      resultsSub.textContent = `Samskruti College (Code: 259) • ${user.name} (PIN: ${user.pin}) • SBTET Verified`;
    }

    // Sync document logistics header
    const docMeta = document.getElementById('doc-student-meta');
    if (docMeta) {
      docMeta.textContent = `Samskruti College (Code: 259) • ${user.name} (PIN: ${user.pin}) • Direct HOD Queue & Instant OTP`;
    }

    // Sync marketplace header
    const marketMeta = document.getElementById('market-student-meta');
    if (marketMeta) {
      marketMeta.textContent = `Samskruti College (Code: 259) • ${user.name} (PIN: ${user.pin}) • Campus Surplus`;
    }

    // Sync messages header
    const msgMeta = document.getElementById('msg-student-meta');
    if (msgMeta) {
      msgMeta.textContent = `Samskruti College (Code: 259) • ${user.name} (PIN: ${user.pin}) • Instant Messenger`;
    }
  }

  /**
   * Master Initialization
   */
  function init() {
    initTheme();
    cleanLegacyPageElements();
    injectAmbientWaveGraphics();
    setupGlobalHeader();
    setupDynamicIslandDock();
    syncStudentProfile();

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', () => {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  });

  // Global Exports
  window.dcInitDynamicIsland = init;
  window.dcSetupDynamicIsland = setupDynamicIslandDock;
  window.dcSyncProfile = syncStudentProfile;
  window.dcGetActiveUser = getActiveUser;
})();
