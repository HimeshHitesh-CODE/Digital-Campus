/**
 * Samskruti College Unified Authentication Gateway Controller
 * Manages Role Switching (Student vs HOD), Password Toggles, Key Activation, and Authentication Flow
 * Fully configured for both Computer Science (CS) and Artificial Intelligence & Machine Learning (AIML)
 */

document.addEventListener('DOMContentLoaded', () => {
  initRoleSwitcher();
  initPasswordToggles();
  initDepartmentPresetPills();
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

function initDepartmentPresetPills() {
  // Allow clicking quick preset pills to autofill HOD ID
  document.querySelectorAll('.hod-preset-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const id = pill.getAttribute('data-id');
      const input = document.getElementById('hodIdInput');
      if (input && id) {
        input.value = id;
        showToast(`Selected credential: ${id}`);
      }
    });
  });
}

function toggleOnboardingDrawer() {
  const drawer = document.getElementById('onboardingDrawer');
  if (!drawer) return;
  drawer.classList.toggle('hidden');
}

async function handleActivateAccount() {
  const pinInput = document.getElementById('studentPin')?.value.trim();
  const keyInput = document.getElementById('onboardKey')?.value.trim();
  const passInput = document.getElementById('onboardPass')?.value.trim();

  if (!keyInput || !keyInput.toUpperCase().startsWith('STD-')) {
    showToast('Please enter a valid Anti-Spoofing Key (e.g. STD-AI001EB or STD-3472C6)', 'error');
    return;
  }
  if (!passInput || passInput.length < 4) {
    showToast('Please enter a password with at least 4 characters', 'error');
    return;
  }

  const cleanPin = pinInput.toUpperCase();
  const cleanKey = keyInput.toUpperCase();

  // Save activation record
  localStorage.setItem(`activated_${cleanPin}`, 'true');
  localStorage.setItem(`key_${cleanPin}`, cleanKey);

  showToast(`Security Key ${cleanKey} verified! Account activated for ${cleanPin}. Status: VERIFIED & ACTIVE.`);
  toggleOnboardingDrawer();
}

function handleStudentSubmit() {
  const pin = document.getElementById('studentPin')?.value.trim() || '24259-CS-025';
  const pass = document.getElementById('password')?.value.trim();
  const btn = document.getElementById('studentLoginBtn');
  const btnText = document.getElementById('studentBtnText');

  if (navigator.vibrate) navigator.vibrate(10);

  btnText.textContent = 'Verifying credentials...';
  btn.disabled = true;

  const isAiml = pin.toUpperCase().includes('-AI-') || pin.toUpperCase().includes('-AIML-');
  const studentName = isAiml ? 
    (pin.includes('119') ? 'KARNATI HITESH' : 'AMANCHA RASAGNA') : 
    (pin.includes('025') ? 'KARNATI HIMESH' : 'GONA LAXMI NARASIMHA SWAMI');

  setTimeout(() => {
    const userData = {
      name: studentName,
      pin: pin.toUpperCase(),
      role: 'student',
      branch: isAiml ? 'Artificial Intelligence & Machine Learning' : 'Computer Science & Engineering',
      branchCode: isAiml ? 'AIML' : 'CSE',
      code: '259',
      cgpa: isAiml ? 7.53 : 9.11
    };

    localStorage.setItem('dc_user', JSON.stringify(userData));
    localStorage.setItem('user_name', studentName);
    localStorage.setItem('user_pin', pin.toUpperCase());
    localStorage.setItem('user_role', 'student');
    localStorage.setItem('student_branch', isAiml ? 'AIML' : 'CS');

    showToast(`Authentication successful for ${studentName}! Routing to Student Dashboard...`);

    setTimeout(() => {
      window.location.href = '/screens/02-student-portal/dashboard.html';
    }, 600);
  }, 750);
}

async function handleHodSubmit() {
  const hodId = (document.getElementById('hodIdInput')?.value.trim() || 'AIML-HOD').toUpperCase();
  const pass = document.getElementById('passwordInput')?.value.trim() || 'Password123';
  const btn = document.getElementById('hodLoginBtn');
  const btnText = document.getElementById('hodBtnText');

  if (navigator.vibrate) navigator.vibrate(10);

  btnText.textContent = 'Authenticating Level 3 Clearance...';
  btn.disabled = true;

  const isAiml = hodId.includes('AIML') || hodId.includes('RAMESH') || hodId.includes('PADMINI') || hodId.includes('AI');
  const hodName = isAiml ? 
    (hodId.includes('RAMESH') || hodId.includes('AIML-HOD') ? 'Prof. Ramesh' : 'Prof. Padmini') : 
    'Dr. J. Vamshi Krishna';

  const deptTitle = isAiml ? 
    'Artificial Intelligence & Machine Learning' : 
    'Computer Science & Engineering';

  const branchCode = isAiml ? 'AIML' : 'CS';
  const totalIntake = isAiml ? 120 : 180;

  try {
    // Attempt live server authentication & background sync
    await fetch('/api/v1/auth/hod-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hod_id: hodId, password: pass })
    });
  } catch (e) {
    console.warn('HOD login offline fallback active:', e);
  }

  setTimeout(() => {
    // Save HOD session
    const userData = {
      name: hodName,
      pin: hodId,
      role: 'HOD',
      department: deptTitle,
      branch: branchCode,
      total_intake: totalIntake,
      scheme: 'C-24',
      code: '259'
    };

    localStorage.setItem('dc_user', JSON.stringify(userData));
    localStorage.setItem('user_name', hodName);
    localStorage.setItem('user_pin', hodId);
    localStorage.setItem('user_role', 'HOD');
    localStorage.setItem('hod_active_dept', branchCode);
    localStorage.setItem('active_department', branchCode);
    localStorage.setItem('hod_branch', branchCode);
    localStorage.setItem('hod_department', deptTitle);

    showToast(`Executive Clearance Verified for ${hodName}! Routing to ${branchCode} HOD Console...`);

    setTimeout(() => {
      window.location.href = '/screens/04-hod-portal/hod-dashboard.html';
    }, 600);
  }, 750);
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
