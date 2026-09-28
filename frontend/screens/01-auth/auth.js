/**
 * Samskruti Digital Campus - Precision PIN-First Authentication Controller
 * Features: PIN-first onboarding, live SBTET scraper hydration, account finalization,
 * instant role tab switching, and seamless session persistence.
 */

import { api } from '../../js/api.js';
import { alerts } from '../../js/alerts.js';

document.addEventListener('DOMContentLoaded', () => {
  setupMorphingPillTabs();
  setupPinVerificationFlow();
  setupAccountFinalization();
  setupStudentSignIn();
  setupAdminHODLogin();
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

    const tabRole = activeBtn.dataset.tab;
    if (card) {
      card.setAttribute('data-active-tab', tabRole);
      if (tabRole === 'hod') {
        card.style.setProperty('--theme-accent', '#059669');
        card.style.setProperty('--theme-accent-hover', '#047857');
        card.style.setProperty('--theme-accent-glow', 'rgba(5, 150, 105, 0.28)');
        card.style.setProperty('--btn-gradient', 'linear-gradient(135deg, #059669 0%, #047857 100%)');
      } else {
        card.style.setProperty('--theme-accent', '#2563eb');
        card.style.setProperty('--theme-accent-hover', '#1d4ed8');
        card.style.setProperty('--theme-accent-glow', 'rgba(37, 99, 235, 0.28)');
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

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      updatePillPosition(tab);
      switchTabForm(tab.dataset.tab);
    });
  });

  // Expose global tab switcher helper
  window.switchToTab = function(tabName) {
    const targetBtn = Array.from(tabs).find(t => t.dataset.tab === tabName);
    if (targetBtn) {
      tabs.forEach(t => t.classList.remove('active'));
      targetBtn.classList.add('active');
      updatePillPosition(targetBtn);
      switchTabForm(tabName);
    }
  };

  // Initial pill position
  requestAnimationFrame(() => {
    const currentActive = document.querySelector('.tab-btn.active');
    if (currentActive) updatePillPosition(currentActive);
  });
}

/**
 * 2. Stage 1: PIN-First Onboarding Verification & SBTET Live Scrape
 */
function setupPinVerificationFlow() {
  const pinForm = document.getElementById('pin-verify-form');
  const pinInput = document.getElementById('onboarding-pin');
  const verifyBtn = document.getElementById('pin-verify-btn');
  const btnText = document.getElementById('pin-verify-btn-text');
  const spinner = document.getElementById('pin-verify-spinner');

  const finalizeForm = document.getElementById('finalize-account-form');
  const backBtn = document.getElementById('btn-back-to-pin');

  pinForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pin = pinInput.value.trim().toUpperCase();

    if (!pin) {
      alerts.warning('Please enter your Diploma PIN.');
      return;
    }

    btnText.textContent = 'Verifying & Scraping Records...';
    spinner.style.display = 'block';
    verifyBtn.disabled = true;

    try {
      const res = await api.post('/auth/check-pin', { pin });

      if (res && res.status === 'ALREADY_REGISTERED') {
        alerts.info(res.message || 'Account already registered. Please sign in.');
        window.switchToTab('signin');
        const signinIdentity = document.getElementById('signin-identity');
        if (signinIdentity) signinIdentity.value = res.email || pin;
        return;
      }

      if (res && res.status === 'NEEDS_SETUP') {
        alerts.success('Identity verified via Telangana SBTET Gateway!');

        // Populate verified banner
        const std = res.student || {};
        document.getElementById('verified-badge-pin').textContent = std.pin || pin;
        document.getElementById('verified-student-name').textContent = std.name || 'Student Name';
        document.getElementById('verified-student-meta').textContent = `${std.department || 'Computer Science'} • ${std.scheme || 'C-24'} • ${std.year || '3rd Year'}`;

        // Populate hidden inputs
        document.getElementById('final-pin').value = std.pin || pin;
        document.getElementById('final-name').value = std.name || '';
        document.getElementById('final-branch').value = std.branch || 'CS';
        document.getElementById('final-scheme').value = std.scheme || 'C-24';
        document.getElementById('final-semester').value = std.semester || '5th Sem';
        document.getElementById('final-year').value = std.year || '3rd Year';

        // Transition from Stage 1 to Stage 2
        pinForm.style.display = 'none';
        finalizeForm.style.display = 'block';
      } else {
        throw new Error(res.message || 'Verification could not be completed.');
      }
    } catch (err) {
      alerts.danger('PIN Verification Failed', err.message || 'PIN not found in institutional roster.');
    } finally {
      btnText.textContent = 'Verify PIN & Pull Official Records →';
      spinner.style.display = 'none';
      verifyBtn.disabled = false;
    }
  });

  backBtn?.addEventListener('click', () => {
    finalizeForm.style.display = 'none';
    pinForm.style.display = 'block';
  });
}

/**
 * 3. Stage 2: Account Finalization (Email & Password Set)
 */
