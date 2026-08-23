/**
 * Institutional Landing Page Controller
 */

import { api } from './js/api.js';
import { redirectToDefaultPortal } from './js/auth-guard.js';

document.addEventListener('DOMContentLoaded', () => {
  const user = api.getUser();
  const token = api.getToken();

  // If user is already authenticated, provide quick dashboard return option
  if (token && user) {
    const navActions = document.querySelector('.nav-actions');
    if (navActions) {
      navActions.innerHTML = `
        <a href="./screens/02-student-portal/dashboard.html" class="neu-btn neu-btn-primary nav-signin-btn">
          Go to ${user.role} Portal →
        </a>
      `;
    }
  }

  // Smooth scroll for nav anchors
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
