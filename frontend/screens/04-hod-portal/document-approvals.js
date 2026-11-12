/**
 * Samskruti College HOD Document Approvals Controller
 * Dual-Theme, Full-Width Fluid, Live Backend Integration (/api/v1/hod/requests)
 * 3 Review Actions (Approve Clearance, Hold for Interview, Reject)
 * Strictly No OTP per v4.0 Specification
 * Desktop Table & Mobile 390px Card List
 */

let currentRequests = [];
let activeDepartment = 'CS';
let activeStatusFilter = 'pending';
let activeTypeFilter = 'all';
let activeSelectedRequest = null;
let ws = null;

document.addEventListener('DOMContentLoaded', () => {
  initApprovals();
});

function getActiveDepartment() {
  const stored = localStorage.getItem('hod_active_dept');
  if (stored === 'CS' || stored === 'AIML' || stored === 'All') return stored;
  try {
    const userStr = localStorage.getItem('dc_user');
    if (userStr) {
      const u = JSON.parse(userStr);
      if (u.branch === 'CS' || (u.pin && u.pin.includes('CS'))) return 'CS';
      if (u.branch === 'AIML' || (u.pin && u.pin.includes('AIML'))) return 'AIML';
    }
  } catch (_) {}
  return 'CS';
}

function initApprovals() {
  activeDepartment = getActiveDepartment();
  bindDepartmentSwitcher();
  bindStatusTabs();
  bindTypeChips();
  bindSearchInput();
  bindModalActions();
  bindToolbarActions();
  initWebSocket();
  loadLiveRequests(activeDepartment);
}

function bindDepartmentSwitcher() {
  const csBtn = document.getElementById('deptCsBtn');
  const aimlBtn = document.getElementById('deptAimlBtn');
  const allBtn = document.getElementById('deptAllBtn');

  const updateSwitcherUI = () => {
    const activeClass = 'px-4 py-1.5 rounded-full text-xs font-bold font-code-mono uppercase tracking-wide transition-all bg-primary text-on-primary shadow-xs cursor-pointer';
    const inactiveClass = 'px-4 py-1.5 rounded-full text-xs font-bold font-code-mono uppercase tracking-wide transition-all text-on-surface-variant hover:text-on-surface cursor-pointer';
    const allActiveClass = 'px-3.5 py-1.5 rounded-full text-xs font-bold font-code-mono uppercase tracking-wide transition-all bg-primary text-on-primary shadow-xs cursor-pointer';
    const allInactiveClass = 'px-3.5 py-1.5 rounded-full text-xs font-bold font-code-mono uppercase tracking-wide transition-all text-on-surface-variant hover:text-on-surface cursor-pointer';

    if (csBtn) csBtn.className = activeDepartment === 'CS' ? activeClass : inactiveClass;
    if (aimlBtn) aimlBtn.className = activeDepartment === 'AIML' ? activeClass : inactiveClass;
    if (allBtn) allBtn.className = activeDepartment === 'All' ? allActiveClass : allInactiveClass;
  };

  csBtn?.addEventListener('click', () => {
    activeDepartment = 'CS';
    localStorage.setItem('hod_active_dept', 'CS');
    updateSwitcherUI();
    loadLiveRequests('CS');
    showToast('Viewing CS Department Approvals');
  });

  aimlBtn?.addEventListener('click', () => {
    activeDepartment = 'AIML';
    localStorage.setItem('hod_active_dept', 'AIML');
    updateSwitcherUI();
    loadLiveRequests('AIML');
    showToast('Viewing AIML Department Approvals');
  });

  allBtn?.addEventListener('click', () => {
    activeDepartment = 'All';
    localStorage.setItem('hod_active_dept', 'All');
    updateSwitcherUI();
    loadLiveRequests('All');
    showToast('Viewing All Department Approvals');
  });

  updateSwitcherUI();
}

