/**
 * Campus Connect - Universal Top Capsule Navigation Controller
 * Handles active state routing, Lucide icon hydration, theme switching, and sign out.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 2. Set Active Navigation Item Based on Current URL
  const currentPath = window.location.pathname.toLowerCase();
  const navItems = document.querySelectorAll('.capsule-menu-items .nav-item');

  navItems.forEach(item => {
    const href = (item.getAttribute('href') || '').toLowerCase();
    const pageKey = (item.getAttribute('data-page') || '').toLowerCase();

    if (currentPath.endsWith(href) || (pageKey && currentPath.includes(pageKey))) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // 3. Theme Toggle Action
  const themeBtn = document.getElementById('theme-toggle-btn');
  themeBtn?.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('dc_theme', isLight ? 'light' : 'dark');
    if (window.alerts) {
      alerts.info(`Switched to ${isLight ? 'Light' : 'Dark'} theme`);
    }
  });

  // 4. Sign Out Action
  const logoutBtns = document.querySelectorAll('.util-btn.logout, #dock-signout-btn');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace('/screens/01-auth/login.html');
    });
  });
});
