/**
 * Password Reset Controller via Institutional Security Key
 */

import { api } from '../../js/api.js';
import { alerts } from '../../js/alerts.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('reset-password-form');
  const emailInput = document.getElementById('reset-email');
  const pinInput = document.getElementById('reset-pin');
  const secretInput = document.getElementById('reset-secret');
  const passInput = document.getElementById('reset-new-password');
  const submitBtn = document.getElementById('reset-submit-btn');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim().toLowerCase();
    const pin = pinInput.value.trim().toUpperCase();
    const secretKey = secretInput.value.trim().toUpperCase();
    const newPassword = passInput.value;

    if (newPassword.length < 8) {
      alerts.danger('New password must be at least 8 characters long.');
      return;
    }

    submitBtn.disabled = true;

    try {
      const res = await api.post('/auth/forgot-password-reset', {
        email,
        pin,
        secretKey,
        newPassword,
      });

      if (res && res.success) {
        alerts.success('Password successfully reset! Redirecting to Sign In...');
        setTimeout(() => {
          window.location.replace('./login.html');
        }, 500);
      }
    } catch (err) {
      submitBtn.disabled = false;
      const msg = err.data?.message || err.message || 'Password reset failed. Check your details.';
      alerts.danger(msg);
    }
  });
});