function setupAccountFinalization() {
  const finalizeForm = document.getElementById('finalize-account-form');
  const emailInput = document.getElementById('final-email');
  const passInput = document.getElementById('final-password');
  const confirmPassInput = document.getElementById('final-confirm-password');
  const finalizeBtn = document.getElementById('finalize-btn');
  const btnText = document.getElementById('finalize-btn-text');
  const spinner = document.getElementById('finalize-spinner');

  finalizeForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const pin = document.getElementById('final-pin').value.trim();
    const name = document.getElementById('final-name').value.trim();
    const branch = document.getElementById('final-branch').value.trim();
    const scheme = document.getElementById('final-scheme').value.trim();
    const semester = document.getElementById('final-semester').value.trim();
    const year = document.getElementById('final-year').value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passInput.value;
    const confirmPass = confirmPassInput.value;

    if (!email || !password || !confirmPass) {
      alerts.warning('Please fill in your email and password.');
      return;
    }

    if (password !== confirmPass) {
      alerts.danger('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      alerts.danger('Password must be at least 8 characters.');
      return;
    }

    btnText.textContent = 'Activating Profile...';
    spinner.style.display = 'block';
    finalizeBtn.disabled = true;

    try {
      const res = await api.post('/auth/finalize-account', {
        pin,
        name,
        branch,
        scheme,
        semester,
        year,
        email,
        password
      });

      if (res && res.success) {
        alerts.success(res.message || 'Profile activated successfully!');
        if (res.token) api.setToken(res.token);
        if (res.user) api.setUser(res.user);

        setTimeout(() => {
          window.location.href = res.redirectUrl || '../02-student-portal/dashboard.html';
        }, 800);
      } else {
        throw new Error(res.message || 'Failed to activate account.');
      }
    } catch (err) {
      alerts.danger('Activation Failed', err.message);
    } finally {
      btnText.textContent = 'Finalize Account & Launch Dashboard →';
      spinner.style.display = 'none';
      finalizeBtn.disabled = false;
    }
  });
}

/**
 * 4. Student Sign In (Email or PIN + Password)
 */
function setupStudentSignIn() {
  const form = document.getElementById('signin-form');
  const identityInput = document.getElementById('signin-identity');
  const passInput = document.getElementById('signin-password');
  const submitBtn = document.getElementById('signin-submit-btn');
  const btnText = document.getElementById('signin-btn-text');
  const spinner = document.getElementById('signin-btn-spinner');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const identifier = identityInput.value.trim();
    const password = passInput.value;

    if (!identifier || !password) {
      alerts.warning('Please enter both your identifier and password.');
      return;
    }

    btnText.textContent = 'Authenticating...';
    spinner.style.display = 'block';
    submitBtn.disabled = true;

    try {
      const res = await api.post('/auth/login', {
        identifier,
        password
      });

      if (res && res.success) {
        alerts.success(res.message || 'Welcome back!');
        if (res.token) api.setToken(res.token);
        if (res.user) api.setUser(res.user);

        setTimeout(() => {
          window.location.href = res.redirect_url || res.redirectUrl || '../02-student-portal/dashboard.html';
        }, 600);
      } else {
        throw new Error(res.message || 'Invalid credentials.');
      }
    } catch (err) {
      alerts.danger('Authentication Failed', err.message || 'Check your identifier and password.');
    } finally {
      btnText.textContent = 'Sign In to Campus Connect →';
      spinner.style.display = 'none';
      submitBtn.disabled = false;
    }
  });
}

/**
 * 5. Admin / HOD Login
 */
function setupAdminHODLogin() {
  const form = document.getElementById('hod-form');
  const identInput = document.getElementById('hod-identifier');
  const passInput = document.getElementById('hod-password');
  const submitBtn = document.getElementById('hod-submit-btn');
  const btnText = document.getElementById('hod-btn-text');
  const spinner = document.getElementById('hod-btn-spinner');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const identifier = identInput.value.trim();
    const password = passInput.value;

    if (!identifier || !password) {
      alerts.warning('Please enter HOD identifier and security key.');
      return;
    }

    btnText.textContent = 'Entering Console...';
    spinner.style.display = 'block';
    submitBtn.disabled = true;

    try {
      const res = await api.post('/auth/login', {
        identifier,
        password
      });

      if (res && res.success) {
        alerts.success('HOD Session Authenticated', '180-Student background sync initiated.');
        if (res.token) api.setToken(res.token);
        if (res.user) api.setUser(res.user);

        setTimeout(() => {
          window.location.href = res.redirect_url || res.redirectUrl || '../04-hod-portal/hod-dashboard.html';
        }, 600);
      } else {
        throw new Error(res.message || 'Invalid HOD security credentials.');
      }
    } catch (err) {
      alerts.danger('Access Denied', err.message);
    } finally {
      btnText.textContent = 'Enter HOD Executive Console →';
      spinner.style.display = 'none';
      submitBtn.disabled = false;
    }
  });
}