async function loadLiveRequests(dept) {
  try {
    const res = await fetch(`/api/v1/hod/requests?branch=${encodeURIComponent(dept)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.requests)) {
        currentRequests = data.requests.map(r => ({
          id: r.id,
          student_pin: r.student_pin || r.pin,
          student_name: r.student_name || r.name || 'Student',
          request_type: r.request_type || r.type || 'Bonafide Certificate',
          purpose: r.reason || r.purpose || 'Academic Verification',
          urgency: r.urgency || 'NORMAL',
          status: (r.status || 'PENDING').toUpperCase(),
          attendance_snapshot: r.attendance_snapshot,
          pickup_otp: r.pickup_otp,
          hod_notes: r.hod_notes || '',
          submitted_at: r.submitted_at || 'Recently'
        }));
      }
    }
  } catch (err) {
    console.error('Failed to load requests:', err);
  }

  updateTelemetryKPIs();
  applyFiltersAndRender();
}

function updateTelemetryKPIs() {
  const pendingCount = currentRequests.filter(r => r.status === 'PENDING').length;
  const approvedCount = currentRequests.filter(r => r.status === 'ACCEPTED' || r.status === 'APPROVED').length;
  const declinedCount = currentRequests.filter(r => r.status === 'REJECTED' || r.status === 'HOLD').length;
  const totalCount = currentRequests.length;
  const decidedCount = approvedCount + declinedCount;

  const kpiPending = document.getElementById('kpiPendingCount');
  const kpiApproved = document.getElementById('kpiApprovedCount');
  const kpiDeclined = document.getElementById('kpiDeclinedCount');
  const kpiDeclinedBadge = document.getElementById('kpiDeclinedBadge');

  const badgePending = document.getElementById('badgePendingCount');
  const badgeDecided = document.getElementById('badgeDecidedCount');
  const badgeAll = document.getElementById('badgeAllCount');

  if (kpiPending) kpiPending.textContent = pendingCount;
  if (kpiApproved) kpiApproved.textContent = approvedCount;
  if (kpiDeclined) kpiDeclined.textContent = declinedCount;

  if (kpiDeclinedBadge) {
    kpiDeclinedBadge.textContent = declinedCount === 0 ? 'All Cleared' : `${declinedCount} On Hold / Rejected`;
  }

  if (badgePending) badgePending.textContent = `(${pendingCount})`;
  if (badgeDecided) badgeDecided.textContent = `(${decidedCount})`;
  if (badgeAll) badgeAll.textContent = `(${totalCount})`;
}

function bindStatusTabs() {
  const tabs = document.querySelectorAll('.status-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('bg-surface-container-high', 'text-on-surface', 'font-bold');
        t.classList.add('text-on-surface-variant', 'font-semibold');
      });
      tab.classList.add('bg-surface-container-high', 'text-on-surface', 'font-bold');
      tab.classList.remove('text-on-surface-variant', 'font-semibold');
      activeStatusFilter = tab.getAttribute('data-status') || 'pending';
      applyFiltersAndRender();
    });
  });
}

function bindTypeChips() {
  const chips = document.querySelectorAll('.type-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => {
        c.className = 'type-chip px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-code-mono-sm text-xs transition-colors cursor-pointer border border-hairline';
      });
      chip.className = 'type-chip px-3 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed font-code-mono-sm text-xs font-bold cursor-pointer';
      activeTypeFilter = chip.getAttribute('data-type') || 'all';
      applyFiltersAndRender();
    });
  });
}

function bindSearchInput() {
  const searchInput = document.getElementById('approvalsSearch');
  const clearBtn = document.getElementById('clearSearch');

  searchInput?.addEventListener('input', () => {
    if (clearBtn) {
      if (searchInput.value.trim().length > 0) {
        clearBtn.classList.remove('hidden');
      } else {
        clearBtn.classList.add('hidden');
      }
    }
    applyFiltersAndRender();
  });

  clearBtn?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    clearBtn.classList.add('hidden');
    applyFiltersAndRender();
  });
}

function applyFiltersAndRender() {
  const query = (document.getElementById('approvalsSearch')?.value || '').toLowerCase().trim();

  const filtered = currentRequests.filter(item => {
    // Status filter
    if (activeStatusFilter === 'pending' && item.status !== 'PENDING') return false;
    if (activeStatusFilter === 'decided' && item.status === 'PENDING') return false;

    // Document type filter
    if (activeTypeFilter !== 'all') {
      const typeLower = (item.request_type || '').toLowerCase();
      const filterLower = activeTypeFilter.toLowerCase();
      if (!typeLower.includes(filterLower)) return false;
    }

    // Search query
    if (query) {
      const idStr = String(item.id);
      const pinStr = (item.student_pin || '').toLowerCase();
      const nameStr = (item.student_name || '').toLowerCase();
      const typeStr = (item.request_type || '').toLowerCase();
      const purpStr = (item.purpose || '').toLowerCase();

      return pinStr.includes(query) ||
             nameStr.includes(query) ||
             typeStr.includes(query) ||
             purpStr.includes(query) ||
             idStr.includes(query);
    }

    return true;
  });

  renderDesktopTable(filtered);
  renderMobileCards(filtered);

  const visibleCountEl = document.getElementById('visibleRowCount');
  if (visibleCountEl) visibleCountEl.textContent = filtered.length;
}

function getAttendanceBadgeMarkup(attVal) {
  if (attVal === null || attVal === undefined || isNaN(Number(attVal))) {
    return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-code-mono text-xs border border-hairline">--% Unsynced</span>`;
  }
  const att = Number(attVal);
  if (att >= 75) {
    return `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-code-mono text-xs font-semibold border border-emerald-500/30"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>${att.toFixed(1)}% (Eligible)</span>`;
  } else if (att >= 65) {
    return `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-code-mono text-xs font-semibold border border-amber-500/30"><span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>${att.toFixed(1)}% (Condonation)</span>`;
  } else {
    return `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 font-code-mono text-xs font-semibold border border-rose-500/30"><span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>${att.toFixed(1)}% (Critical)</span>`;
  }
}

function formatSubmittedTime(timeStr) {
  if (!timeStr) return 'Recently';
  if (timeStr.includes('T')) {
    try {
      const d = new Date(timeStr);
      return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) + ', ' +
             d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } catch (_) {}
  }
  return timeStr;
}

