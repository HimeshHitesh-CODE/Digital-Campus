/**
 * Samskruti Digital Campus — Universal Theme Engine
 * Ensures data-theme and .dark class sync with Kinetic Bento tokens across all pages.
 */

(function () {
  'use strict';

  function getTheme() {
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
  }

  // Early application to prevent theme flash
  applyTheme(getTheme());

  window.addEventListener('storage', (e) => {
    if (e.key === 'theme' || e.key === 'dc_theme') {
      if (e.newValue === 'dark' || e.newValue === 'light') {
        applyTheme(e.newValue);
      }
    }
  });
})();
