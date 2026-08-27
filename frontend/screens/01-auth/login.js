/**
 * Samskruti College Unified Authentication Controller
 * Manages 3-way tabs with Role-Based Dynamic Theming (Student Blue vs HOD Green),
 * Custom Neumorphic Dropdowns, and Fluid Micro-Animations.
 */

import { api } from '../../js/api.js';
import { alerts } from '../../js/alerts.js';

document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupCustomDropdowns();
  setupStudentSignUp();
  setupStudentSignIn();
  setupAdminHODLogin();
  setupPasswordToggles();
});

/**
 * 3-Way Tab Switching & Dynamic Role Theming
 */
function setupTabs() {
  const card = document.getElementById('auth-main-card');
  const tabBtns = document.querySelectorAll('.auth-tab-btn');
  const panels = document.querySelectorAll('.auth-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanelId = btn.getAttribute('data-tab');
      const theme = btn.getAttribute('data-theme') || 'student';
      
      // Apply theme scope to main card
      if (card) {
        card.setAttribute('data-active-tab', theme);
      }

      const targetPanel = document.getElementById(targetPanelId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });

  // Check URL query for default tab
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');
  if (tabParam === 'signin') {
    document.getElementById('tab-student-signin')?.click();
  } else if (tabParam === 'admin' || tabParam === 'hod') {
    document.getElementById('tab-admin-login')?.click();
  } else {
    // Default to Student Sign Up
    document.getElementById('tab-student-signup')?.click();
  }
}

/**
 * Custom Neumorphic Dropdowns with Spring Animation
 */
function setupCustomDropdowns() {
  initCustomSelect('custom-branch-select', 'signup-branch', 'branch-display-val');
  initCustomSelect('custom-semester-select', 'signup-semester', 'semester-display-val');

  // Close open dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-select-wrapper')) {
      document.querySelectorAll('.custom-select-wrapper.open').forEach(el => {
        el.classList.remove('open');
      });
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.custom-select-wrapper.open').forEach(el => {
        el.classList.remove('open');
      });
    }
  });
}

function initCustomSelect(wrapperId, hiddenInputId, displayLabelId) {
  const wrapper = document.getElementById(wrapperId);
  if (!wrapper) return;

  const trigger = wrapper.querySelector('.custom-select-trigger');
  const hiddenInput = document.getElementById(hiddenInputId);
  const displayLabel = document.getElementById(displayLabelId);
  const options = wrapper.querySelectorAll('.custom-option');

  trigger?.addEventListener('click', (e) => {
    e.stopPropagation();
    // Close other dropdowns
    document.querySelectorAll('.custom-select-wrapper').forEach(other => {
      if (other !== wrapper) other.classList.remove('open');
    });
    wrapper.classList.toggle('open');
  });

  options.forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const val = opt.getAttribute('data-value');
      const label = opt.textContent.trim();

      options.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');

      if (hiddenInput) hiddenInput.value = val;
      if (displayLabel) displayLabel.textContent = label;

      wrapper.classList.remove('open');
    });
  });
}

/**
 * Tab 1: Student Sign Up (Step 1 Registration)
 */
function setupStudentSignUp() {
  const form = document.getElementById('student-signup-form');
  const pinInput = document.getElementById('signup-pin');
  const firstInput = document.getElementById('signup-firstname');
  const lastInput = document.getElementById('signup-lastname');
  const branchInput = document.getElementById('signup-branch');
  const semInput = document.getElementById('signup-semester');
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
    const branch = branchInput.value || 'CS';
    const semester = parseInt(semInput.value, 10) || 3;
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

        alerts.success('Step 1 complete! Redirecting to Identity Verification...');

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
 * Tab 2: Student Sign In (Email / PIN + Password)
 */
function setupStudentSignIn() {
  const form = document.getElementById('student-signin-form');
  const emailInput = document.getElementById('signin-email');
  const passInput = document.getElementById('signin-password');
  const submitBtn = document.getElementById('signin-submit-btn');
  const btnText = document.getElementById('signin-btn-text');
  const btnSpinner = document.getElementById('signin-btn-spinner');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const identity = emailInput.value.trim();
    const password = passInput.value;

    if (!identity || !password) {
      alerts.warning('Please enter your Registered Email / PIN and Password.');
      return;
    }

    btnText.textContent = 'Authenticating...';
    btnSpinner.style.display = 'block';
    submitBtn.disabled = true;

    try {
      const res = await api.post('/auth/login', { identity, password });

      if (res && res.success && res.user) {
        // Store session credentials
        localStorage.setItem('auth_token', res.token);
        localStorage.setItem('dc_auth_token', res.token);
        localStorage.setItem('user_role', res.user.role || 'STUDENT');
        localStorage.setItem('student_pin', res.user.sbtetPin || res.user.rollNumber || identity);
        localStorage.setItem('user_name', res.user.name || '');
        localStorage.setItem('dc_user', JSON.stringify(res.user));
        localStorage.setItem('session_start', Date.now().toString());

        alerts.success(`Welcome, ${res.user.name}! Routing to Student Portal...`);

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
        const signupBtn = document.getElementById('tab-student-signup');
        const signupPinInput = document.getElementById('signup-pin');
        if (signupPinInput && identity) {
          signupPinInput.value = identity.toUpperCase();
        }
        setTimeout(() => {
          signupBtn?.click();
        }, 700);
      }
    }
  });
}

/**
 * Tab 3: Admin / HOD Login (CS Branch Only)
 */
function setupAdminHODLogin() {
  const form = document.getElementById('admin-login-form');
  const userInput = document.getElementById('admin-username');
  const passInput = document.getElementById('admin-password');
  const submitBtn = document.getElementById('admin-submit-btn');
  const btnText = document.getElementById('admin-btn-text');
  const btnSpinner = document.getElementById('admin-btn-spinner');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = userInput.value.trim();
    const password = passInput.value;

    btnText.textContent = 'Authenticating HOD Access...';
    btnSpinner.style.display = 'block';
    submitBtn.disabled = true;

    try {
      const res = await api.post('/auth/login', {
        username,
        password,
      });

      if (res && res.success && res.user) {
        localStorage.setItem('auth_token', res.token);
        localStorage.setItem('dc_auth_token', res.token);
        localStorage.setItem('user_role', 'HOD_CS');
        localStorage.setItem('user_name', res.user.name || 'Prof. Vamshi Krishna');
        localStorage.setItem('dc_user', JSON.stringify(res.user));
        localStorage.setItem('session_start', Date.now().toString());

        alerts.success(`Authenticated: ${res.user.name}. Launching CS HOD Portal...`);

        setTimeout(() => {
          window.location.replace('../04-hod-portal/dashboard.html');
        }, 300);
      }
    } catch (err) {
      console.warn('[Admin Login Error]:', err);
      btnText.textContent = 'Sign In to HOD Portal →';
      btnSpinner.style.display = 'none';
      submitBtn.disabled = false;

      const msg = err.data?.message || err.message || 'Invalid HOD Master Credentials.';
      alerts.danger(msg);
    }
  });
}

/**
 * Password Visibility Toggles
 */
function setupPasswordToggles() {
  const eyeIcons = {
    'toggle-signup-password': { input: 'signup-password', icon: 'eye-icon-signup' },
    'toggle-signin-password': { input: 'signin-password', icon: 'eye-icon-signin' },
    'toggle-admin-password': { input: 'admin-password', icon: 'eye-icon-admin' },
  };

  Object.entries(eyeIcons).forEach(([btnId, config]) => {
    const btn = document.getElementById(btnId);
    const input = document.getElementById(config.input);
    const icon = document.getElementById(config.icon);

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