function renderDesktopTable(list) {
  const tbody = document.getElementById('approvalsTableBody');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="py-12 text-center text-on-surface-variant">
          <span class="material-symbols-outlined text-4xl mb-2 text-outline">inbox</span>
          <div class="text-sm font-semibold">No requests in this queue view.</div>
          <div class="text-xs text-on-surface-variant/70 mt-1">Try switching to the "All" tab or clearing filters.</div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list.map(req => {
    const initials = req.student_name ? req.student_name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'ST';
    const reqIdFormatted = `#REQ-24259-${req.id}`;
    const timeFormatted = formatSubmittedTime(req.submitted_at);
    const attMarkup = getAttendanceBadgeMarkup(req.attendance_snapshot);

    let actionMarkup = '';
    if (req.status === 'ACCEPTED' || req.status === 'APPROVED') {
      const otp = req.pickup_otp || 'VERIFIED';
      actionMarkup = `
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container/20 text-primary-fixed font-code-mono-sm text-[11px] font-semibold border border-primary-container/30">
          <span class="material-symbols-outlined text-[14px]">check_circle</span>
          Approved · OTP: ${otp}
        </span>
      `;
    } else if (req.status === 'REJECTED') {
      actionMarkup = `
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-400 font-code-mono-sm text-[11px] font-semibold border border-rose-500/30">
          <span class="material-symbols-outlined text-[14px]">cancel</span>
          Declined
        </span>
      `;
    } else if (req.status === 'HOLD') {
      actionMarkup = `
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 font-code-mono-sm text-[11px] font-semibold border border-amber-500/30">
          <span class="material-symbols-outlined text-[14px]">pause_circle</span>
          Hold for Interview
        </span>
      `;
    } else {
      actionMarkup = `
        <button class="btn-review inline-flex items-center gap-1 px-3.5 py-1 rounded-full bg-primary-fixed hover:bg-surface-tint text-on-primary-fixed font-body-small text-xs font-bold transition-all shadow-xs cursor-pointer"
                data-id="${req.id}" type="button">
          <span>Review</span>
          <span class="material-symbols-outlined text-[15px]">arrow_forward</span>
        </button>
      `;
    }

    return `
      <tr class="h-14 hover:bg-surface-container-high/60 transition-colors group">
        <td class="py-2.5 px-4 font-code-mono text-primary-fixed font-bold">${reqIdFormatted}</td>
        <td class="py-2.5 px-4 font-code-mono text-on-surface-variant font-medium">${req.student_pin}</td>
        <td class="py-2.5 px-4">
          <div class="flex items-center gap-2">
            <span class="w-7 h-7 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-code-mono-sm text-[11px] font-bold shrink-0">
              ${initials}
            </span>
            <span class="font-medium text-on-surface font-sans text-xs truncate max-w-[140px]">${escapeHtml(req.student_name)}</span>
          </div>
        </td>
        <td class="py-2.5 px-4 font-medium text-on-surface text-xs">${escapeHtml(req.request_type)}</td>
        <td class="py-2.5 px-4 text-on-surface-variant max-w-[220px] truncate" title="${escapeHtml(req.purpose)}">
          ${escapeHtml(req.purpose)}
        </td>
        <td class="py-2.5 px-4">${attMarkup}</td>
        <td class="py-2.5 px-4 font-code-mono-sm text-on-surface-variant text-[11px]">${timeFormatted}</td>
        <td class="py-2.5 px-4 text-right">${actionMarkup}</td>
      </tr>
    `;
  }).join('');

  bindReviewButtons(tbody);
}

