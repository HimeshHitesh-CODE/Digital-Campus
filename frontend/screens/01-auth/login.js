/**
 * Samskruti College Unified Authentication Gateway Controller
 * Manages Role Switching (Student vs HOD), Password Toggles, Key Activation, and Authentication Flow
 */

document.addEventListener('DOMContentLoaded', () => {
  initRoleSwitcher();
  initPasswordToggles();
});

let currentRole = 'student';

function initRoleSwitcher() {
  const studentBtn = document.getElementById('studentRoleBtn');
  const hodBtn = document.getElementById('hodRoleBtn');
  const indicator = document.getElementById('activePillIndicator');
  const studentView = document.getElementById('studentLoginView');
  const hodView = document.getElementById('hodLoginView');

  if (!studentBtn || !hodBtn) return;

  function switchRole(role) {
    currentRole = role;
    if (navigator.vibrate) navigator.vibrate(10);

    if (role === 'student') {
      indicator.style.left = '4px';
      indicator.style.width = '108px';
      studentBtn.classList.remove('text-emerald-200');
      studentBtn.classList.add('text-white');
      hodBtn.classList.remove('text-white');
      hodBtn.classList.add('text-emerald-200');

      hodView.classList.add('hidden');
      studentView.classList.remove('hidden');
    } else {
      indicator.style.left = '112px';
      indicator.style.width = '140px';
      hodBtn.classList.remove('text-emerald-200');
      hodBtn.classList.add('text-white');
      studentBtn.classList.remove('text-white');
      studentBtn.classList.add('text-emerald-200');

      studentView.classList.add('hidden');
      hodView.classList.remove('hidden');
    }
  }

  studentBtn.addEventListener('click', () => switchRole('student'));
  hodBtn.addEventListener('click', () => switchRole('hod'));

  // Read URL query param ?role=hod if any
  const params = new URLSearchParams(window.location.search);
  if (params.get('role') === 'hod') {
    switchRole('hod');
  }
}

function initPasswordToggles() {
  // Student Password Toggle
  const toggleStudent = document.getElementById('togglePasswordVisibility');
  const studentPass = document.getElementById('password');
  const eyeIcon = document.getElementById('eyeIcon');

  toggleStudent?.addEventListener('click', () => {
    const isPass = studentPass.getAttribute('type') === 'password';
    studentPass.setAttribute('type', isPass ? 'text' : 'password');
    eyeIcon.textContent = isPass ? 'visibility_off' : 'visibility';
  });

  // HOD Password Toggle
  const toggleHod = document.getElementById('togglePasswordBtn');
  const hodPass = document.getElementById('passwordInput');
  const hodEyeIcon = document.getElementById('hodEyeIcon');

  toggleHod?.addEventListener('click', () => {
    const isPass = hodPass.getAttribute('type') === 'password';
    hodPass.setAttribute('type', isPass ? 'text' : 'password');
    hodEyeIcon.textContent = isPass ? 'visibility_off' : 'visibility';
  });
}

function toggleOnboardingDrawer() {
  const drawer = document.getElementById('onboardingDrawer');
  if (!drawer) return;
  drawer.classList.toggle('hidden');
}

function handleActivateAccount() {
  const pin = document.getElementById('studentPin')?.value.trim();
  const key = document.getElementById('onboardKey')?.value.trim();
  const pass = document.getElementById('onboardPass')?.value.trim();

  if (!key || !key.startsWith('STD-')) {
    showToast('Please enter a valid Anti-Spoofing Key (e.g. STD-3472C6)', 'error');
    return;
  }
  if (!pass || pass.length < 4) {
    showToast('Please enter a password with at least 4 characters', 'error');
    return;
  }

  showToast(`Security Key ${key} verified! Account activated for ${pin}`);
  toggleOnboardingDrawer();
}

function handleStudentSubmit() {
  const pin = document.getElementById('studentPin')?.value.trim() || '24259-CS-025';
  const pass = document.getElementById('password')?.value.trim();
  const btn = document.getElementById('studentLoginBtn');
  const btnText = document.getElementById('studentBtnText');

  if (navigator.vibrate) navigator.vibrate(10);

  // Button spinner
  btnText.textContent = 'Verifying credentials...';
  btn.disabled = true;

  setTimeout(() => {
    // Save student session
    const userData = {
      name: 'KARNATI HIMESH',
      pin: pin,
      role: 'student',
      branch: 'Computer Science & Engineering',
      code: '259',
      cgpa: 9.11
    };

    localStorage.setItem('dc_user', JSON.stringify(userData));
    localStorage.setItem('user_name', 'KARNATI HIMESH');
    localStorage.setItem('user_pin', pin);
    localStorage.setItem('user_role', 'student');

    showToast('Authentication successful! Routing to Student Dashboard...');

    setTimeout(() => {
      window.location.href = '/screens/02-student-portal/dashboard.html';
    }, 600);
  }, 750);
}

function handleHodSubmit() {
  const hodId = document.getElementById('hodIdInput')?.value.trim() || 'VAMSHI-CS-HOD';
  const pass = document.getElementById('passwordInput')?.value.trim();
  const btn = document.getElementById('hodLoginBtn');
  const btnText = document.getElementById('hodBtnText');

  if (navigator.vibrate) navigator.vibrate(10);

  btnText.textContent = 'Authenticating Level 3 Clearance...';
  btn.disabled = true;

  setTimeout(() => {
    // Save HOD session
    const userData = {
      name: 'Dr. J. Vamshi Krishna',
      pin: hodId,
      role: 'HOD',
      branch: 'Computer Science & Engineering',
      code: '259'
    };

    localStorage.setItem('dc_user', JSON.stringify(userData));
    localStorage.setItem('user_name', 'Dr. J. Vamshi Krishna');
    localStorage.setItem('user_pin', hodId);
    localStorage.setItem('user_role', 'HOD');

    showToast('Executive Clearance Verified! Entering HOD Console...');

    setTimeout(() => {
      window.location.href = '/screens/04-hod-portal/hod-dashboard.html';
    }, 600);
  }, 850);
}

function openForgotPassword() {
  showToast('Self-service password recovery is available via verified department Security Key.');
  const drawer = document.getElementById('onboardingDrawer');
  if (drawer) drawer.classList.remove('hidden');
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toastNotification');
  const msgEl = document.getElementById('toastMsg');
  const iconEl = document.getElementById('toastIcon');
  if (!toast) return;

  msgEl.textContent = message;
  iconEl.textContent = type === 'error' ? 'error' : 'check_circle';
  toast.classList.remove('hidden');

  clearTimeout(window._loginToastTimeout);
  window._loginToastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}
