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
let activeDepartment = 'AIML';
let currentRequests = [];
let activeRequest = null;
let activeRow = null;

function getActiveDepartment() {
  const stored = localStorage.getItem('hod_active_dept');
  if (stored === 'CS' || stored === 'AIML') return stored;
  try {
    const userStr = localStorage.getItem('dc_user');
    if (userStr) {
      const u = JSON.parse(userStr);
      if (u.branch === 'CS' || (u.pin && u.pin.includes('CS'))) return 'CS';
    }
  } catch (_) {}
  return 'AIML';
}

function initApprovals() {
  activeDepartment = getActiveDepartment();
  loadLiveRequests();

  bindFilterPills();
  bindSearchInput();
  bindModalActions();
  bindPolicyAndFilterButtons();
}

async function loadLiveRequests() {
  try {
    const res = await fetch(`/api/v1/hod/requests?branch=${activeDepartment}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.requests) && data.requests.length > 0) {
        currentRequests = data.requests;
        renderRequestsTable(currentRequests);
        return;
      }
    }
  } catch (_) {}

  // Fallback default department requests
  if (activeDepartment === 'AIML') {
    currentRequests = [
      { id: 1, student_pin: '24259-AIML-119', student_name: 'KARNATI HITESH', request_type: 'Bonafide Certificate', purpose: 'Passport & Scholarship Verification', copies: 1, attendance_pct: 43.2, created_at: 'Today, 10:30 AM', status: 'PENDING' },
      { id: 2, student_pin: '24259-AIML-001', student_name: 'AMANCHA RASAGNA', request_type: 'Internship NOC', purpose: 'Industrial Internship Off-Campus Requisition', copies: 1, attendance_pct: 43.2, created_at: 'Yesterday, 04:15 PM', status: 'PENDING' },
      { id: 3, student_pin: '24259-AIML-010', student_name: 'ITTE NIKHIL TEJA', request_type: 'Bus Pass Endorsement', purpose: 'TSRTC Student Concession Pass', copies: 1, attendance_pct: 42.0, created_at: '2 days ago', status: 'PENDING' }
    ];
  } else {
    currentRequests = [
      { id: 1, student_pin: '24259-CS-025', student_name: 'KARNATI HIMESH', request_type: 'Bonafide Certificate', purpose: 'Passport & Scholarship Verification', copies: 1, attendance_pct: 38.64, created_at: 'Today, 10:15 AM', status: 'PENDING' },
      { id: 2, student_pin: '24259-CS-037', student_name: 'EDAMANAPALLY SAMISAAC', request_type: 'Internship NOC', purpose: 'Infosys Springboard AI Cohort', copies: 1, attendance_pct: 27.27, created_at: 'Yesterday, 02:30 PM', status: 'PENDING' },
      { id: 3, student_pin: '24259-CS-040', student_name: 'TALLAPALLI TULASI RAM GOUD', request_type: 'Bonafide Certificate', purpose: 'Higher Studies Verification', copies: 1, attendance_pct: 84.5, created_at: '2 days ago', status: 'PENDING' }
    ];
  }

  renderRequestsTable(currentRequests);
}

function renderRequestsTable(requests) {
  const tbody = document.getElementById('approvalsTbody');
  if (!tbody) return;

  tbody.innerHTML = requests.map(req => {
    const pin = req.student_pin || req.pin;
    const name = req.student_name || req.name;
    const type = req.request_type || req.type || 'Bonafide Certificate';
    const purpose = req.purpose || req.notes || 'Academic Verification';
    const att = Number(req.attendance_pct || req.attendance || 40);
    const copies = req.copies || 1;
    const date = req.created_at || 'Today';
    const status = (req.status || 'PENDING').toUpperCase();

    const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('');
    const attBadge = att >= 75 ? 'bg-emerald-50 text-[#003519] border-emerald-200' :
                     (att >= 65 ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200');

    let actionContent = '';
    if (status === 'ACCEPTED' || status === 'APPROVED') {
      const otp = req.pickup_otp || req.otp || '584386';
      actionContent = `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-bold"><span class="material-symbols-outlined text-[14px]">check_circle</span>Approved (OTP: ${otp})</span>`;
    } else if (status === 'REJECTED') {
      actionContent = `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-mono text-xs font-bold"><span class="material-symbols-outlined text-[14px]">cancel</span>Rejected</span>`;
    } else {
      actionContent = `
        <button class="px-4 py-1.5 rounded-full bg-[#003519] hover:bg-[#022c22] text-white text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer review-sign-btn"
                data-id="${req.id}" data-pin="${pin}" data-name="${escapeHtml(name)}" data-type="${escapeHtml(type)}" data-purpose="${escapeHtml(purpose)}" data-att="${att}" data-copies="${copies}">
          Review &amp; Sign →
        </button>
      `;
    }

    return `
      <tr class="bg-white hover:bg-emerald-50/40 transition-colors" data-pin="${pin}">
        <td class="py-4 px-4 font-mono text-xs font-bold text-[#003519]">#DOC-${req.id}</td>
        <td class="py-4 px-4 font-mono text-xs text-stone-700 font-medium">${pin}</td>
        <td class="py-4 px-4">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-full bg-[#003519] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm font-mono">
              ${initials}
            </div>
            <span class="font-bold text-stone-900 text-sm">${escapeHtml(name)}</span>
          </div>
        </td>
        <td class="py-4 px-4">
          <span class="inline-block px-2.5 py-1 rounded-full bg-emerald-50 text-[#003519] border border-emerald-200/80 text-xs font-bold tracking-wide">
            ${escapeHtml(type)} (${copies} Copy)
          </span>
        </td>
        <td class="py-4 px-4 text-sm text-stone-600 max-w-xs truncate" title="${escapeHtml(purpose)}">
          ${escapeHtml(purpose)}
        </td>
        <td class="py-4 px-4">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${attBadge} font-mono text-xs font-bold border">
            ${att.toFixed(1)}%
          </span>
        </td>
        <td class="py-4 px-4 font-mono text-xs text-stone-500">${date}</td>
        <td class="py-4 px-4 text-right">
          ${actionContent}
        </td>
      </tr>
    `;
  }).join('');

  bindReviewButtons();
}

