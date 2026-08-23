/**
 * Samskruti Digital Campus Theme Controller
 * Handles persistent dark/light theme switching and system preference synchronization.
 */

export function initTheme() {
  const savedTheme = localStorage.getItem('smsk_theme') || 
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Setup click listener for toggle buttons (both current and dynamically rendered dock buttons)
  setupThemeToggleListener();
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const target = current === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', target);
  localStorage.setItem('smsk_theme', target);
}

export function setupThemeToggleListener() {
  const btn = document.getElementById('theme-toggle-btn');
  if (btn && !btn.dataset.themeBound) {
    btn.dataset.themeBound = 'true';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleTheme();
    });
  }
}

// Auto-run on DOM ready and immediate execution
if (typeof document !== 'undefined') {
  const saved = localStorage.getItem('smsk_theme') || 
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', saved);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }
}
