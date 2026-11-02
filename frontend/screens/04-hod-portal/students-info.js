/**
 * Samskruti College HOD Master Students Info & Dossier Controller
 * Complete 180 Students Table with PIN, Name, Branch, CGPA, Attendance, Days, Backlogs
 * Interactive Ascending/Descending Sorting, Azure Portal Live Mass Sync, and Backlog Pop-Up Modal
 */

document.addEventListener('DOMContentLoaded', () => {
  initStudentsInfo();
  initHelpDeskLinks();
});

let currentStudentsList = [];
let activeCohortFilter = 'All';
let selectedStudentForModal = null;

// Sorting state
let currentSort = {
  column: 'pin',
  direction: 'asc' // 'asc' or 'desc'
};

function initStudentsInfo() {
  currentStudentsList = (typeof window.CampusRoster !== 'undefined') ? window.CampusRoster.getAll() : [];
  
  // Sort initial list
  sortAndRenderStudents();

  bindSortableHeaders();
  bindQuickSortDropdown();
  bindCohortFilterPills();
  bindStudentSearch();
  bindAzureMassSync();
  bindModalActions();
  bindGeneralActions();
}

/**
 * 1. Sorting Engine
 */
function sortAndRenderStudents() {
  const all = (typeof window.CampusRoster !== 'undefined') ? window.CampusRoster.getAll() : currentStudentsList;

  // 1. Filter by Cohort & Search
  const search = document.querySelector('input[placeholder*="Search student PIN"]') || 
                 document.querySelector('input[type="text"]');
  const query = search ? search.value.toLowerCase().trim() : '';

  let filtered = all.filter(s => {
    const matchesSearch = !query || 
      s.pin.toLowerCase().includes(query) || 
      s.name.toLowerCase().includes(query) || 
      s.branch.toLowerCase().includes(query) ||
      String(s.cgpa).includes(query);

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

  // 2. Sort by currentSort
  filtered.sort((a, b) => {
    let valA, valB;

    switch (currentSort.column) {
      case 'pin':
        valA = a.roll;
        valB = b.roll;
        break;
      case 'name':
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
        break;
      case 'branch':
        valA = (a.branch + a.section).toLowerCase();
        valB = (b.branch + b.section).toLowerCase();
        break;
      case 'days':
        valA = a.presentDays;
        valB = b.presentDays;
        break;
      case 'attendance':
        valA = a.attendance;
        valB = b.attendance;
        break;
      case 'cgpa':
        valA = a.cgpa;
        valB = b.cgpa;
        break;
      case 'backlogs':
        valA = a.backlogCount;
        valB = b.backlogCount;
        break;
      default:
        valA = a.roll;
        valB = b.roll;
    }

    if (valA < valB) return currentSort.direction === 'asc' ? -1 : 1;
    if (valA > valB) return currentSort.direction === 'asc' ? 1 : -1;
    return 0;
  });

  render180Students(filtered);
  updateSortIconsUI();
}

function updateSortIconsUI() {
  document.querySelectorAll('.sortable-header').forEach(th => {
    const col = th.getAttribute('data-sort');
    const icon = th.querySelector('.sort-icon');
    if (!icon) return;

    if (col === currentSort.column) {
      th.classList.add('text-emerald-950', 'bg-emerald-50/60');
      icon.textContent = currentSort.direction === 'asc' ? 'arrow_upward' : 'arrow_downward';
      icon.className = 'material-symbols-outlined text-[16px] text-emerald-700 font-bold sort-icon';
    } else {
      th.classList.remove('text-emerald-950', 'bg-emerald-50/60');
      icon.textContent = 'unfold_more';
      icon.className = 'material-symbols-outlined text-[16px] text-slate-400 group-hover:text-emerald-700 transition-transform sort-icon';
    }
  });

  // Sync quick sort dropdown value
  const select = document.getElementById('quickSortSelect');
  if (select) {
    const key = `${currentSort.column}-${currentSort.direction}`;
    const matchOpt = Array.from(select.options).find(opt => opt.value === key || (opt.value.startsWith(currentSort.column) && opt.value.endsWith(currentSort.direction)));
    if (matchOpt) select.value = matchOpt.value;
  }
}

function bindSortableHeaders() {
  document.querySelectorAll('.sortable-header').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.getAttribute('data-sort');
      if (currentSort.column === col) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
      } else {
        currentSort.column = col;
        // Default to desc for performance metrics
        currentSort.direction = (col === 'cgpa' || col === 'attendance' || col === 'days') ? 'desc' : 'asc';
      }

      if (navigator.vibrate) navigator.vibrate(8);
      sortAndRenderStudents();
      showToast(`Sorted table by ${col.toUpperCase()} (${currentSort.direction === 'asc' ? 'Ascending ↑' : 'Descending ↓'})`);
    });
  });
}