function renderMobileCards(list) {
  const container = document.getElementById('mobileApprovalsContainer');
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center bg-surface-container rounded-2xl border border-hairline text-on-surface-variant">
        <span class="material-symbols-outlined text-4xl mb-2 text-outline">inbox</span>
        <div class="text-sm font-semibold">No requests in this view</div>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(req => {
    const initials = req.student_name ? req.student_name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'ST';
    const reqIdFormatted = `#REQ-24259-${req.id}`;
    const timeFormatted = formatSubmittedTime(req.submitted_at);
    const attMarkup = getAttendanceBadgeMarkup(req.attendance_snapshot);

    let statusPill = '';
    if (req.status === 'ACCEPTED' || req.status === 'APPROVED') {
      statusPill = `
        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--color-lime)] text-[var(--color-lime-ink)] text-[10px] font-bold">
          <span class="material-symbols-outlined text-[13px]">check_circle</span> Approved
        </span>
      `;
    } else if (req.status === 'REJECTED') {
      statusPill = `
        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 font-code-mono-sm text-[10px] font-bold border border-rose-500/30">
          <span class="material-symbols-outlined text-[13px]">cancel</span> Declined
        </span>
      `;
    } else if (req.status === 'HOLD') {
      statusPill = `
        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-code-mono-sm text-[10px] font-bold border border-amber-500/30">
          <span class="material-symbols-outlined text-[13px]">pause_circle</span> Hold
        </span>
      `;
    } else {
      statusPill = `
        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary-fixed font-code-mono-sm text-[10px] font-bold border border-hairline">
          Pending Review
        </span>
      `;
    }

    return `
      <article class="bg-surface-container rounded-2xl p-4 border border-hairline shadow-xs flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <span class="font-code-mono text-xs font-bold text-primary-fixed">${reqIdFormatted}</span>
          <div class="flex items-center gap-1 text-on-surface-variant font-code-mono-sm text-[11px]">
            <span class="material-symbols-outlined text-[13px]">schedule</span>
            <span>${timeFormatted}</span>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-surface-container-high text-primary-fixed font-code-mono text-xs font-bold flex items-center justify-center shrink-0 border border-hairline">
            ${initials}
          </div>
          <div class="flex flex-col min-w-0">
            <span class="font-bold text-on-surface text-sm truncate">${escapeHtml(req.student_name)}</span>
            <span class="font-code-mono text-xs text-on-surface-variant">PIN: ${req.student_pin}</span>
          </div>
        </div>

        <div class="bg-surface-container-low p-3 rounded-xl flex flex-col gap-1.5 border border-hairline">
          <div class="flex items-center justify-between">
            <span class="font-bold text-on-surface text-xs">${escapeHtml(req.request_type)}</span>
            ${statusPill}
          </div>
          <p class="text-xs text-on-surface-variant leading-relaxed">
            ${escapeHtml(req.purpose)}
          </p>
        </div>

        <div class="flex items-center justify-between pt-1">
          <div class="flex items-center gap-1">
            <span class="text-[11px] text-on-surface-variant font-sans">Biometrics:</span>
            ${attMarkup}
          </div>
          ${req.status === 'PENDING' ? `
            <button class="btn-review px-4 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed font-title-card text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                    data-id="${req.id}" type="button">
              <span>Review</span>
              <span class="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>
          ` : ''}
        </div>
      </article>
    `;
  }).join('');

  bindReviewButtons(container);
}

function bindReviewButtons(parentEl) {
  parentEl.querySelectorAll('.btn-review').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'), 10);
      const req = currentRequests.find(r => r.id === id);
      if (req) {
        openReviewModal(req);
      }
    });
  });
}

