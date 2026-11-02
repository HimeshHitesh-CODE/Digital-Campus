/**
 * Samskruti College HOD Document Approvals Controller
 * Interactive Filtering, Real-Time Search, Review Modal, and 6-Digit Counter OTP Issuance
 */

document.addEventListener('DOMContentLoaded', () => {
  initApprovals();
  checkUrlParams();
  initHelpDeskLinks();
});

let activeFilter = 'All';

function initApprovals() {
  bindFilterPills();
  bindSearchInput();
  bindReviewButtons();
  bindModalActions();
  bindPolicyAndFilterButtons();
}

function bindFilterPills() {
  document.querySelectorAll('button').forEach(btn => {
    const txt = btn.textContent || '';
    if (txt.includes('All Requests') || txt.includes('Bonafide Certificates') || txt.includes('Internship NOC')) {
      btn.addEventListener('click', () => {
        // Clear active
        document.querySelectorAll('button').forEach(b => {
          if (b.textContent.includes('Requests') || b.textContent.includes('Bonafide') || b.textContent.includes('NOC')) {
            b.classList.remove('bg-emerald-800', 'text-white', 'shadow-sm');
            b.classList.add('bg-white', 'text-stone-700');
          }
        });
        btn.classList.add('bg-emerald-800', 'text-white', 'shadow-sm');
        btn.classList.remove('bg-white', 'text-stone-700');

        activeFilter = txt.includes('Bonafide') ? 'Bonafide' : (txt.includes('NOC') ? 'NOC' : 'All');
        filterRows();
      });
    }
  });
}

function bindSearchInput() {
  const search = document.querySelector('input[placeholder*="Search by PIN"]') || document.querySelector('input[type="text"]');
  if (!search) return;

  search.addEventListener('input', () => {
    filterRows();
  });
}

