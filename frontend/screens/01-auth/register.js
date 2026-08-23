/**
 * Samskruti College Student Registration Controller
 */

import { api } from '../../js/api.js';
import { alerts } from '../../js/alerts.js';

// Regex supports AI, CS, AIML, EC, EE, M, CIV, CSE
const SAMSKRUTI_PIN_REGEX = /^[0-9]{2}259-(AI|CS|AIML|EC|EE|M|CIV|CSE)-[0-9]{3}$/i;

const BRANCH_MAP = {
  AI: 'Artificial Intelligence',
  CS: 'Computer Science & Engineering',
  CSE: 'Computer Science & Engineering',
  AIML: 'AI & Machine Learning',
  EC: 'Electronics & Communication',
  EE: 'Electrical & Electronics',
  M: 'Mechanical Engineering',
  CIV: 'Civil Engineering',
};

document.addEventListener('DOMContentLoaded', () => {
  const pinInput = document.getElementById('reg-pin');
  const nameInput = document.getElementById('reg-name');
  const contactInput = document.getElementById('reg-contact');
  const pinBadge = document.getElementById('pin-badge');
  const initForm = document.getElementById('register-init-form');
  const otpSection = document.getElementById('otp-section');
  const completeForm = document.getElementById('register-complete-form');
  const otpSentInfo = document.getElementById('otp-sent-info');
  const backBtn = document.getElementById('back-to-step1-btn');
  const sendOtpBtn = document.getElementById('send-otp-btn');
  const completeBtn = document.getElementById('complete-activation-btn');

  // Pre-fill PIN from query param
  const urlParams = new URLSearchParams(window.location.search);
  const initialPin = urlParams.get('pin');
  if (initialPin) {
    pinInput.value = initialPin.toUpperCase();
    validatePinInput(initialPin.toUpperCase());
    nameInput.focus();
  }

  // Real-time PIN format check & branch badge display
  pinInput.addEventListener('input', () => {
    pinInput.value = pinInput.value.toUpperCase();
    validatePinInput(pinInput.value);
  });

  function validatePinInput(value) {
    const match = value.trim().match(SAMSKRUTI_PIN_REGEX);
    if (match) {
      const branchCode = match[1].toUpperCase();
      pinBadge.textContent = BRANCH_MAP[branchCode] || 'Samskruti Verified';
      pinBadge.className = 'neu-badge neu-badge-success';
      pinBadge.style.display = 'inline-block';
      return true;
    } else {
      pinBadge.style.display = 'none';
      return false;
    }
  }

  // Step 1: Send Activation OTP
  initForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const pin = pinInput.value.trim().toUpperCase();
    const name = nameInput.value.trim();
    const contact = contactInput.value.trim();

    if (!validatePinInput(pin)) {
      alerts.danger('Invalid PIN format. Expected e.g. 24259-AI-025 or 24259-CS-025.');
      pinInput.focus();
      return;
    }

    sendOtpBtn.textContent = 'Generating OTP...';
    sendOtpBtn.disabled = true;

    try {
      const res = await api.post('/auth/register-init', { pin, name, contact });

      if (res && res.success) {
        alerts.success(res.message || 'OTP dispatched successfully.');
        otpSentInfo.textContent = `Enter the 6-digit OTP sent to ${contact}. (Demo OTP: ${res.debugOtp || '242590'})`;

        initForm.style.display = 'none';
        otpSection.style.display = 'flex';
        
        if (res.debugOtp) {
          document.getElementById('reg-otp').value = res.debugOtp;
        }
        document.getElementById('reg-password').focus();
      }
    } catch (err) {
      alerts.danger(err.message || 'Could not initiate activation.');
      sendOtpBtn.textContent = 'Send Activation OTP →';
      sendOtpBtn.disabled = false;
    }
  });

  // Back button
  backBtn.addEventListener('click', () => {
    otpSection.style.display = 'none';
    initForm.style.display = 'flex';
    sendOtpBtn.textContent = 'Send Activation OTP →';
    sendOtpBtn.disabled = false;
  });

  // Step 2: Complete Registration & Issue Session
  completeForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const pin = pinInput.value.trim().toUpperCase();
    const otp = document.getElementById('reg-otp').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;

    if (password.length < 8) {
      alerts.danger('Password must be at least 8 characters long.');
      return;
    }

    if (!/(?=.*[0-9])(?=.*[A-Z])/.test(password)) {
      alerts.danger('Password must contain at least one uppercase letter and one number.');
      return;
    }

    if (password !== confirmPassword) {
      alerts.danger('Passwords do not match.');
      return;
    }

    completeBtn.textContent = 'Activating Account...';
    completeBtn.disabled = true;

    try {
      const res = await api.post('/auth/register-complete', {
        pin,
        otp,
        password,
        confirmPassword,
      });

      if (res && res.success && res.user) {
        // Synchronously store all auth tokens and session data
        localStorage.setItem('auth_token', res.token);
        localStorage.setItem('dc_auth_token', res.token);
        localStorage.setItem('user_role', res.user.role || 'STUDENT');
        localStorage.setItem('student_pin', res.user.sbtetPin || res.user.rollNumber || pin);
        localStorage.setItem('user_name', res.user.name || '');
        localStorage.setItem('dc_user', JSON.stringify(res.user));
        localStorage.setItem('session_start', Date.now().toString());

        alerts.success('Account successfully activated! Launching Student Portal...');

        setTimeout(() => {
          window.location.replace('../02-student-portal/dashboard.html');
        }, 300);
      }
    } catch (err) {
      alerts.danger(err.message || 'Activation failed. Please check the OTP.');
      completeBtn.textContent = 'Activate & Launch Dashboard';
      completeBtn.disabled = false;
    }
  });
});
