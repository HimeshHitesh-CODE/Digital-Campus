/**
 * Campus Connect - Universal Theme State & Mobile Engine
 * Controls [data-theme="light"] (default) vs [data-theme="dark"]
 */

(function initCampusTheme() {
  const savedTheme = localStorage.getItem('dc_theme') || localStorage.getItem('theme') || localStorage.getItem('smsk_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  const themeToggleButtons = document.querySelectorAll('#theme-toggle-btn, .theme-toggle-trigger, #headerThemeBtn');

  function updateThemeIcons(theme) {
    themeToggleButtons.forEach(btn => {
      const icon = btn.querySelector('i') || btn.querySelector('svg');
      if (icon) {
        icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
      }
    });
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  updateThemeIcons(currentTheme);

  themeToggleButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const activeTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const targetTheme = activeTheme === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', targetTheme);
      document.documentElement.classList.toggle('dark', targetTheme === 'dark');
      localStorage.setItem('dc_theme', targetTheme);
      localStorage.setItem('theme', targetTheme);
      localStorage.setItem('smsk_theme', targetTheme);

      updateThemeIcons(targetTheme);
    });
  });
});