function bindFilterPills() {
  document.querySelectorAll('button').forEach(btn => {
    const txt = btn.textContent || '';
    if (txt.includes('All Requests') || txt.includes('Bonafide Certificates') || txt.includes('Internship NOC')) {
      btn.addEventListener('click', () => {
        document.querySelectorAll('button').forEach(b => {
          if (b.textContent.includes('Requests') || b.textContent.includes('Bonafide') || b.textContent.includes('NOC')) {
            b.classList.remove('bg-[#003519]', 'text-white', 'shadow-sm');
            b.classList.add('bg-stone-100', 'text-stone-700');
          }
        });
        btn.classList.add('bg-[#003519]', 'text-white', 'shadow-sm');
        btn.classList.remove('bg-stone-100', 'text-stone-700');

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

  document.querySelectorAll('#approvalsTbody tr').forEach(row => {
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

function bindReviewButtons() {
  document.querySelectorAll('.review-sign-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      activeRow = btn.closest('tr');

      const id = btn.getAttribute('data-id');
      const pin = btn.getAttribute('data-pin');
      const name = btn.getAttribute('data-name');
      const type = btn.getAttribute('data-type');
      const purpose = btn.getAttribute('data-purpose');
      const att = btn.getAttribute('data-att');
      const copies = btn.getAttribute('data-copies');

      activeRequest = { id, pin, name, type, purpose, att, copies };

      const titleEl = document.getElementById('modalStudentTitle');
      const pinEl = document.getElementById('modalStudentPin');
      const docEl = document.getElementById('modalDocType');

      if (titleEl) titleEl.textContent = `Review: ${name}`;
      if (pinEl) pinEl.textContent = pin;
      if (docEl) docEl.textContent = `${type} (${copies} Copy)`;

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
  document.getElementById('approveBtn')?.addEventListener('click', async () => {
    if (navigator.vibrate) navigator.vibrate(20);
    const pin = activeRequest ? activeRequest.pin : (document.getElementById('modalStudentPin')?.textContent || '24259-AIML-119');
    const reqId = activeRequest ? activeRequest.id : 1;

    // Generate deterministic/random 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    try {
      await fetch(`/api/v1/hod/requests/${reqId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACCEPTED', hod_notes: `Approved by HOD. Counter pickup token: ${otp}` })
      });
    } catch (_) {}

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
    showToast(`Approved! 6-Digit Counter Token ${otp} issued for student PIN ${pin}. Ready for counter pickup.`);
  });

  // Reject
  document.getElementById('rejectBtn')?.addEventListener('click', async () => {
    if (navigator.vibrate) navigator.vibrate(20);
    const pin = activeRequest ? activeRequest.pin : (document.getElementById('modalStudentPin')?.textContent || '24259-AIML-119');
    const reqId = activeRequest ? activeRequest.id : 1;

    try {
      await fetch(`/api/v1/hod/requests/${reqId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED', hod_notes: 'Rejected due to statutory attendance deficit.' })
      });
    } catch (_) {}

    if (activeRow) {
      const actionCell = activeRow.querySelector('td:last-child');
      if (actionCell) {
        actionCell.innerHTML = `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-mono text-xs font-bold"><span class="material-symbols-outlined text-[14px]">cancel</span>Rejected</span>`;
      }
    }

    closeReviewModal();
    showToast(`Application for ${pin} marked as REJECTED due to attendance deficit.`);
  });
}

function bindPolicyAndFilterButtons() {
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
        showToast(`Active filters: C-24 Scheme, ${activeDepartment} Department, Current Semester.`);
      });
    }
  });
}

function checkUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const pin = urlParams.get('pin');
  if (!pin) return;

  setTimeout(() => {
    const row = document.querySelector(`tr[data-pin="${pin}"]`) ||
                Array.from(document.querySelectorAll('#approvalsTbody tr')).find(r => r.textContent.includes(pin));
    if (row) {
      row.classList.add('bg-emerald-100/60');
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const revBtn = row.querySelector('.review-sign-btn');
      if (revBtn) revBtn.click();
    }
  }, 300);
}

function escapeHtml(str) {
  if (!str) return '';
  const p = document.createElement('p');
  p.textContent = str;
  return p.innerHTML;
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

function showToast(message) {
  const toast = document.getElementById('toastNotification');
  const msgEl = document.getElementById('toastMsg');
  if (!toast) return;

  msgEl.textContent = message;
  toast.classList.remove('hidden');

  clearTimeout(window._approvalsToastTimeout);
  window._approvalsToastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}