function filterRows() {
  const search = document.querySelector('input[placeholder*="Search by PIN"]') || document.querySelector('input[type="text"]');
  const query = search ? search.value.toLowerCase().trim() : '';

  document.querySelectorAll('tbody tr').forEach(row => {
    const text = row.textContent.toLowerCase();
    const matchesSearch = !query || text.includes(query);
    let matchesFilter = true;

    if (activeFilter === 'Bonafide') {
      matchesFilter = text.includes('bonafide');
    } else if (activeFilter === 'NOC') {
      matchesFilter = text.includes('noc') || text.includes('internship');
    }

    if (matchesSearch && matchesFilter) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

let activeRow = null;

function bindReviewButtons() {
  document.querySelectorAll('tbody tr').forEach(row => {
    const revBtn = Array.from(row.querySelectorAll('button')).find(b => b.textContent.includes('Review & Sign'));
    if (!revBtn) return;

    revBtn.addEventListener('click', (e) => {
      e.preventDefault();
      activeRow = row;

      const name = row.querySelector('.font-bold, .font-semibold')?.textContent.trim() || 'Student';
      const pin = row.querySelector('.font-mono')?.textContent.trim() || '24259-CS-025';
      const docType = row.querySelector('span.rounded-full.bg-emerald-100, span.rounded-full.bg-stone-100')?.textContent.trim() || 'Bonafide Certificate';

      const titleEl = document.getElementById('modalStudentTitle');
      const pinEl = document.getElementById('modalStudentPin');
      const docEl = document.getElementById('modalDocType');

      if (titleEl) titleEl.textContent = `Review: ${name}`;
      if (pinEl) pinEl.textContent = pin;
      if (docEl) docEl.textContent = `${docType} (1 Copy)`;

      openReviewModal();
    });
  });
}

function openReviewModal() {
  const modal = document.getElementById('reviewSignModal');
  const card = document.getElementById('reviewModalCard');
  if (!modal) return;

  modal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
  setTimeout(() => {
    card?.classList.remove('scale-95');
    card?.classList.add('scale-100');
  }, 20);
}

function closeReviewModal() {
  const modal = document.getElementById('reviewSignModal');
  const card = document.getElementById('reviewModalCard');
  if (!modal) return;

  card?.classList.remove('scale-100');
  card?.classList.add('scale-95');
  modal.classList.add('opacity-0', 'pointer-events-none');
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 200);
}

function bindModalActions() {
  document.getElementById('closeReviewModal')?.addEventListener('click', closeReviewModal);
  
  // Approve
  document.getElementById('approveBtn')?.addEventListener('click', () => {
    if (navigator.vibrate) navigator.vibrate(20);
    const pin = document.getElementById('modalStudentPin')?.textContent || '24259-CS-025';
    const otp = '584386';

    if (activeRow) {
      const actionCell = activeRow.querySelector('td:last-child');
      if (actionCell) {
        actionCell.innerHTML = `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-bold"><span class="material-symbols-outlined text-[14px]">check_circle</span>Approved (OTP: ${otp})</span>`;
      }
    }

    // Save to StitchState & localStorage
    if (typeof StitchState !== 'undefined') {
      const requests = StitchState.getRequests();
      if (requests.length > 0) {
        requests[0].status = 'READY FOR PICKUP';
        requests[0].otp = otp;
        localStorage.setItem('stitch_requests', JSON.stringify(requests));
      }
    }
    localStorage.setItem(`otp_${pin}`, otp);

    closeReviewModal();
    showToast(`Approved! 6-Digit Counter Token ${otp} issued for student PIN ${pin}. Counter pickup verified.`);
  });

  // Reject
  document.getElementById('rejectBtn')?.addEventListener('click', () => {
    if (navigator.vibrate) navigator.vibrate(20);
    const pin = document.getElementById('modalStudentPin')?.textContent || '24259-CS-025';

    if (activeRow) {
      const actionCell = activeRow.querySelector('td:last-child');
      if (actionCell) {
        actionCell.innerHTML = `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-mono text-xs font-bold"><span class="material-symbols-outlined text-[14px]">cancel</span>Rejected (Deficit)</span>`;
      }
    }

    closeReviewModal();
    showToast(`Application for ${pin} marked as REJECTED due to statutory attendance deficit.`, 'error');
  });
}

function bindPolicyAndFilterButtons() {
  // Read Policy Button
  document.querySelectorAll('button').forEach(btn => {
    const txt = btn.textContent || '';
    if (txt.includes('Read Policy')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('SBTET Scheme C-24 Policy: Minimum 75% attendance mandatory. 65-74.9% condonable with Medical Board approval. <65% detained.');
      });
    } else if (txt.includes('Filter') || txt.includes('tune')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Active filters: C-24 Scheme, CSE Department, Current Semester.');
      });
    }
  });
}

function checkUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const pin = urlParams.get('pin');
  if (!pin) return;

  // Search and highlight row
  const search = document.querySelector('input[placeholder*="Search by PIN"]') || document.querySelector('input[type="text"]');
  if (search) {
    search.value = pin;
    filterRows();
  }

  // Open modal if found
  setTimeout(() => {
    const row = Array.from(document.querySelectorAll('tbody tr')).find(r => r.textContent.includes(pin));
    if (row) {
      const revBtn = Array.from(row.querySelectorAll('button')).find(b => b.textContent.includes('Review & Sign'));
      revBtn?.click();
    }
  }, 300);
}

function initHelpDeskLinks() {
  document.querySelectorAll('a, button').forEach(el => {
    const txt = (el.textContent || '').toLowerCase();
    const href = el.getAttribute('href') || '';
    if (txt.includes('help desk') || txt.includes('helpdesk') || txt.includes('need help') || href.includes('help')) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/screens/02-student-portal/helpdesk.html';
      });
    }
  });
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toastNotification');
  const msgEl = document.getElementById('toastMsg');
  const iconEl = document.getElementById('toastIcon');
  if (!toast) return;

  msgEl.textContent = message;
  if (iconEl) iconEl.textContent = type === 'error' ? 'cancel' : 'check_circle';
  toast.classList.remove('hidden');

  clearTimeout(window._apprToastTimeout);
  window._apprToastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}
