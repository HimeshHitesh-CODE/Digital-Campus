/**
 * Step 2: Institutional Secret Key Verification Controller
 * Automatically synchronizes and verifies institutional security keys for seamless account activation.
 */

import { api } from '../../js/api.js';
import { alerts } from '../../js/alerts.js';

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const pin = (urlParams.get('pin') || sessionStorage.getItem('reg_pin') || '24259-CS-025').trim().toUpperCase();
  const email = (urlParams.get('email') || sessionStorage.getItem('reg_email') || '').trim().toLowerCase();

  const pinDisplay = document.getElementById('display-student-pin');
  const emailDisplay = document.getElementById('display-student-email');
  const secretInput = document.getElementById('institutional-secret-key');
  const form = document.getElementById('verify-secret-form');
  const submitBtn = document.getElementById('verify-submit-btn');
  const btnText = document.getElementById('verify-btn-text');
  const btnSpinner = document.getElementById('verify-btn-spinner');

  if (pinDisplay) pinDisplay.textContent = pin;
  if (emailDisplay && email) emailDisplay.textContent = email;

  // Auto-uppercase input
  secretInput.addEventListener('input', () => {
    secretInput.value = secretInput.value.toUpperCase();
  });

  // Attempt to fetch pre-allocated security key for this PIN
  try {
    const keyRes = await api.get(`/auth/student-key?pin=${encodeURIComponent(pin)}`);
    if (keyRes && keyRes.success && keyRes.secretKey) {
      if (!secretInput.value) {
        secretInput.value = keyRes.secretKey;
      }
    }
  } catch (err) {
    console.log('[Auto-key info]:', err.message);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const secretKey = secretInput.value.trim().toUpperCase();
    if (!secretKey) {
      alerts.warning('Please enter your Institutional Security Key.');
      return;
    }

    btnText.textContent = 'Verifying with Department...';
    btnSpinner.style.display = 'block';
    submitBtn.disabled = true;

    try {
      const response = await api.post('/auth/verify-secret-key', {
        pin,
        email,
        secretKey,
      });

      if (response && response.success && response.token) {
        // Synchronously store session data
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('dc_auth_token', response.token);
        localStorage.setItem('user_role', response.user?.role || 'STUDENT');
        localStorage.setItem('student_pin', response.user?.sbtetPin || pin);
        localStorage.setItem('user_name', response.user?.name || '');
        localStorage.setItem('dc_user', JSON.stringify(response.user));
        localStorage.setItem('session_start', Date.now().toString());

        alerts.success('Identity verified! Welcome to Samskruti Digital Campus.');

        setTimeout(() => {
          window.location.replace('../02-student-portal/dashboard.html');
        }, 400);
      }
    } catch (error) {
      console.warn('[Secret Key Verification Failed]:', error);
      btnText.textContent = 'Verify Key & Launch Dashboard →';
      btnSpinner.style.display = 'none';
      submitBtn.disabled = false;

      const msg = error.data?.message || error.message || 'Invalid Institutional Security Key. Please contact the department office.';
      alerts.danger(msg);
    }
  });
});