function openReviewModal(req) {
  activeSelectedRequest = req;

  const modal = document.getElementById('reviewModal');
  const title = document.getElementById('modalStudentTitle');
  const pinEl = document.getElementById('modalStudentPin');
  const docTypeEl = document.getElementById('modalDocType');
  const attEl = document.getElementById('modalAttendanceBadge');
  const purpEl = document.getElementById('modalPurpose');
  const notesEl = document.getElementById('modalHodNotes');

  if (title) title.textContent = `Review: ${req.student_name}`;
  if (pinEl) pinEl.textContent = req.student_pin;
  if (docTypeEl) docTypeEl.textContent = req.request_type;
  if (purpEl) purpEl.textContent = req.purpose;
  if (notesEl) notesEl.value = req.hod_notes || '';

  if (attEl) {
    const att = Number(req.attendance_snapshot || 0);
    if (att >= 75) {
      attEl.className = 'px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-code-mono text-xs font-bold border border-emerald-500/30';
      attEl.textContent = `${att.toFixed(1)}% (Regular Eligible)`;
    } else if (att >= 65) {
      attEl.className = 'px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-code-mono text-xs font-bold border border-amber-500/30';
      attEl.textContent = `${att.toFixed(1)}% (Condonation Bracket)`;
    } else {
      attEl.className = 'px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 font-code-mono text-xs font-bold border border-rose-500/30';
      attEl.textContent = `${att.toFixed(1)}% (Critical Deficit)`;
    }
  }

  modal?.classList.remove('hidden');
  modal?.classList.add('flex');
}

function closeReviewModal() {
  const modal = document.getElementById('reviewModal');
  modal?.classList.add('hidden');
  modal?.classList.remove('flex');
  document.body.style.overflow = '';
  activeSelectedRequest = null;
}
window.closeReviewModal = closeReviewModal;

function bindModalActions() {
  const modal = document.getElementById('reviewModal');
  const closeBtn = document.getElementById('closeReviewModal');
  const cancelBtn = document.getElementById('btnCancelReviewModal');
  const approveBtn = document.getElementById('btnActionApprove');
  const holdBtn = document.getElementById('btnActionHold');
  const rejectBtn = document.getElementById('btnActionReject');

  closeBtn?.addEventListener('click', closeReviewModal);
  cancelBtn?.addEventListener('click', closeReviewModal);

  // Close when clicking modal backdrop outside the card
  modal?.addEventListener('click', (e) => {
    if (e.target === modal || !e.target.closest('#reviewModalCard')) {
      closeReviewModal();
    }
  });

  // Global Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal?.classList.contains('hidden')) {
      closeReviewModal();
    }
  });

  // Action 1: Approve & Generate Pickup OTP
  approveBtn?.addEventListener('click', async () => {
    if (!activeSelectedRequest) return;
    const notes = document.getElementById('modalHodNotes')?.value || 'Approved for collection at department counter.';
    await submitRequestStatusUpdate(activeSelectedRequest.id, 'ACCEPTED', notes);
  });

  // Action 2: Hold for Interview
  holdBtn?.addEventListener('click', async () => {
    if (!activeSelectedRequest) return;
    const notes = document.getElementById('modalHodNotes')?.value;
    if (!notes || notes.trim().length === 0) {
      showToast('Please enter an interview date or note in the remarks field');
      document.getElementById('modalHodNotes')?.focus();
      return;
    }
    await submitRequestStatusUpdate(activeSelectedRequest.id, 'HOLD', notes);
  });

  // Action 3: Reject with Reason
  rejectBtn?.addEventListener('click', async () => {
    if (!activeSelectedRequest) return;
    const notes = document.getElementById('modalHodNotes')?.value;
    if (!notes || notes.trim().length === 0) {
      showToast('Please provide a rejection reason in the remarks field');
      document.getElementById('modalHodNotes')?.focus();
      return;
    }
    await submitRequestStatusUpdate(activeSelectedRequest.id, 'REJECTED', notes);
  });
}

