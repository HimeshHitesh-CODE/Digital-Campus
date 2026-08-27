/**
 * Samskruti College Unified Authentication Controller
 * Manages 3-way tabs: Student Sign In, Student Sign Up (Step 1), and CS HOD Admin Login.
 */

import { api } from '../../js/api.js';
import { alerts } from '../../js/alerts.js';

document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupStudentSignIn();
  setupStudentSignUp();
  setupAdminHODLogin();
  setupPasswordToggles();
});

/**
 * 3-Way Tab Switching
 */
function setupTabs() {
  const tabBtns = document.querySelectorAll('.auth-tab-btn');
  const panels = document.querySelectorAll('.auth-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanelId = btn.getAttribute('data-tab');
      const targetPanel = document.getElementById(targetPanelId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });

  // Check URL query for default tab
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('tab') === 'signup') {
    document.getElementById('tab-student-signup')?.click();
  } else if (urlParams.get('tab') === 'admin') {
    document.getElementById('tab-admin-login')?.click();
  }
}

/**
 * Tab 1: Student Sign In (Email / PIN + Password)
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
        // Synchronously store session data
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
 * Tab 2: Student Sign Up (Step 1 Registration)
 */
function setupStudentSignUp() {
  const form = document.getElementById('student-signup-form');
  const pinInput = document.getElementById('signup-pin');
  const firstInput = document.getElementById('signup-firstname');
  const lastInput = document.getElementById('signup-lastname');
  const branchSelect = document.getElementById('signup-branch');
  const semSelect = document.getElementById('signup-semester');
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
    const branch = branchSelect.value;
    const semester = semSelect.value;
    const email = emailInput.value.trim().toLowerCase();
    const password = passInput.value;

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

        alerts.success('Step 1 complete! Redirecting to Secret Key Verification...');

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
    'toggle-signin-password': { input: 'signin-password', icon: 'eye-icon-signin' },
    'toggle-admin-password': { input: 'admin-password', icon: 'eye-icon-admin' },
  };

  Object.entries(eyeIcons).forEach(([btnId, config]) => {
    const btn = document.getElementById(btnId);
    const input = document.getElementById(config.input);
    const icon = document.getElementById(config.icon);

    btn?.addEventListener('click', () => {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      if (icon) {
        icon.innerHTML = isPassword
          ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`
          : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
      }
    });
  });
}
