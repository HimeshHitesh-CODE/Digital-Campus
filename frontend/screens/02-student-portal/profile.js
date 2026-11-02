/**
 * Samskruti College Student Profile Controller
 * Dynamic fill and contact editor logic
 */

document.addEventListener('DOMContentLoaded', () => {
  initProfile();
  initContactModal();
});

function initProfile() {
  if (typeof StitchState === 'undefined') return;
  const user = StitchState.getUser();

  // Dynamic user data binding
  const nameEls = document.querySelectorAll('[data-bind="userName"]');
  nameEls.forEach(el => el.textContent = user.name.toUpperCase());

  const pinEls = document.querySelectorAll('[data-bind="userPin"]');
  pinEls.forEach(el => el.textContent = user.pin || '24259-CS-025');

  // Load custom contact info if stored
  const customContact = localStorage.getItem('dc_student_contact');
  if (customContact) {
    try {
      const data = JSON.parse(customContact);
      if (data.mobile) {
        const mobEl = document.getElementById('displayMobile');
        if (mobEl) mobEl.textContent = data.mobile;
      }
      if (data.parent) {
        const parentEl = document.getElementById('displayParent');
        if (parentEl) parentEl.textContent = data.parent;
      }
    } catch (e) {}
  }
}

function initContactModal() {
  const modal = document.getElementById('editContactModal');
  const card = document.getElementById('contactModalCard');
  const closeBtn = document.getElementById('closeContactModal');
  const cancelBtn = document.getElementById('cancelContactModal');

  function openModal() {
    if (!modal) return;
    modal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
    setTimeout(() => {
      card?.classList.remove('scale-95');
      card?.classList.add('scale-100');
    }, 20);
  }

  function closeModal() {
    if (!modal) return;
    card?.classList.remove('scale-100');
    card?.classList.add('scale-95');
    modal.classList.add('opacity-0', 'pointer-events-none');
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 200);
  }

  // Find all buttons containing 'Edit Contact Info' or 'Update Contact Phone Numbers'
  document.querySelectorAll('button').forEach(btn => {
    const txt = btn.textContent || '';
    if (txt.includes('Edit Contact Info') || txt.includes('Update Contact Phone Numbers')) {
      btn.addEventListener('click', openModal);
    }
  });

  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  window.saveContactDetails = function() {
    const mobile = document.getElementById('editMobile')?.value.trim();
    const parent = document.getElementById('editParentContact')?.value.trim();

    localStorage.setItem('dc_student_contact', JSON.stringify({ mobile, parent }));

    // Update live DOM displays
    document.querySelectorAll('.font-mono').forEach(el => {
      if (el.textContent.includes('+91 98765 43210') && mobile) {
        el.textContent = mobile;
      }
      if (el.textContent.includes('+91 98765 43211') && parent) {
        el.textContent = parent;
      }
    });

    closeModal();
    showToast('Contact details successfully updated in campus registry!');
  };
}

function showToast(message) {
  const toast = document.getElementById('toastNotification');
  const msgEl = document.getElementById('toastMsg');
  if (!toast) return;

  msgEl.textContent = message;
  toast.classList.remove('hidden');

  clearTimeout(window._profileToastTimeout);
  window._profileToastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}