async function submitRequestStatusUpdate(requestId, status, notes) {
  try {
    const res = await fetch(`/api/v1/hod/requests/${requestId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, hod_notes: notes })
    });

    if (res.ok) {
      const data = await res.json();
      closeReviewModal();

      // Update local record
      const req = currentRequests.find(r => r.id === requestId);
      if (req) {
        req.status = status;
        req.hod_notes = notes;
        const otp = (data && data.pickup_otp) || (data && data.request && data.request.pickup_otp);
        if (otp) {
          req.pickup_otp = otp;
        }
      }

      updateTelemetryKPIs();
      applyFiltersAndRender();

      if (status === 'ACCEPTED') {
        showToast(`Approved Request #${requestId} · Clearance Signed`);
      } else if (status === 'HOLD') {
        showToast(`Request #${requestId} placed on Hold for Interview`);
      } else {
        showToast(`Request #${requestId} Denied`);
      }
    } else {
      showToast('Failed to update request status on server');
    }
  } catch (err) {
    console.error('Error updating request status:', err);
    showToast('Network error while updating request');
  }
}

function bindToolbarActions() {
  // Refresh button
  document.getElementById('btnRefresh')?.addEventListener('click', () => {
    loadLiveRequests(activeDepartment);
    showToast('Refreshed approval queue');
  });

  // Download summary CSV
  document.getElementById('btnDownloadSummary')?.addEventListener('click', () => {
    if (!currentRequests || currentRequests.length === 0) {
      showToast('No requests data to export');
      return;
    }

    const headers = ['Request ID', 'PIN', 'Student Name', 'Document Type', 'Stated Purpose', 'Guardian Phone', 'Attendance %', 'Status', 'HOD Notes', 'Submitted Time'];
    const rows = currentRequests.map(r => [
      `"#REQ-24259-${r.id}"`,
      `"${r.student_pin}"`,
      `"${(r.student_name || '').replace(/"/g, '""')}"`,
      `"${r.request_type}"`,
      `"${(r.purpose || r.reason || '').replace(/"/g, '""')}"`,
      `"${r.guardian_phone || ''}"`,
      `"${r.attendance_snapshot !== null ? Number(r.attendance_snapshot).toFixed(1) + '%' : 'Unsynced'}"`,
      `"${r.status}"`,
      `"${(r.hod_notes || '').replace(/"/g, '""')}"`,
      `"${r.submitted_at}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Samskruti_Document_Approvals_${activeDepartment}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${currentRequests.length} requests summary to CSV`);
  });

  // Download summary PDF
  document.getElementById('btnDownloadPdf')?.addEventListener('click', () => {
    if (!currentRequests || currentRequests.length === 0) {
      showToast('No requests data to export');
      return;
    }

    const printWin = window.open('', '_blank', 'width=900,height=900');
    if (!printWin) {
      window.print();
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Samskruti College - ${activeDepartment} Document Approvals Log</title>
        <style>
          body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; padding: 30px; color: #111; }
          h2 { margin: 0; text-transform: uppercase; font-size: 18px; }
          .sub { color: #555; font-size: 12px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
          th { background: #f3f4f6; font-weight: bold; }
          .center { text-align: center; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <h2>Samskruti College of Engineering & Technology (Code: 259)</h2>
        <div class="sub">HOD Document Approvals Log · ${activeDepartment} Department · Date: ${new Date().toLocaleDateString('en-IN')}</div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>PIN</th>
              <th>Student Name</th>
              <th>Document Type</th>
              <th>Guardian Phone</th>
              <th>Attendance</th>
              <th class="center">Status</th>
              <th>HOD Notes</th>
            </tr>
          </thead>
          <tbody>
            ${currentRequests.map(r => `
              <tr>
                <td>#REQ-${r.id}</td>
                <td>${r.student_pin}</td>
                <td>${r.student_name || ''}</td>
                <td>${r.request_type}</td>
                <td>${r.guardian_phone || '—'}</td>
                <td>${r.attendance_snapshot !== null ? Number(r.attendance_snapshot).toFixed(1) + '%' : '—'}</td>
                <td class="center"><strong>${r.status}</strong></td>
                <td>${r.hod_notes || '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <script>window.onload = function() { window.print(); };</script>
      </body>
      </html>
    `;
    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
    showToast(`Generating ${activeDepartment} Document Approvals PDF...`);
  });
}

function initWebSocket() {
  try {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?pin=HOD&name=HOD`;
    ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'NEW_DIGITAL_REQUEST' || data.type === 'REQUEST_STATUS_UPDATED') {
          loadLiveRequests(activeDepartment);
        }
      } catch (_) {}
    };

    ws.onerror = () => {};
    ws.onclose = () => {
      setTimeout(initWebSocket, 5000);
    };
  } catch (_) {}
}

function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMessage');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.remove('translate-y-20', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
    toast.classList.remove('translate-y-0', 'opacity-100');
  }, 2600);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