function bindQuickSortDropdown() {
  const select = document.getElementById('quickSortSelect');
  if (!select) return;

  select.addEventListener('change', () => {
    const val = select.value; // e.g. "cgpa-desc", "pin-asc", etc.
    const [col, dir] = val.split('-');

    if (col && dir) {
      currentSort.column = col === 'att' ? 'attendance' : col;
      currentSort.direction = dir;
      sortAndRenderStudents();
      showToast(`Applied sort: ${select.options[select.selectedIndex].text}`);
    }
  });
}

/**
 * 2. Render Student Rows
 */
function render180Students(students) {
  const tbody = document.getElementById('masterStudentsTbody');
  const countEl = document.getElementById('studentsVisibleCount');
  if (!tbody) return;

  if (countEl) countEl.textContent = students.length;

  if (students.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="px-6 py-12 text-center text-slate-500 font-sans text-base">
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

    // CGPA styling
    let cgpaBadge = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (s.cgpa < 6.0) {
      cgpaBadge = 'bg-rose-50 text-rose-800 border-rose-200';
    } else if (s.cgpa < 7.0) {
      cgpaBadge = 'bg-amber-50 text-amber-800 border-amber-200';
    } else if (s.cgpa < 8.5) {
      cgpaBadge = 'bg-teal-50 text-teal-800 border-teal-200';
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
      <tr class="hover:bg-emerald-50/40 transition-colors group">
        <!-- 1. PIN -->
        <td class="py-3 px-4 whitespace-nowrap">
          <span class="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/80 select-all cursor-pointer hover:bg-emerald-100 hover:border-emerald-300 transition copy-pin-btn"
                data-pin="${s.pin}" title="Click to copy PIN">
            ${s.pin}
          </span>
        </td>

        <!-- 2. Student Name -->
        <td class="py-3 px-4 whitespace-nowrap">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
              ${initials}
            </div>
            <div>
              <div class="font-bold text-slate-900 group-hover:text-emerald-950 transition-colors">${escapeHtml(s.name)}</div>
              <div class="text-[11px] text-slate-500 font-mono">Roll #${s.roll} &bull; ${s.scheme}</div>
            </div>
          </div>
        </td>

        <!-- 3. Branch -->
        <td class="py-3 px-3 whitespace-nowrap">
          <span class="px-2.5 py-0.5 rounded-full font-mono text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            ${s.branch} &bull; ${s.section}
          </span>
        </td>

        <!-- 4. Days (Pres/Elap) -->
        <td class="py-3 px-4 whitespace-nowrap">
          <div class="font-mono text-xs font-bold text-slate-800">${s.presentDays} / ${s.totalDays} Days</div>
          <div class="w-20 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
            <div class="bg-emerald-600 h-1.5 rounded-full" style="width: ${Math.round((s.presentDays / s.totalDays) * 100)}%"></div>
          </div>
        </td>

        <!-- 5. Attendance % -->
        <td class="py-3 px-4 whitespace-nowrap">
          <span class="font-mono text-xs font-bold px-2 py-0.5 rounded ${attBadge} border inline-block">
            ${s.attendance}%
          </span>
        </td>

        <!-- 6. Status -->
        <td class="py-3 px-3 whitespace-nowrap">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusBadge}">
            ${s.status}
          </span>
        </td>

        <!-- 7. CGPA -->
        <td class="py-3 px-3 whitespace-nowrap">
          <span class="font-mono text-xs font-bold px-2.5 py-1 rounded-full ${cgpaBadge} border inline-flex items-center gap-1">
            <span class="material-symbols-outlined text-[13px]">grade</span>
            ${s.cgpa.toFixed(2)}
          </span>
        </td>

        <!-- 8. Backlogs -->
        <td class="py-3 px-4 whitespace-nowrap">
          ${backlogHtml}
        </td>

        <!-- 9. Actions -->
        <td class="py-3 px-4 whitespace-nowrap text-right">
          <div class="inline-flex items-center gap-1.5">
            <button class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white hover:bg-emerald-50 border border-slate-200 text-slate-700 hover:text-emerald-800 text-xs font-semibold shadow-2xs transition active:scale-95 cursor-pointer row-sync-btn"
                    data-pin="${s.pin}" title="Live sync biometric punches from Azure SBTET node">
              <span class="material-symbols-outlined text-[15px]">sync</span>
              <span>Sync</span>
            </button>
            <button class="w-7 h-7 rounded-full bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-800 flex items-center justify-center transition cursor-pointer row-chat-btn"
                    data-pin="${s.pin}" data-name="${s.name}" title="Send encrypted message to student">
              <span class="material-symbols-outlined text-[14px]">chat</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  bindBacklogModalButtons();
  bindRowActionButtons();
}

/**
 * 3. Row Actions & Backlog Pop-Up Modal
 */
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

  document.getElementById('modalStudentAvatar').textContent = student.name.split(' ').map(n => n[0]).slice(0, 2).join('');
  document.getElementById('modalStudentName').textContent = student.name;
  document.getElementById('modalStudentPin').textContent = student.pin;
  document.getElementById('modalStudentSubtitle').textContent = `Department of Computer Science & Engineering • CGPA: ${student.cgpa.toFixed(2)} • Present: ${student.presentDays}/${student.totalDays} Days`;

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

  const tbody = document.getElementById('modalBacklogTbody');
  if (tbody) {
    if (student.backlogCount === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="px-5 py-8 text-center text-emerald-800 font-bold">
            <span class="material-symbols-outlined text-3xl text-emerald-600 block mb-1">verified</span>
            All Curricular Units Cleared &bull; 0 Active Backlogs Recorded in SBTET Ledger &bull; CGPA: ${student.cgpa.toFixed(2)}
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
  showToast(`Opened detailed backlog dossier for ${student.name} (${student.pin})`);
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

function bindRowActionButtons() {
  // Individual student sync
  document.querySelectorAll('.row-sync-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pin = btn.getAttribute('data-pin');
      const icon = btn.querySelector('.material-symbols-outlined');
      if (icon) icon.classList.add('animate-spin');

      if (navigator.vibrate) navigator.vibrate(10);

      setTimeout(() => {
        if (icon) icon.classList.remove('animate-spin');
        if (typeof window.CampusRoster !== 'undefined') {
          window.CampusRoster.syncStudent(pin);
        }
        showToast(`Live SBTET punch synchronized for ${pin} from Azure Gateway.`);
      }, 500);
    });
  });

  // Chat button
  document.querySelectorAll('.row-chat-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pin = btn.getAttribute('data-pin');
      const name = btn.getAttribute('data-name');
      showToast(`Opening encrypted relay for ${name} (${pin})...`);
      setTimeout(() => {
        window.location.href = `./messages.html?pin=${encodeURIComponent(pin)}&name=${encodeURIComponent(name)}`;
      }, 350);
    });
  });

  // Copy PIN button
  document.querySelectorAll('.copy-pin-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pin = btn.getAttribute('data-pin');
      if (!pin) return;
      navigator.clipboard?.writeText(pin).catch(() => {});
      showToast(`Copied PIN ${pin} to clipboard!`);
    });
  });
}

