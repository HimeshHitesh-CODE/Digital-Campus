/**
 * Samskruti College HOD Master Students Info & Dossier Controller
 * Continuous Scroll for 180 Students, Real-Time Cohort Filters, Interactive Backlog Pop-Up Modal
 */

document.addEventListener('DOMContentLoaded', () => {
  initStudentsInfo();
  initHelpDeskLinks();
});

let currentStudentsList = [];
let activeCohortFilter = 'All';
let selectedStudentForModal = null;

function initStudentsInfo() {
  currentStudentsList = (typeof window.CampusRoster !== 'undefined') ? window.CampusRoster.getAll() : [];
  render180Students(currentStudentsList);
  bindCohortFilterPills();
  bindStudentSearch();
  bindModalActions();
  bindGeneralActions();
}

function render180Students(students) {
  const tbody = document.getElementById('masterStudentsTbody');
  const countEl = document.getElementById('studentsVisibleCount');
  if (!tbody) return;

  if (countEl) countEl.textContent = students.length;

  if (students.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="px-6 py-12 text-center text-slate-500 font-sans text-base">
          <span class="material-symbols-outlined text-4xl text-slate-400 block mb-2">search_off</span>
          No students found matching your cohort or search criteria.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = students.map((s) => {
    // Attendance styling
    let attBadge = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    let statusBadge = 'bg-emerald-100 text-emerald-800 border-emerald-200';

    if (s.attendance < 65) {
      attBadge = 'text-rose-700 bg-rose-50 border-rose-200';
      statusBadge = 'bg-rose-100 text-rose-800 border-rose-200';
    } else if (s.attendance < 75) {
      attBadge = 'text-amber-700 bg-amber-50 border-amber-200';
      statusBadge = 'bg-amber-100 text-amber-800 border-amber-200';
    }

    // Backlog pill
    let backlogHtml = '';
    if (s.backlogCount > 0) {
      backlogHtml = `
        <button class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold border border-rose-300 shadow-2xs transition-all active:scale-95 cursor-pointer open-backlog-modal-btn"
                data-pin="${s.pin}" title="Click to view comprehensive backlog breakdown">
          <span>${s.backlogCount} Backlog${s.backlogCount > 1 ? 's' : ''}</span>
          <span class="material-symbols-outlined text-[15px]">arrow_outward</span>
        </button>
      `;
    } else {
      backlogHtml = `
        <button class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition cursor-pointer open-backlog-modal-btn"
                data-pin="${s.pin}" title="View clean academic record">
          <span>0 Backlogs</span>
          <span class="material-symbols-outlined text-[14px]">check</span>
        </button>
      `;
    }

    const initials = s.name.split(' ').map(n => n[0]).slice(0, 2).join('');

    return `
      <tr class="hover:bg-emerald-50/30 transition-colors group">
        <td class="px-5 py-3.5 whitespace-nowrap">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
              ${initials}
            </div>
            <div>
              <div class="font-bold text-slate-900 group-hover:text-emerald-950 transition-colors">${escapeHtml(s.name)}</div>
              <div class="font-mono text-xs text-slate-500">${s.pin} &bull; ${s.section}</div>
            </div>
          </div>
        </td>
        <td class="px-4 py-3.5 whitespace-nowrap">
          <span class="font-mono text-xs font-bold px-2 py-0.5 rounded ${attBadge} border">
            ${s.attendance}%
          </span>
        </td>
        <td class="px-4 py-3.5 whitespace-nowrap">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusBadge}">
            ${s.status}
          </span>
        </td>
        <td class="px-4 py-3.5 whitespace-nowrap">
          ${backlogHtml}
        </td>
        <td class="px-4 py-3.5 whitespace-nowrap font-mono text-xs text-slate-500">
          ${s.lastSynced}
        </td>
        <td class="px-4 py-3.5 whitespace-nowrap text-right">
          <button class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition active:scale-95 cursor-pointer student-sync-btn"
                  data-pin="${s.pin}">
            <span class="material-symbols-outlined text-[15px]">sync</span>
            <span>Sync</span>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  bindBacklogModalButtons();
  bindRowSyncButtons();
}

function bindBacklogModalButtons() {
  document.querySelectorAll('.open-backlog-modal-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pin = btn.getAttribute('data-pin');
      openBacklogModal(pin);
    });
  });
}

function openBacklogModal(pin) {
  const student = (typeof window.CampusRoster !== 'undefined') ? 
                  window.CampusRoster.getByPin(pin) : 
                  currentStudentsList.find(s => s.pin === pin);

  if (!student) return;
  selectedStudentForModal = student;

  const modal = document.getElementById('backlogPopupModal');
  const card = document.getElementById('backlogModalCard');
  if (!modal) return;

  // Populate Header
  document.getElementById('modalStudentAvatar').textContent = student.name.split(' ').map(n => n[0]).slice(0, 2).join('');
  document.getElementById('modalStudentName').textContent = student.name;
  document.getElementById('modalStudentPin').textContent = student.pin;
  document.getElementById('modalStudentSubtitle').textContent = `Department of Computer Science & Engineering • Section ${student.section} • Scheme C-24`;

  // Populate Summary
  const countEl = document.getElementById('modalBacklogCount');
  const attEl = document.getElementById('modalAttendanceVal');
  const eligEl = document.getElementById('modalExamEligibility');

  if (countEl) countEl.textContent = student.backlogCount === 0 ? '0 Backlogs (Clear)' : `${student.backlogCount} Subject${student.backlogCount > 1 ? 's' : ''}`;
  if (attEl) attEl.textContent = `${student.attendance}%`;
  if (eligEl) {
    if (student.attendance < 65) {
      eligEl.textContent = 'Detained (Statutory Deficit)';
      eligEl.className = 'text-sm font-extrabold text-rose-700 mt-1 block';
    } else if (student.backlogCount > 0) {
      eligEl.textContent = 'Supply Eligible (Fee Pending)';
      eligEl.className = 'text-sm font-extrabold text-amber-700 mt-1 block';
    } else {
      eligEl.textContent = 'Regular Exam Eligible';
      eligEl.className = 'text-sm font-extrabold text-emerald-800 mt-1 block';
    }
  }

  // Populate Table
  const tbody = document.getElementById('modalBacklogTbody');
  if (tbody) {
    if (student.backlogCount === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="px-5 py-8 text-center text-emerald-800 font-bold">
            <span class="material-symbols-outlined text-3xl text-emerald-600 block mb-1">verified</span>
            All Curricular Units Cleared &bull; 0 Active Backlogs Recorded in SBTET Ledger.
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = student.backlogs.map(b => `
        <tr class="hover:bg-rose-50/40 transition">
          <td class="px-4 py-3 font-semibold text-stone-900">
            <div class="font-mono text-rose-700 font-bold">${b.code}</div>
            <div class="text-xs text-stone-700 font-medium">${b.name}</div>
          </td>
          <td class="px-3 py-3 font-mono font-bold text-rose-700">
            ${b.internal}
          </td>
          <td class="px-3 py-3 font-mono text-stone-700">
            ${b.external}
          </td>
          <td class="px-3 py-3 font-mono text-stone-500">
            ${b.minPass}
          </td>
          <td class="px-4 py-3 text-stone-600">
            <span class="inline-flex items-center gap-1 font-mono text-[11px] bg-stone-100 px-2 py-0.5 rounded">
              <span class="material-symbols-outlined text-[13px]">school</span>
              ${b.remedialLab}
            </span>
          </td>
        </tr>
      `).join('');
    }
  }

  modal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
  setTimeout(() => {
    card?.classList.remove('scale-95');
    card?.classList.add('scale-100');
  }, 20);

  if (navigator.vibrate) navigator.vibrate(10);
  showToast(`Opened detailed backlog record for ${student.name} (${student.pin})`);
}

function closeBacklogModal() {
  const modal = document.getElementById('backlogPopupModal');
  const card = document.getElementById('backlogModalCard');
  if (!modal) return;

  card?.classList.remove('scale-100');
  card?.classList.add('scale-95');
  modal.classList.add('opacity-0', 'pointer-events-none');
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 200);
}

function bindModalActions() {
  document.getElementById('closeBacklogModal')?.addEventListener('click', closeBacklogModal);

  // Print Dossier PDF
  document.getElementById('printModalDossierBtn')?.addEventListener('click', () => {
    window.print();
  });

  // Dispatch Directive (Message Student)
  document.getElementById('messageStudentFromModalBtn')?.addEventListener('click', () => {
    if (!selectedStudentForModal) return;
    closeBacklogModal();
    showToast(`Redirecting to encrypted communication terminal for ${selectedStudentForModal.name}...`);
    setTimeout(() => {
      window.location.href = `./messages.html?pin=${encodeURIComponent(selectedStudentForModal.pin)}&name=${encodeURIComponent(selectedStudentForModal.name)}`;
    }, 400);
  });
}

function bindCohortFilterPills() {
  document.querySelectorAll('button').forEach(btn => {
    const txt = btn.textContent || '';
    if (txt.includes('All (180)') || txt.includes('Critical (<65%)') || txt.includes('Warning') || txt.includes('Eligible') || txt.includes('With Backlogs')) {
      btn.addEventListener('click', () => {
        document.querySelectorAll('button').forEach(b => {
          if (b.textContent.includes('All (180)') || b.textContent.includes('Critical') || b.textContent.includes('Warning') || b.textContent.includes('Eligible') || b.textContent.includes('With Backlogs')) {
            b.classList.remove('bg-emerald-800', 'text-white', 'shadow-xs');
            b.classList.add('bg-white', 'text-stone-700');
          }
        });
        btn.classList.add('bg-emerald-800', 'text-white', 'shadow-xs');
        btn.classList.remove('bg-white', 'text-stone-700');

        if (txt.includes('Critical')) activeCohortFilter = 'Critical';
        else if (txt.includes('Warning')) activeCohortFilter = 'Warning';
        else if (txt.includes('Eligible')) activeCohortFilter = 'Eligible';
        else if (txt.includes('With Backlogs')) activeCohortFilter = 'Backlogs';
        else activeCohortFilter = 'All';

        filterStudents();
      });
    }
  });
}

function bindStudentSearch() {
  const search = document.querySelector('input[placeholder*="Search student PIN"]') || 
                 document.querySelector('input[type="text"]');
  if (!search) return;

  search.addEventListener('input', () => {
    filterStudents();
  });
}

function filterStudents() {
  const search = document.querySelector('input[placeholder*="Search student PIN"]') || 
                 document.querySelector('input[type="text"]');
  const query = search ? search.value.toLowerCase().trim() : '';

  const all = (typeof window.CampusRoster !== 'undefined') ? window.CampusRoster.getAll() : currentStudentsList;

  const filtered = all.filter(s => {
    const matchesSearch = !query || s.pin.toLowerCase().includes(query) || s.name.toLowerCase().includes(query);
    let matchesCohort = true;

    if (activeCohortFilter === 'Critical') {
      matchesCohort = s.attendance < 65;
    } else if (activeCohortFilter === 'Warning') {
      matchesCohort = s.attendance >= 65 && s.attendance < 75;
    } else if (activeCohortFilter === 'Eligible') {
      matchesCohort = s.attendance >= 75;
    } else if (activeCohortFilter === 'Backlogs') {
      matchesCohort = s.backlogCount > 0;
    }

    return matchesSearch && matchesCohort;
  });

  render180Students(filtered);
}

function bindRowSyncButtons() {
  document.querySelectorAll('.student-sync-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pin = btn.getAttribute('data-pin');
      const icon = btn.querySelector('.material-symbols-outlined');
      if (icon) icon.classList.add('animate-spin');

      if (navigator.vibrate) navigator.vibrate(10);

      setTimeout(() => {
        if (icon) icon.classList.remove('animate-spin');
        showToast(`Live SBTET biometric punch synchronized for ${pin}.`);
      }, 500);
    });
  });
}

function bindGeneralActions() {
  // Scroll to Top
  document.getElementById('scrollToTopStudentsBtn')?.addEventListener('click', () => {
    const container = document.getElementById('studentsScrollContainer');
    if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Export CSV
  document.getElementById('exportStudentsCsvBtn')?.addEventListener('click', () => {
    exportStudentsCsv();
  });

  // Live Sync on top
  document.querySelectorAll('button').forEach(btn => {
    const txt = btn.textContent || '';
    if (txt.includes('Live Sync') || txt.includes('Sync All')) {
      btn.addEventListener('click', () => {
        const icon = btn.querySelector('.material-symbols-outlined');
        if (icon) icon.classList.add('animate-spin');
        setTimeout(() => {
          if (icon) icon.classList.remove('animate-spin');
          showToast('Live biometric synchronization complete for all 180 department nodes.');
        }, 800);
      });
    } else if (txt.includes('Export CSV') || txt.includes('CSV')) {
      btn.addEventListener('click', () => {
        exportStudentsCsv();
      });
    } else if (txt.includes('Export PDF') || txt.includes('PDF')) {
      btn.addEventListener('click', () => {
        window.print();
      });
    }
  });
}

function exportStudentsCsv() {
  const students = (typeof window.CampusRoster !== 'undefined') ? window.CampusRoster.getAll() : currentStudentsList;
  let csv = 'Roll,PIN,Student Name,Section,Scheme,Attendance %,Status,Backlog Count,Backlog Subjects,Last Synced\\n';

  students.forEach(s => {
    const backlogsStr = s.backlogs.map(b => b.code).join('; ') || 'None';
    csv += `"${s.roll}","${s.pin}","${s.name}","${s.section}","${s.scheme}","${s.attendance}%","${s.status}","${s.backlogCount}","${backlogsStr}","${s.lastSynced}"\\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Samskruti_CS_180_Students_Master_Dossier_C24.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('SBTET Scheme C-24 180-Student Master Dossier CSV downloaded.');
}

function escapeHtml(str) {
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

  clearTimeout(window._stToastTimeout);
  window._stToastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}
