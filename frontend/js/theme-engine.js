/**
 * Campus Connect - Universal Theme State & Mobile Engine
 * Controls [data-theme="dark"] vs [data-theme="light"], Lucide icons, and Mobile Bottom Nav.
 */

// 1. Immediate Execution (Zero Flash of Incorrect Theme)
(function initCampusTheme() {
  const savedTheme = localStorage.getItem('smsk_theme') || localStorage.getItem('dc_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
})();

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 2. Setup Theme Toggles & Icons
  const themeToggleButtons = document.querySelectorAll('#theme-toggle-btn, .theme-toggle-trigger');

  function updateThemeIcons(theme) {
    themeToggleButtons.forEach(btn => {
      const icon = btn.querySelector('i') || btn.querySelector('svg');
      if (icon) {
        icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
      }
    });
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  updateThemeIcons(currentTheme);

  themeToggleButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const activeTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const targetTheme = activeTheme === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', targetTheme);
      localStorage.setItem('smsk_theme', targetTheme);
      localStorage.setItem('dc_theme', targetTheme);
      updateThemeIcons(targetTheme);

      if (window.alerts) {
        alerts.info(`Switched to ${targetTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}`);
      }
    });
  });

  // 3. Inject Mobile Bottom Navigation if not already present
  if (!document.querySelector('.mobile-bottom-nav') && !window.location.pathname.includes('/01-auth/')) {
    const currentPath = window.location.pathname.toLowerCase();
    const bottomNav = document.createElement('nav');
    bottomNav.className = 'mobile-bottom-nav';
    bottomNav.setAttribute('aria-label', 'Mobile Navigation');

    const mobileLinks = [
      { label: 'Home', href: 'dashboard.html', icon: 'layout-dashboard', key: 'dashboard' },
      { label: 'Attend', href: 'attendance.html', icon: 'calendar-check', key: 'attendance' },
      { label: 'Results', href: 'results.html', icon: 'graduation-cap', key: 'results' },
      { label: 'Market', href: 'marketplace.html', icon: 'shopping-bag', key: 'marketplace' },
      { label: 'Profile', href: 'profile.html', icon: 'user', key: 'profile' },
    ];

    bottomNav.innerHTML = mobileLinks.map(link => {
      const isActive = currentPath.endsWith(link.href) || currentPath.includes(link.key);
      return `
        <a href="${link.href}" class="mobile-nav-item ${isActive ? 'active' : ''}">
          <i data-lucide="${link.icon}"></i>
          <span>${link.label}</span>
        </a>
      `;
    }).join('');

    document.body.appendChild(bottomNav);

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
});
