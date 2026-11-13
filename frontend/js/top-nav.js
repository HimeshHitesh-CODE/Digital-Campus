/**
 * Samskruti Digital Campus (Institution Code: 259)
 * UNIFIED TOP NAVIGATION SYSTEM — V4.0
 * 
 * Replaces the old CC pill / dynamic island with a clean, always-open floating pill nav.
 * Role-Strict:
 *   - Student (7 Slots): Dashboard, Attendance, Marks, Idea Hub, Requests, Market, Messages.
 *   - HOD (5 Slots): Dashboard, Students, Roster, Approvals, Messages.
 * Live Badges, Dual Theme Support, and Responsive Mobile Bottom Bar (< 1100px).
 */

(function () {
  'use strict';

  // Navigation Rosters
  const STUDENT_NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: 'home', url: '/screens/02-student-portal/dashboard.html' },
    { id: 'attendance', label: 'Attendance', icon: 'fact_check', url: '/screens/02-student-portal/attendance.html' },
    { id: 'marks', label: 'Marks', icon: 'query_stats', url: '/screens/02-student-portal/results.html' },
    { id: 'ideahub', label: 'Idea Hub', icon: 'lightbulb', url: '/screens/02-student-portal/idea-hub.html', badgeKey: 'ideahub' },
    { id: 'requests', label: 'Requests', icon: 'assignment', url: '/screens/02-student-portal/document-logistics.html', badgeKey: 'requests' },
    { id: 'market', label: 'Market', icon: 'storefront', url: '/screens/02-student-portal/marketplace.html' },
    { id: 'messages', label: 'Messages', icon: 'chat_bubble', url: '/screens/02-student-portal/messages.html', badgeKey: 'messages' }
  ];

  const HOD_NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: 'space_dashboard', url: '/screens/04-hod-portal/hod-dashboard.html' },
    { id: 'students', label: 'Students', icon: 'school', url: '/screens/04-hod-portal/students-info.html' },
    { id: 'roster', label: 'Roster', icon: 'badge', url: '/screens/04-hod-portal/security-roster.html' },
    { id: 'approvals', label: 'Approvals', icon: 'approval_delegation', url: '/screens/04-hod-portal/document-approvals.html', badgeKey: 'requests' },
    { id: 'messages', label: 'Messages', icon: 'forum', url: '/screens/04-hod-portal/messages.html', badgeKey: 'messages' }
  ];

  const badgeCounts = { ideahub: 0, requests: 0, messages: 0 };

  function getUser() {
    try {
      const stored = localStorage.getItem('dc_user') || localStorage.getItem('smsk_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u && (u.name || u.pin || u.sbtetPin)) return u;
      }
    } catch (e) {}

    const name = localStorage.getItem('user_name');
    const pin = localStorage.getItem('student_pin') || localStorage.getItem('user_pin');
    const role = localStorage.getItem('user_role');
    if (name || pin) {
      return {
        name: name || 'Student',
        pin: pin || '',
        sbtetPin: pin || '',
        role: role || (pin && pin.includes('HOD') ? 'HOD' : 'STUDENT'),
        collegeCode: '259'
      };
    }
    return null;
  }

  function getRole(user) {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('/04-hod-portal/')) return 'HOD';
    if (path.includes('/02-student-portal/')) return 'STUDENT';
    if (user) {
      const role = String(user.role || '').toUpperCase();
      if (role.includes('HOD') || (user.pin && user.pin.includes('HOD'))) return 'HOD';
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

  function getTheme() {
    return localStorage.getItem('dc_theme') || 'dark';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dc_theme', theme);
    const iconEl = document.getElementById('ccThemeToggleIcon');
    if (iconEl) {
      iconEl.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
    }
    const dropThemeText = document.getElementById('ccDropThemeText');
    if (dropThemeText) {
      dropThemeText.textContent = theme === 'dark' ? 'Switch to Light' : 'Switch to Dark';
    }
  }

  function getActiveSlotId(navItems) {
    const path = window.location.pathname.toLowerCase();
    for (const item of navItems) {
      const itemFile = item.url.split('/').pop().toLowerCase();
      if (path.endsWith(itemFile) || path.includes(item.id)) {
        return item.id;
      }
    }
    return navItems[0].id;
  }

  function renderHeader(user, role, navItems) {
    // Remove legacy headers if any exist
    const legacy = document.querySelector('.app-global-header, #cc-top-header, .cc-app-header');
    if (legacy) legacy.remove();

    const activeId = getActiveSlotId(navItems);
    const activeItem = navItems.find(item => item.id === activeId) || navItems[0];
    const theme = getTheme();
    const name = user ? user.name : (role === 'HOD' ? 'HOD' : 'Student');
    const initials = getInitials(name);
    const firstName = name.replace(/^(Dr\.|Prof\.)\s*/i, '').trim().split(' ')[0] || 'User';
    const pin = (user && (user.pin || user.sbtetPin)) ? (user.pin || user.sbtetPin) : (role === 'HOD' ? 'HOD-CONSOLE' : '259');

    // Create header element
    const header = document.createElement('header');
    header.className = 'cc-app-header';
    header.id = 'ccAppHeader';

    // Build center nav slots HTML
    let navSlotsHtml = '';
    navItems.forEach((item, index) => {
      if (index > 0) {
        navSlotsHtml += '<div class="cc-nav-divider"></div>';
      }
      const isActive = item.id === activeId;
      const badgeCount = badgeCounts[item.badgeKey] || 0;
      navSlotsHtml += `
        <a href="${item.url}" class="cc-nav-slot ${isActive ? 'is-active' : ''}" data-nav-id="${item.id}">
          <span class="material-symbols-outlined nav-slot-icon">${item.icon}</span>
          <span class="nav-slot-label">${item.label}</span>
          ${badgeCount > 0 ? `<span class="cc-nav-badge">${badgeCount > 99 ? '99+' : badgeCount}</span>` : ''}
        </a>
      `;
    });

    header.innerHTML = `
      <div class="cc-header-inner">
        <!-- Left: Brand & Telemetry -->
        <a href="${role === 'HOD' ? '/screens/04-hod-portal/hod-dashboard.html' : '/screens/02-student-portal/dashboard.html'}" class="cc-header-left" style="text-decoration:none;">
          <span class="cc-brand-title">Samskruti College</span>
          <span class="cc-brand-sub">Code 259 · ${role === 'HOD' ? 'HOD Executive' : 'SBTET C-24'}</span>
        </a>

        <!-- Center: Iconic "CC" Dynamic Island Pill (Hover-Expand Morph) -->
        <div class="cc-header-nav-anchor">
          <div class="cc-dynamic-island is-collapsed" id="ccDynamicIsland" data-role="${role}" role="navigation" aria-label="Campus Connect Dynamic Island">
            
            <!-- Collapsed State: Iconic "CC" Pill -->
            <div class="cc-pill-collapsed" id="ccPillCollapsed" aria-label="Expand Navigation Dock">
              <span class="cc-radar-pulse" aria-hidden="true"></span>
              <span class="cc-monogram">CC</span>
              <span class="cc-pill-sep" aria-hidden="true"></span>
              <span class="material-symbols-outlined cc-pill-active-icon">${activeItem.icon}</span>
              <span class="cc-pill-active-label">${activeItem.label}</span>
            </div>

            <!-- Expanded State: Full Navigation Dock -->
            <nav class="cc-dock-expanded cc-nav-pill-container" id="ccDockExpanded" aria-label="Main Navigation">
              <div class="cc-nav-sliding-pill"></div>
              ${navSlotsHtml}
            </nav>

          </div>
        </div>

        <!-- Right: Theme Toggle & Profile Pill -->
        <div class="cc-header-right">
          <button class="cc-theme-toggle-btn" id="ccThemeToggleBtn" aria-label="Toggle Theme" title="Toggle Theme">
            <span class="material-symbols-outlined" id="ccThemeToggleIcon" style="font-size:20px;">
              ${theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          <div class="cc-profile-pill">
            <button class="cc-profile-btn" id="ccProfileBtn" aria-expanded="false" aria-label="User Profile Menu">
              <span class="cc-profile-avatar">${initials}</span>
              <span class="cc-profile-name">${firstName}</span>
              <span class="material-symbols-outlined" style="font-size:18px;color:var(--on-surface-variant,#9A9A9A);">expand_more</span>
            </button>

            <!-- Profile Dropdown -->
            <div class="cc-profile-dropdown" id="ccProfileDropdown" role="menu">
              <div class="cc-dropdown-header">
                <span class="cc-profile-avatar" style="width:38px;height:38px;font-size:14px;">${initials}</span>
                <div class="cc-dropdown-user-info">
                  <span class="cc-dropdown-full-name">${name}</span>
                  <span class="cc-dropdown-role">${role === 'HOD' ? 'Department HOD' : 'Student'}</span>
                  <span class="cc-dropdown-pin">${pin}</span>
                </div>
              </div>

              <a href="${role === 'HOD' ? '/screens/04-hod-portal/hod-dashboard.html' : '/screens/02-student-portal/profile.html'}" class="cc-dropdown-item" role="menuitem">
                <span class="material-symbols-outlined" style="font-size:18px;">account_circle</span>
                <span>My Profile</span>
              </a>

              <button class="cc-dropdown-item" id="ccDropThemeBtn" role="menuitem">
                <span class="material-symbols-outlined" style="font-size:18px;">palette</span>
                <span id="ccDropThemeText">${theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}</span>
              </button>

              <div style="height:1px;background:var(--hairline, rgba(255,255,255,0.08));margin:4px 0;"></div>

              <button class="cc-dropdown-item cc-dropdown-logout" id="ccLogoutBtn" role="menuitem">
                <span class="material-symbols-outlined" style="font-size:18px;">logout</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.prepend(header);

    // Render Mobile Bottom Bar (< 1100px)
    renderMobileBottomNav(navItems, activeId);

    // Bind event listeners
    bindHeaderEvents();
  }

  function renderMobileBottomNav(navItems, activeId) {
    const existing = document.getElementById('ccMobileBottomNav');
    if (existing) existing.remove();

    const mobileSlots = navItems.slice(0, 5); // 5 primary slots
    const mobileNav = document.createElement('nav');
    mobileNav.className = 'cc-mobile-bottom-nav';
    mobileNav.id = 'ccMobileBottomNav';
    mobileNav.setAttribute('role', 'navigation');
    mobileNav.setAttribute('aria-label', 'Mobile Navigation');

    let slotsHtml = '';
    mobileSlots.forEach(item => {
      const isActive = item.id === activeId;
      const badgeCount = badgeCounts[item.badgeKey] || 0;
      slotsHtml += `
        <a href="${item.url}" class="cc-mobile-slot ${isActive ? 'is-active' : ''}" data-nav-id="${item.id}">
          <span class="material-symbols-outlined nav-slot-icon" style="font-size:22px;">${item.icon}</span>
          <span class="nav-slot-label" style="font-size:10px;">${item.label}</span>
          ${badgeCount > 0 ? `<span class="cc-nav-badge">${badgeCount > 99 ? '99+' : badgeCount}</span>` : ''}
        </a>
      `;
    });

    mobileNav.innerHTML = slotsHtml;
    document.body.appendChild(mobileNav);
  }

  function bindHeaderEvents() {
    // Theme toggle
    const themeBtn = document.getElementById('ccThemeToggleBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const next = getTheme() === 'dark' ? 'light' : 'dark';
        applyTheme(next);
      });
    }

    const dropThemeBtn = document.getElementById('ccDropThemeBtn');
    if (dropThemeBtn) {
      dropThemeBtn.addEventListener('click', () => {
        const next = getTheme() === 'dark' ? 'light' : 'dark';
        applyTheme(next);
      });
    }

    // Profile dropdown toggle
    const profileBtn = document.getElementById('ccProfileBtn');
    const dropdown = document.getElementById('ccProfileDropdown');
    if (profileBtn && dropdown) {
      profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.classList.contains('is-open');
        if (isOpen) {
          dropdown.classList.remove('is-open');
          profileBtn.setAttribute('aria-expanded', 'false');
        } else {
          dropdown.classList.add('is-open');
          profileBtn.setAttribute('aria-expanded', 'true');
        }
      });

      document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && !profileBtn.contains(e.target)) {
          dropdown.classList.remove('is-open');
          profileBtn.setAttribute('aria-expanded', 'false');
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && dropdown.classList.contains('is-open')) {
          dropdown.classList.remove('is-open');
          profileBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Logout
    const logoutBtn = document.getElementById('ccLogoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        try {
          localStorage.removeItem('dc_user');
          localStorage.removeItem('smsk_user');
          localStorage.removeItem('user_name');
          localStorage.removeItem('student_pin');
          localStorage.removeItem('user_pin');
          localStorage.removeItem('user_role');
        } catch (e) {}
        window.location.replace('/screens/01-auth/login.html');
      });
    }

    // Scroll detection
    window.addEventListener('scroll', () => {
      const header = document.getElementById('ccAppHeader');
      if (header) {
        if (window.scrollY > 10) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    }, { passive: true });

    // Dynamic Island Hover Expansion with Grace Delay (220ms)
    const island = document.getElementById('ccDynamicIsland');
    const dockExpanded = document.getElementById('ccDockExpanded');
    let collapseTimer = null;

    if (island) {
      function expandIsland() {
        if (collapseTimer) {
          clearTimeout(collapseTimer);
          collapseTimer = null;
        }
        island.classList.remove('is-collapsed');
        island.classList.add('is-expanded');
        if (dockExpanded) dockExpanded.setAttribute('aria-hidden', 'false');
      }

      function collapseIsland() {
        if (collapseTimer) clearTimeout(collapseTimer);
        collapseTimer = setTimeout(() => {
          island.classList.remove('is-expanded');
          island.classList.add('is-collapsed');
          if (dockExpanded) dockExpanded.setAttribute('aria-hidden', 'true');
          const slidingPill = island.querySelector('.cc-nav-sliding-pill');
          if (slidingPill) slidingPill.style.opacity = '0';
        }, 220); // 220ms natural human grace period
      }

      island.addEventListener('mouseenter', expandIsland);
      island.addEventListener('mouseleave', collapseIsland);
      island.addEventListener('focusin', expandIsland);
      island.addEventListener('focusout', collapseIsland);

      const collapsedPill = document.getElementById('ccPillCollapsed');
      if (collapsedPill) {
        collapsedPill.addEventListener('click', (e) => {
          e.stopPropagation();
          expandIsland();
        });
      }
    }

    // Magnetic Sliding Hover Pill (Physics-based gliding highlight)
    const navContainer = document.querySelector('.cc-dock-expanded, .cc-nav-pill-container');
    if (navContainer) {
      let slidingPill = navContainer.querySelector('.cc-nav-sliding-pill');
      if (!slidingPill) {
        slidingPill = document.createElement('div');
        slidingPill.className = 'cc-nav-sliding-pill';
        navContainer.prepend(slidingPill);
      }

      const slots = navContainer.querySelectorAll('.cc-nav-slot');
      slots.forEach(slot => {
        slot.addEventListener('mouseenter', () => {
          // If hovering active slot, hide sliding highlight to avoid visual clash
          if (slot.classList.contains('is-active')) {
            slidingPill.style.opacity = '0';
            return;
          }
          const left = slot.offsetLeft;
          const width = slot.offsetWidth;
          slidingPill.style.transform = `translate3d(${left}px, 0, 0)`;
          slidingPill.style.width = `${width}px`;
          slidingPill.style.opacity = '1';
        });
      });

      navContainer.addEventListener('mouseleave', () => {
        slidingPill.style.opacity = '0';
      });
    }
  }

  // Public Badge API
  window.updateNavBadge = function (key, count) {
    badgeCounts[key] = count;
    document.querySelectorAll(`[data-nav-id]`).forEach(slot => {
      const allSlots = [...STUDENT_NAV, ...HOD_NAV];
      const match = allSlots.find(s => s.id === slot.getAttribute('data-nav-id') && s.badgeKey === key);
      if (match) {
        let badgeEl = slot.querySelector('.cc-nav-badge');
        if (count > 0) {
          if (!badgeEl) {
            badgeEl = document.createElement('span');
            badgeEl.className = 'cc-nav-badge';
            slot.appendChild(badgeEl);
          }
          badgeEl.textContent = count > 99 ? '99+' : count;
        } else if (badgeEl) {
          badgeEl.remove();
        }
      }
    });
  };

  // Legacy No-Op Compatibility
  window.dcInitDynamicIsland = function () {};
  window.dcSetupDynamicIsland = function () {};
  window.dcSyncProfile = function () {};
  window.renderDock = function () {};

  function init() {
    // 1. Initialize Theme
    applyTheme(getTheme());

    // 2. Resolve User & Route
    const path = window.location.pathname.toLowerCase();
    const isAuth = path.includes('/01-auth/') || path.endsWith('login.html');
    if (isAuth) return;

    const user = getUser();
    if (!user || (!user.pin && !user.name)) {
      window.location.replace('/screens/01-auth/login.html');
      return;
    }

    const role = getRole(user);
    const navItems = role === 'HOD' ? HOD_NAV : STUDENT_NAV;

    renderHeader(user, role, navItems);

    // Auto-load 60fps UI Enhancement Engine if not already present
    if (!document.querySelector('script[src*="ui-enhancements.js"]')) {
      const s = document.createElement('script');
      s.src = '/js/ui-enhancements.js';
      s.defer = true;
      document.head.appendChild(s);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
