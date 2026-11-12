/**
 * Samskruti Digital Campus (Institution Code: 259)
 * Student Profile & Academic Dossier Controller
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initProfileData();
    initContactModal();
    initPasswordModal();
  });

  function getActiveUser() {
    try {
      const stored = localStorage.getItem('dc_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u && (u.name || u.pin)) return u;
      }
    } catch (_) {}

    const name = localStorage.getItem('user_name') || 'KARNATI HIMESH';
    const pin = localStorage.getItem('student_pin') || localStorage.getItem('user_pin') || '24259-CS-025';
    const branch = localStorage.getItem('student_branch') || 'CS';
    return {
      name,
      pin,
      branch: branch === 'AIML' ? 'Artificial Intelligence & Machine Learning' : 'Computer Science & Engineering',
      branchCode: branch,
      cgpa: branch === 'AIML' ? 7.53 : 9.11
    };
  }

  function initProfileData() {
    const user = getActiveUser();
    const isAiml = (user.branch && user.branch.includes('AIML')) || (user.pin && user.pin.includes('AIML'));

    // Dynamic Elements
    const nameEl = document.getElementById('profileStudentName');
    const pinEl = document.getElementById('profileStudentPin');
    const branchEl = document.getElementById('profileStudentBranch');
    const avatarEl = document.getElementById('profileInitialsAvatar');
    const cgpaEl = document.getElementById('profileCgpaVal');
    const attEl = document.getElementById('profileAttendanceVal');
    const keyEl = document.getElementById('profileSecurityKey');
    const hodEl = document.getElementById('profileHodSignatory');

    if (nameEl) nameEl.textContent = (user.name || (isAiml ? 'KARNATI HITESH' : 'KARNATI HIMESH')).toUpperCase();
    if (pinEl) pinEl.textContent = `PIN: ${user.pin || (isAiml ? '24259-AIML-119' : '24259-CS-025')} • SBTET REG #${isAiml ? '2024259119' : '2024259025'}`;
    if (branchEl) branchEl.textContent = isAiml ? 'Department of Artificial Intelligence & Machine Learning' : 'Department of Computer Science & Engineering';

    const displayName = user.name || (isAiml ? 'Hitesh Karnati' : 'Himesh Karnati');
    const initials = displayName.split(/\s+/).map(n => n[0]).slice(0, 2).join('').toUpperCase();
    if (avatarEl) avatarEl.textContent = initials || 'KH';

    if (cgpaEl) cgpaEl.textContent = isAiml ? '7.53' : '9.11';
    if (attEl) attEl.textContent = isAiml ? '82.50%' : '84.82%';
    if (keyEl) keyEl.textContent = isAiml ? 'STD-AI77B2' : 'STD-3472C6';
    if (hodEl) hodEl.textContent = isAiml ? 'Prof. Padma (PIN: AIML-HOD)' : 'Dr. J. Vamshi Krishna (PIN: VAMSHI-CS-HOD)';

    // Load custom contact info if stored
    const customContact = localStorage.getItem('dc_student_contact');
    if (customContact) {
      try {
        const data = JSON.parse(customContact);
        if (data.mobile) {
          const mob = document.getElementById('displayMobile');
          if (mob) mob.textContent = data.mobile;
        }
        if (data.parent) {
          const par = document.getElementById('displayParent');
          if (par) par.textContent = data.parent;
        }
      } catch (_) {}
    }
  }

  function initContactModal() {
    const modal = document.getElementById('editContactModal');
    const openBtn = document.getElementById('openEditContactModalBtn');
    const closeBtn = document.getElementById('closeContactModal');
    const cancelBtn = document.getElementById('cancelContactModal');
    const mobileInput = document.getElementById('editMobile');
    const parentInput = document.getElementById('editParentContact');

    function openModal() {
      const curMobile = document.getElementById('displayMobile')?.textContent || '';
      const curParent = document.getElementById('displayParent')?.textContent || '';
      if (mobileInput) mobileInput.value = curMobile.trim();
      if (parentInput) parentInput.value = curParent.trim();

      modal?.classList.remove('hidden');
      modal?.classList.add('flex');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal?.classList.add('hidden');
      modal?.classList.remove('flex');
      document.body.style.overflow = '';
    }

    openBtn?.addEventListener('click', openModal);
    closeBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);

    modal?.addEventListener('click', (e) => {
      if (e.target === modal || !e.target.closest('.bento-card, .rounded-2xl')) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal?.classList.contains('hidden')) {
        closeModal();
      }
    });

    window.saveContactDetails = function () {
      const mob = mobileInput?.value.trim();
      const par = parentInput?.value.trim();

      if (!mob || !par) {
        showToast('Please enter valid mobile numbers', 'error');
        return;
      }

      const curMobile = document.getElementById('displayMobile');
      const curParent = document.getElementById('displayParent');
      if (curMobile) curMobile.textContent = mob;
      if (curParent) curParent.textContent = par;

      localStorage.setItem('dc_student_contact', JSON.stringify({ mobile: mob, parent: par }));
      closeModal();
      showToast('Contact phone numbers updated successfully');
    };
  }

  function initPasswordModal() {
    const modal = document.getElementById('changePassModal');
    const openBtn = document.getElementById('openChangePassModalBtn');
    const closeBtn = document.getElementById('closePassModal');
    const cancelBtn = document.getElementById('cancelPassModal');
    const curInput = document.getElementById('currentPassInput');
    const newInput = document.getElementById('newPassInput');
    const confirmInput = document.getElementById('confirmPassInput');

    function openModal() {
      if (curInput) curInput.value = '';
      if (newInput) newInput.value = '';
      if (confirmInput) confirmInput.value = '';

      modal?.classList.remove('hidden');
      modal?.classList.add('flex');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal?.classList.add('hidden');
      modal?.classList.remove('flex');
      document.body.style.overflow = '';
    }

    openBtn?.addEventListener('click', openModal);
    closeBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);

    modal?.addEventListener('click', (e) => {
      if (e.target === modal || !e.target.closest('.bento-card, .rounded-2xl')) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal?.classList.contains('hidden')) {
        closeModal();
      }
    });

    window.saveNewPassword = function () {
      const cur = curInput?.value.trim();
      const nw = newInput?.value.trim();
      const cf = confirmInput?.value.trim();

      if (!cur) {
        showToast('Please enter your current password', 'error');
        return;
      }
      if (!nw || nw.length < 6) {
        showToast('New password must be at least 6 characters', 'error');
        return;
      }
      if (nw !== cf) {
        showToast('Passwords do not match. Please re-enter', 'error');
        return;
      }

      const user = getActiveUser();
      const pin = user.pin || '24259-CS-025';
      localStorage.setItem(`pass_${pin}`, nw);

      closeModal();
      showToast('Account password updated successfully');
    };
  }

  function showToast(msg, type = 'success') {
    const toast = document.getElementById('profileToast');
    const text = document.getElementById('profileToastMsg');
    if (!toast || !text) return;
    text.textContent = msg;
    toast.classList.remove('hidden');
    clearTimeout(window._profToastTimeout);
    window._profToastTimeout = setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }

})();