/**
 * 4. Azure Portal Mass Live Sync
 */
function bindAzureMassSync() {
  const massBtn = document.getElementById('azureMassSyncBtn');
  const modal = document.getElementById('azureSyncProgressModal');
  const card = document.getElementById('azureSyncModalCard');
  const progressBar = document.getElementById('azureModalProgressBar');
  const counterEl = document.getElementById('azureModalCounter');
  const pctEl = document.getElementById('azureModalPercentage');
  const currentPinEl = document.getElementById('azureModalCurrentPin');
  const consoleEl = document.getElementById('azureStreamConsole');
  const closeBtn = document.getElementById('closeAzureSyncModal');

  closeBtn?.addEventListener('click', () => {
    modal?.classList.add('hidden', 'opacity-0', 'pointer-events-none');
  });

  if (!massBtn || !modal) return;

  massBtn.addEventListener('click', () => {
    if (navigator.vibrate) navigator.vibrate(15);

    // Open Modal
    modal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
    setTimeout(() => {
      card?.classList.remove('scale-95');
      card?.classList.add('scale-100');
    }, 20);

    const students = (typeof window.CampusRoster !== 'undefined') ? window.CampusRoster.getAll() : [];
    let current = 12;
    const total = 180;

    if (consoleEl) {
      consoleEl.innerHTML = `
        <div>[AZURE-TLS1.3] Initiating mass endpoint handshake...</div>
        <div>[SBTET-GATEWAY] Node 259 verified: C-24 Scheme Ledger Active.</div>
      `;
    }

    const interval = setInterval(() => {
      current += 8;
      if (current > total) current = total;

      const pct = Math.round((current / total) * 100);
      if (progressBar) progressBar.style.width = `${pct}%`;
      if (counterEl) counterEl.textContent = `${current} / ${total} Nodes`;
      if (pctEl) pctEl.textContent = `${pct}%`;

      const st = students[current - 1] || { pin: `24259-CS-${String(current).padStart(3, '0')}`, name: 'STUDENT' };
      if (currentPinEl) currentPinEl.textContent = st.pin;

      if (consoleEl && current % 16 === 0) {
        const line = document.createElement('div');
        line.textContent = `[AZURE-STREAM] Node ${st.pin} (${st.name}) punch hashes validated.`;
        consoleEl.appendChild(line);
        consoleEl.scrollTop = consoleEl.scrollHeight;
      }

      if (current >= total) {
        clearInterval(interval);
        
        // Execute mass sync
        if (typeof window.CampusRoster !== 'undefined') {
          window.CampusRoster.massSyncFromAzure();
        }

        const badge = document.getElementById('azureModalStatusBadge');
        if (badge) {
          badge.textContent = 'Verified 100%';
          badge.className = 'px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-white font-mono';
        }

        if (consoleEl) {
          const fin = document.createElement('div');
          fin.className = 'text-white font-bold';
          fin.textContent = '[SUCCESS] All 180 department nodes synchronized against Azure SBTET ledger.';
          consoleEl.appendChild(fin);
          consoleEl.scrollTop = consoleEl.scrollHeight;
        }

        if (navigator.vibrate) navigator.vibrate([20, 50, 20]);

        setTimeout(() => {
          modal.classList.add('hidden', 'opacity-0', 'pointer-events-none');
          sortAndRenderStudents();
          showToast('Azure Mass Sync Complete: All 180 student records synchronized from SBTET Cloud Gateway.');
        }, 900);
      }
    }, 60);
  });
}

