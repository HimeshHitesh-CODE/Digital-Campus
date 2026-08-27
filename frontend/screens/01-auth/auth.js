/**
 * Samskruti Digital Campus - Precision Authentication Controller
 * Features: Hardware-accelerated Morphing Pill Tab Indicator, Dynamic Role Theming,
 * Form Validation, and Two-Step Security Registration.
 */

import { api } from '../../js/api.js';
import { alerts } from '../../js/alerts.js';

document.addEventListener('DOMContentLoaded', () => {
  setupMorphingPillTabs();
  setupStudentSignUp();
  setupStudentSignIn();
  setupAdminHODLogin();
  setupPasswordToggles();
});

/**
 * 1. Hardware-Accelerated Sliding Morph Pill Tab Indicator
 */
function setupMorphingPillTabs() {
  const track = document.getElementById('auth-tab-track');
  const pill = document.getElementById('sliding-pill');
  const tabs = document.querySelectorAll('.tab-btn');
  const card = document.getElementById('auth-main-card');
  const contents = document.querySelectorAll('.auth-tab-content');

  if (!track || !pill || !tabs.length) return;

  function updatePillPosition(activeBtn) {
    if (!activeBtn) return;
    const trackRect = track.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();

    const leftOffset = btnRect.left - trackRect.left;
    const btnWidth = btnRect.width;

    pill.style.width = `${btnWidth}px`;
    pill.style.transform = `translate3d(${leftOffset}px, 0, 0)`;

    // Role Theme Switching: HOD gets Emerald Green, Student gets Royal Blue
    const tabRole = activeBtn.dataset.tab;
    if (card) {
      card.setAttribute('data-active-tab', tabRole);
      if (tabRole === 'hod') {
        card.style.setProperty('--theme-accent', '#059669');
        card.style.setProperty('--theme-accent-hover', '#047857');
        card.style.setProperty('--theme-accent-glow', 'rgba(5, 150, 105, 0.25)');
        card.style.setProperty('--btn-gradient', 'linear-gradient(135deg, #059669 0%, #047857 100%)');
      } else {
        card.style.setProperty('--theme-accent', '#2563eb');
        card.style.setProperty('--theme-accent-hover', '#1d4ed8');
        card.style.setProperty('--theme-accent-glow', 'rgba(37, 99, 235, 0.25)');
        card.style.setProperty('--btn-gradient', 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)');
      }
    }
  }

  function switchTabForm(targetTabName) {
    contents.forEach(content => {
      if (content.id === `tab-content-${targetTabName}`) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });
  }

  // Handle Tab Click
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      updatePillPosition(tab);
      switchTabForm(tab.dataset.tab);
    });
  });

  // Handle URL Query Params
  const urlParams = new URLSearchParams(window.location.search);
  const requestedTab = urlParams.get('tab');
  let initialTab = tabs[0]; // Default: Student Sign Up

  if (requestedTab === 'signin') {
    initialTab = document.querySelector('[data-tab="signin"]') || tabs[1];
  } else if (requestedTab === 'admin' || requestedTab === 'hod') {
    initialTab = document.querySelector('[data-tab="hod"]') || tabs[2];
  }

  if (initialTab) {
    tabs.forEach(t => t.classList.remove('active'));
    initialTab.classList.add('active');
    // Ensure styles are rendered before computing bounding rects
    requestAnimationFrame(() => {
      updatePillPosition(initialTab);
      switchTabForm(initialTab.dataset.tab);
    });
  }

  // Recalculate on Resize / Orientation Change
  window.addEventListener('resize', () => {
    const currentActive = document.querySelector('.tab-btn.active');
    if (currentActive) updatePillPosition(currentActive);
  });
}

/**
 * 2. Student Sign Up (Step 1 Registration)
 */
function setupStudentSignUp() {
  const form = document.getElementById('signup-form');
  const pinInput = document.getElementById('signup-pin');
  const firstInput = document.getElementById('signup-firstname');
  const lastInput = document.getElementById('signup-lastname');
  const deptSelect = document.getElementById('student-dept');
  const semSelect = document.getElementById('student-sem');
  const emailInput = document.getElementById('signup-email');
  const passInput = document.getElementById('signup-password');
  const submitBtn = document.getElementById('signup-submit-btn');
  const btnText = document.getElementById('signup-btn-text');
  const btnSpinner = document.getElementById('signup-btn-spinner');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const pin = pinInput.value.trim().toUpperCase();
    const firstName = firstInput.value.trim();
    const lastName = lastInput.value.trim();
    const branch = deptSelect.value || 'CS';
    const semester = parseInt(semSelect.value, 10) || 3;
    const email = emailInput.value.trim().toLowerCase();
    const password = passInput.value;

    if (!pin || !firstName || !email || !password) {
      alerts.warning('Please fill in all required registration fields.');
      return;
    }

    if (password.length < 8) {
      alerts.danger('Password must be at least 8 characters.');
      return;
    }

    btnText.textContent = 'Verifying Profile...';
    btnSpinner.style.display = 'block';
    submitBtn.disabled = true;

    try {
      const res = await api.post('/auth/register-step1', {
        pin,
        firstName,
        lastName,
        branch,
        scheme: 'C-24',
        semester,
        email,
        password,
      });

      if (res && res.success) {
        sessionStorage.setItem('reg_pin', pin);
        sessionStorage.setItem('reg_email', email);

        alerts.success('Profile registered! Redirecting to Identity Verification...');

        setTimeout(() => {
          window.location.replace(`./verify-identity.html?pin=${encodeURIComponent(pin)}&email=${encodeURIComponent(email)}`);
        }, 350);
      }
    } catch (err) {
      console.warn('[Sign Up Step 1 Error]:', err);
      btnText.textContent = 'Proceed to Step 2: Verify Identity →';
      btnSpinner.style.display = 'none';
      submitBtn.disabled = false;

      const msg = err.data?.message || err.message || 'Registration Step 1 failed.';
      alerts.danger(msg);
    }
  });
}

/**
 * 3. Student Sign In (PIN/Email + Password)
 */
function setupStudentSignIn() {
  const form = document.getElementById('signin-form');
  const identityInput = document.getElementById('signin-identity');
  const passInput = document.getElementById('signin-password');
  const submitBtn = document.getElementById('signin-submit-btn');
  const btnText = document.getElementById('signin-btn-text');
  const btnSpinner = document.getElementById('signin-btn-spinner');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const identity = identityInput.value.trim();
    const password = passInput.value;

    if (!identity || !password) {
      alerts.warning('Please enter your Registered PIN / Email and Password.');
      return;
    }

    btnText.textContent = 'Authenticating...';
    btnSpinner.style.display = 'block';
    submitBtn.disabled = true;

    try {
      const res = await api.post('/auth/login', { identity, password });

      if (res && res.success && res.user) {
        localStorage.setItem('auth_token', res.token);
        localStorage.setItem('dc_auth_token', res.token);
        localStorage.setItem('user_role', res.user.role || 'STUDENT');
        localStorage.setItem('student_pin', res.user.sbtetPin || res.user.rollNumber || identity);
        localStorage.setItem('user_name', res.user.name || '');
        localStorage.setItem('dc_user', JSON.stringify(res.user));
        localStorage.setItem('session_start', Date.now().toString());

        alerts.success(`Welcome, ${res.user.name}! Launching Student Portal...`);

        setTimeout(() => {
          window.location.replace('../02-student-portal/dashboard.html');
        }, 300);
      }
    } catch (err) {
      console.warn('[Sign In Error]:', err);
      btnText.textContent = 'Sign In to Student Portal →';
      btnSpinner.style.display = 'none';
      submitBtn.disabled = false;

      const msg = err.data?.message || err.message || 'Account not registered. Please complete Student Sign Up first.';
      alerts.danger(msg);

      if (err.data?.code === 'ACCOUNT_NOT_REGISTERED' || err.data?.code === 'NOT_REGISTERED') {
        const signupBtn = document.querySelector('[data-tab="signup"]');
        const signupPin = document.getElementById('signup-pin');
        if (signupPin && identity) {
          signupPin.value = identity.toUpperCase();
        }
        setTimeout(() => {
          signupBtn?.click();
        }, 700);
      }
    }
  });
}

/**
 * 4. Admin / HOD Login
 */
function setupAdminHODLogin() {
  const form = document.getElementById('hod-form');
  const userInput = document.getElementById('hod-username');
  const passInput = document.getElementById('hod-password');
  const submitBtn = document.getElementById('hod-submit-btn');
  const btnText = document.getElementById('hod-btn-text');
  const btnSpinner = document.getElementById('hod-btn-spinner');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = userInput.value.trim();
    const password = passInput.value;

    btnText.textContent = 'Authenticating HOD Console...';
    btnSpinner.style.display = 'block';
    submitBtn.disabled = true;

    try {
      const res = await api.post('/auth/login', { username, password });

      if (res && res.success && res.user) {
        localStorage.setItem('auth_token', res.token);
        localStorage.setItem('dc_auth_token', res.token);
        localStorage.setItem('user_role', 'HOD_CS');
        localStorage.setItem('user_name', res.user.name || 'Prof. Vamshi Krishna');
        localStorage.setItem('dc_user', JSON.stringify(res.user));
        localStorage.setItem('session_start', Date.now().toString());

        alerts.success(`Authenticated: ${res.user.name}. Launching HOD Portal...`);

        setTimeout(() => {
          window.location.replace('../04-hod-portal/dashboard.html');
        }, 300);
      }
    } catch (err) {
      console.warn('[HOD Login Error]:', err);
      btnText.textContent = 'Sign In to HOD Portal →';
      btnSpinner.style.display = 'none';
      submitBtn.disabled = false;

      const msg = err.data?.message || err.message || 'Invalid HOD Master Credentials.';
      alerts.danger(msg);
    }
  });
}

/**
 * 5. Password Visibility Toggles
 */
function setupPasswordToggles() {
  const toggles = [
    { btnId: 'toggle-signup-password', inputId: 'signup-password', iconId: 'eye-icon-signup' },
    { btnId: 'toggle-signin-password', inputId: 'signin-password', iconId: 'eye-icon-signin' },
    { btnId: 'toggle-hod-password', inputId: 'hod-password', iconId: 'eye-icon-hod' }
  ];

  toggles.forEach(({ btnId, inputId, iconId }) => {
    const btn = document.getElementById(btnId);
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);

    if (!btn || !input || !icon) return;

    btn.addEventListener('click', () => {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';

      if (isPassword) {
        icon.innerHTML = `
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        `;
      } else {
        icon.innerHTML = `
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        `;
      }
    });
  });
}