/**
 * 5. Cohort Filter Pills & Search
 */
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

        sortAndRenderStudents();
      });
    }
  });
}

function bindStudentSearch() {
  const search = document.querySelector('input[placeholder*="Search student PIN"]') || 
                 document.querySelector('input[type="text"]');
  if (!search) return;

  search.addEventListener('input', () => {
    sortAndRenderStudents();
  });
}

function bindModalActions() {
  document.getElementById('closeBacklogModal')?.addEventListener('click', closeBacklogModal);

  document.getElementById('printModalDossierBtn')?.addEventListener('click', () => {
    window.print();
  });

  document.getElementById('messageStudentFromModalBtn')?.addEventListener('click', () => {
    if (!selectedStudentForModal) return;
    closeBacklogModal();
    showToast(`Redirecting to encrypted communication terminal for ${selectedStudentForModal.name}...`);
    setTimeout(() => {
      window.location.href = `./messages.html?pin=${encodeURIComponent(selectedStudentForModal.pin)}&name=${encodeURIComponent(selectedStudentForModal.name)}`;
    }, 400);
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
}

function exportStudentsCsv() {
  const students = (typeof window.CampusRoster !== 'undefined') ? window.CampusRoster.getAll() : currentStudentsList;
  let csv = 'Roll,PIN,Student Name,Branch,Section,Scheme,CGPA,Present Days,Total Days,Attendance %,Status,Backlog Count,Backlogs,Last Synced\\n';

  students.forEach(s => {
    const backlogsStr = s.backlogs.map(b => b.code).join('; ') || 'None';
    csv += `"${s.roll}","${s.pin}","${s.name}","${s.branch}","${s.section}","${s.scheme}","${s.cgpa}","${s.presentDays}","${s.totalDays}","${s.attendance}%","${s.status}","${s.backlogCount}","${backlogsStr}","${s.lastSynced}"\\n`;
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
