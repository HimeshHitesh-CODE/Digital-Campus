/**
 * Samskruti Digital Campus • Multi-Department HOD Master Students Info & Synchronization Controller
 * Executive Glass-Neumorphic standard with dynamic active percentage calculations,
 * distinct student roster hydration (CS: 180 Students, AIML: 120 Students),
 * dual PDF export engines with branch-specific HOD credentials, and real-time SSE progress streaming.
 */

import { api } from '../../js/api.js';
import { requireAuth } from '../../js/auth-guard.js';
import { renderDock } from '../../js/dock.js';
import { alerts } from '../../js/alerts.js';

// Verify HOD / Faculty Authentication & Render Dock
const currentUser = requireAuth(['HOD', 'HOD_CS', 'HOD_AIML', 'ADMIN', 'FACULTY']) || JSON.parse(localStorage.getItem('dc_user') || '{}');
renderDock('students-info.html', 'HOD');

// Initial Branch Context Detection
const isInitialAIML = (currentUser.branch === 'AIML') || 
                      (currentUser.role === 'HOD_AIML') || 
                      (currentUser.pin && (currentUser.pin.includes('AIML') || currentUser.pin.includes('PADMINI'))) || 
                      (currentUser.department && currentUser.department.includes('Artificial')) ||
                      (localStorage.getItem('hod_branch') === 'AIML') ||
                      (localStorage.getItem('hod_id') && localStorage.getItem('hod_id').toUpperCase().includes('PADMINI'));

let currentBranch = isInitialAIML ? 'AIML' : 'CS';

// Department Metadata Definition
function getBranchMeta(branch) {
  const isAIML = (branch === 'AIML');
  return {
    branchCode: isAIML ? 'AIML' : 'CS',
    totalIntake: isAIML ? 127 : 180,
    deptTitle: isAIML ? 'Artificial Intelligence & Machine Learning' : 'Computer Science & Engineering',
    deptShort: isAIML ? 'AIML' : 'CS',
    scheme: 'C-24',
    schemeGateway: 'C24',
    prefix: isAIML ? '24259-AI-' : '24259-CS-',
    hodName: isAIML ? 'Prof. Padmini' : 'Dr. J. Vamshi Krishna',
    hodSignatureTitle: isAIML ? 'Head of Department, Artificial Intelligence & Machine Learning' : 'Head of Department, Computer Science & Engg.',
    accentColor: isAIML ? '#10b981' : '#3b82f6',
    badgeClass: isAIML ? 'aiml-active' : ''
  };
}

// State
let allStudents = [];
let activeFilter = 'ALL';
let searchQuery = '';
let currentSortColumn = 'rollNumber';
let sortDirection = 'asc'; // 'asc' | 'desc'
let activeEventSource = null;
let isSyncInProgress = false;

async function initStudentsInfo() {
  setupEventListeners();
  updateBranchUI();
  await loadDepartmentStudents();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStudentsInfo);
} else {
  initStudentsInfo();
}

function updateBranchUI() {
  const meta = getBranchMeta(currentBranch);

  // Document & Header Title
  document.title = `${meta.deptShort} Department Students Info (${currentBranch === 'AIML' ? '001–120' : '001–180'}) • Live Synchronization Engine • Samskruti Digital Campus`;

  const brandAccent = document.getElementById('brand-accent-text');
  if (brandAccent) {
    brandAccent.style.color = meta.accentColor;
  }

  const deptSub = document.getElementById('dept-subtitle');
  if (deptSub) {
    deptSub.textContent = `Samskruti College (Code: 259) • Department of ${meta.deptTitle} • Scheme: ${meta.scheme}`;
  }

  const deptTitleEl = document.getElementById('dept-title');
  if (deptTitleEl) {
    deptTitleEl.textContent = `${meta.deptShort} Department Master Students Info (${currentBranch === 'AIML' ? '001–120' : '001–180'})`;
  }

  // Batch Sync Button Label
  const syncBtnLabel = document.getElementById('btn-sync-label');
  if (syncBtnLabel) {
    syncBtnLabel.textContent = `⚡ Live Sync Entire Dept (${currentBranch === 'AIML' ? '001–120' : '001–180'})`;
  }

  // Stat Intake Card
  const intakeLabel = document.getElementById('stat-intake-label');
  if (intakeLabel) {
    intakeLabel.textContent = `Total Allocated ${meta.deptShort} Intake`;
  }

  const intakeVal = document.getElementById('stat-total-intake');
  if (intakeVal) {
    intakeVal.textContent = meta.totalIntake;
  }

  const intakeSub = document.getElementById('stat-intake-sub');
  if (intakeSub) {
    intakeSub.textContent = `Diploma C-24 ${meta.deptTitle}`;
  }

  // Filter All Tab
  const filterAll = document.getElementById('filter-all-btn');
  if (filterAll) {
    filterAll.textContent = `All (${meta.totalIntake})`;
  }

  // Modal Counter Reset
  const subCounter = document.getElementById('modal-sub-counter');
  if (subCounter && !isSyncInProgress) {
    subCounter.textContent = `0 / ${meta.totalIntake} Students (0%)`;
  }

  // Department Selector Tabs
  const tabCs = document.getElementById('dept-tab-cs');
  const tabAiml = document.getElementById('dept-tab-aiml');
  if (tabCs) {
    tabCs.classList.toggle('active', currentBranch === 'CS');
    tabCs.classList.remove('aiml-active');
  }
  if (tabAiml) {
    tabAiml.classList.toggle('active', currentBranch === 'AIML');
    if (currentBranch === 'AIML') tabAiml.classList.add('aiml-active');
  }
}

function setupEventListeners() {
  // Department Switcher Tabs
  document.getElementById('dept-tab-cs')?.addEventListener('click', async () => {
    if (currentBranch === 'CS') return;
    currentBranch = 'CS';
    updateBranchUI();
    await loadDepartmentStudents();
  });

  document.getElementById('dept-tab-aiml')?.addEventListener('click', async () => {
    if (currentBranch === 'AIML') return;
    currentBranch = 'AIML';
    updateBranchUI();
    await loadDepartmentStudents();
  });

  // Batch Sync Trigger Button (Forced Re-sync)
  document.getElementById('btn-start-batch-sync')?.addEventListener('click', () => startLiveDepartmentSync(false));

  // CSV Export Button
  document.getElementById('btn-export-csv')?.addEventListener('click', exportDepartmentCSV);

  // Attendance PDF Export Button
  document.getElementById('btn-export-attendance-pdf')?.addEventListener('click', generateAttendancePDF);

  // Backlogs Dossier PDF Export Button
  document.getElementById('btn-export-backlogs-pdf')?.addEventListener('click', generateBacklogsDossierPDF);

  // Search Input
  document.getElementById('student-search-input')?.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    renderStudentsTable();
  });

  // Filter Tabs
  document.querySelectorAll('#attendance-filter-tabs button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#attendance-filter-tabs button').forEach(b => b.classList.remove('active', 'aiml-active'));
      btn.classList.add('active');
      if (currentBranch === 'AIML') btn.classList.add('aiml-active');
      activeFilter = btn.getAttribute('data-filter');
      renderStudentsTable();
    });
  });

  // Table Sorting Headers
  document.querySelectorAll('#students-table th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.getAttribute('data-sort');
      if (currentSortColumn === col) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        currentSortColumn = col;
        sortDirection = col === 'percentage' || col === 'backlogCount' ? 'desc' : 'asc';
      }
      renderStudentsTable();
    });
  });

  // Backlog Modal Close Handlers
  document.getElementById('backlog-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'backlog-modal') closeBacklogDetailsModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeBacklogDetailsModal();
  });

  // Dismiss Sync Modal (Safely closes SSE stream and hides overlay)
  document.getElementById('btn-dismiss-sync-modal')?.addEventListener('click', () => {
    if (activeEventSource) {
      activeEventSource.close();
      activeEventSource = null;
    }
    isSyncInProgress = false;
    document.getElementById('sync-progress-modal').style.display = 'none';
  });
}

/**
 * 1. LOAD ALL DEPARTMENT STUDENTS (CS: 180, AIML: 120) & AUTO-SYNC CHECK
 */
async function loadDepartmentStudents() {
  const meta = getBranchMeta(currentBranch);
  let isStale = true;

  try {
    const res = await api.get(`/hod/students?branch=${currentBranch}`);
    if (res && res.success && Array.isArray(res.students)) {
      allStudents = res.students;
      isStale = res.isStale === true || allStudents.some(s => !s.isSynced && !s.attendance);
    } else {
      allStudents = generateFallbackDepartmentStudents(currentBranch);
    }
  } catch (err) {
    console.warn(`[Load ${currentBranch} Students Fallback]`, err);
    allStudents = generateFallbackDepartmentStudents(currentBranch);
  }

  recalculateDepartmentSummaryStats();
  renderStudentsTable();

  // Trigger silent auto-sync if stale (>2 hours) or unsynced
  if (isStale && !isSyncInProgress) {
    const autoPill = document.getElementById('auto-sync-status-pill');
    if (autoPill) {
      autoPill.innerHTML = `
        <span style="width: 8px; height: 8px; border-radius: 50%; background: #3b82f6; display: inline-block; box-shadow: 0 0 8px #3b82f6; animation: pulse 1s infinite;"></span>
        Auto-Syncing ${meta.deptShort} Records...
      `;
    }
    startLiveDepartmentSync(true);
  }
}

/**
 * 2. COMPUTE DYNAMIC ACTIVE ATTENDANCE PERCENTAGE
 * Formula: (Days Present / Working Days Elapsed) * 100
 */
function computeActiveAttendancePercentage(student) {
  if (!student.attendance || student.attendance.daysPresent == null) return null;
  const att = student.attendance;
  const working = Number(att.workingDays) || 88;
  const present = Number(att.daysPresent) || 0;
  
  let pct = Number(att.percentage);
  if ((!pct || pct === 0 || isNaN(pct)) && present > 0 && working > 0) {
    pct = (present / working) * 100;
  }
  return Math.min(100, Math.max(0, Number((pct || 0).toFixed(1))));
}

/**
 * 3. RENDER MASTER TABLE
 */
function renderStudentsTable() {
  const tbody = document.getElementById('students-tbody');
  if (!tbody) return;
  const meta = getBranchMeta(currentBranch);

  // Filter
  const filtered = allStudents.filter(student => {
    const attPct = computeActiveAttendancePercentage(student);
    const backlogs = Number(student.backlogs != null ? student.backlogs : (student.results?.backlogCount || student.backlogs_count || 0));

    let matchesFilter = true;
    if (activeFilter === 'CRITICAL') matchesFilter = attPct !== null && attPct < 65;
    else if (activeFilter === 'WARNING') matchesFilter = attPct !== null && attPct >= 65 && attPct < 75;
    else if (activeFilter === 'ELIGIBLE') matchesFilter = attPct !== null && attPct >= 75;
    else if (activeFilter === 'BACKLOGS') matchesFilter = backlogs > 0;
    else if (activeFilter === 'CLEARED') matchesFilter = backlogs === 0;

    const pin = (student.pin || '').toLowerCase();
    const name = (student.name || '').toLowerCase();
    const matchesSearch = !searchQuery || pin.includes(searchQuery) || name.includes(searchQuery);

    return matchesFilter && matchesSearch;
  });

  // Sort
  filtered.sort((a, b) => {
    let valA, valB;

    switch (currentSortColumn) {
      case 'name':
        valA = (a.name || '').toLowerCase();
        valB = (b.name || '').toLowerCase();
        break;
      case 'percentage':
        valA = computeActiveAttendancePercentage(a) || -1;
        valB = computeActiveAttendancePercentage(b) || -1;
        break;
      case 'workingDays':
        valA = a.attendance?.daysPresent || -1;
        valB = b.attendance?.daysPresent || -1;
        break;
      case 'cgpa':
        valA = Number(a.cgpa != null ? a.cgpa : (a.results?.cgpa || -1));
        valB = Number(b.cgpa != null ? b.cgpa : (b.results?.cgpa || -1));
        break;
      case 'backlogCount':
      case 'backlogs':
        valA = Number(a.backlogs != null ? a.backlogs : (a.results?.backlogCount || a.backlogs_count || 0));
        valB = Number(b.backlogs != null ? b.backlogs : (b.results?.backlogCount || b.backlogs_count || 0));
        break;
      case 'rollNumber':
      default:
        valA = a.rollNumber || 0;
        valB = b.rollNumber || 0;
        break;
    }

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; padding: 36px; color: var(--hod-text-muted); font-style: italic;">
          No ${meta.deptShort} student records found matching the current search or filter criteria.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(s => {
    const isSynced = s.isSynced !== false && s.attendance && s.attendance.daysPresent != null;
    const attPct = computeActiveAttendancePercentage(s);
    const backlogs = Number(s.backlogs != null ? s.backlogs : (s.results?.backlogCount || s.backlogs_count || 0));
    const cgpa = Number(s.cgpa != null ? s.cgpa : (s.results?.cgpa || 0));
    const workingDays = s.attendance?.workingDays || 88;
    const daysPresent = s.attendance?.daysPresent || 0;
    const branchTag = (s.pin && s.pin.includes('AIML')) || s.branch === 'Artificial Intelligence & Machine Learning' ? 'AIML (C-24)' : 'CS (C-24)';

    let nameHtml = `<span class="inline-flex items-center gap-1.5 text-slate-500 italic" style="font-size: 0.82rem; color: #64748b;"><span style="width: 6px; height: 6px; border-radius: 50%; background: #475569; display: inline-block;"></span> Pending Sync</span>`;
    let daysDisplay = `<span class="mono-num" style="color: var(--hod-text-muted); font-size: 0.8rem;">-- / -- days</span>`;
    let pctDisplay = `<span class="mono-num" style="color: var(--hod-text-muted); font-weight: 700;">--%</span>`;
    let statusBadge = `<span class="badge-queued">UNSYNCED</span>`;
    let cgpaDisplay = `<span class="mono-num" style="color: var(--hod-text-muted);">--</span>`;
    let backlogBtn = `<span style="color: var(--hod-text-muted); font-size: 0.8rem;">--</span>`;
    let syncedTime = `<span class="mono-num" style="font-size: 0.75rem; color: var(--hod-text-sub);">Never</span>`;

    if (isSynced && attPct !== null) {
      nameHtml = `<strong style="color: var(--hod-text-main); font-weight: 700;">${escapeHtml(s.name)}</strong>`;
      daysDisplay = `<span class="mono-num"><strong style="color: var(--hod-text-main);">${daysPresent}</strong> <span style="color: var(--hod-text-sub);">/ ${workingDays} days</span></span>`;

      const isCritical = attPct < 65;
      const isWarning = attPct >= 65 && attPct < 75;

      statusBadge = isCritical
        ? `<span class="status-badge-critical">CRITICAL (&lt;65%)</span>`
        : isWarning
        ? `<span class="status-badge-warning">CONDONATION</span>`
        : `<span class="status-badge-good">ELIGIBLE (≥75%)</span>`;

      const pctColor = isCritical ? '#f87171' : isWarning ? '#fbbf24' : '#34d399';
      pctDisplay = `<span class="mono-num" style="font-weight: 900; color: ${pctColor}; font-size: 0.95rem;">${attPct.toFixed(1)}%</span>`;
      cgpaDisplay = `<span class="mono-num" style="font-weight: 700; color: #f8fafc;">${cgpa.toFixed(2)}</span>`;
      
      backlogBtn = backlogs > 0
        ? `<button type="button" class="btn-backlog-inspect" onclick="openBacklogDetailsModal('${s.pin}')" title="Click to view failed subjects" style="background: none; border: none; padding: 0; cursor: pointer;">
             <span class="status-badge-critical" style="background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); padding: 4px 10px; border-radius: 6px; font-weight: 800; font-size: 0.78rem;">✕ ${backlogs} Backlog${backlogs > 1 ? 's' : ''}</span>
           </button>`
        : `<span class="status-badge-good" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); padding: 4px 10px; border-radius: 6px; font-weight: 800; font-size: 0.78rem;">✓ 0 Cleared</span>`;

      syncedTime = `<span class="mono-num" style="font-size: 0.75rem; color: var(--hod-text-sub);">${s.lastSynced ? formatTime(s.lastSynced) : 'Just Now'}</span>`;
    }

    return `
      <tr id="row-${s.pin}">
        <td><strong class="mono-num" style="color: #93c5fd; font-size: 0.85rem;">${escapeHtml(s.pin)}</strong></td>
        <td class="student-name-cell">${nameHtml}</td>
        <td><span style="font-size: 0.78rem; color: var(--hod-text-muted);">${branchTag}</span></td>
        <td>${daysDisplay}</td>
        <td>${pctDisplay}</td>
        <td>${statusBadge}</td>
        <td>${cgpaDisplay}</td>
        <td>${backlogBtn}</td>
        <td>${syncedTime}</td>
        <td>
          <button class="neu-btn btn-sync-single" style="font-size: 0.75rem; padding: 4px 10px; border-radius: 6px; cursor: pointer;" onclick="window.syncSingleStudent('${s.pin}')" title="Sync Live Attendance & Results for ${s.pin}">
            🔄 Sync
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * 4. ROBUST SERVER-SENT EVENTS (SSE) STREAM HANDLER
 */
function startLiveDepartmentSync(isSilent = false) {
  if (isSyncInProgress) return;
  isSyncInProgress = true;

  const meta = getBranchMeta(currentBranch);
  const modal = document.getElementById('sync-progress-modal');
  const topPercentBadge = document.getElementById('modal-top-percent');
  const subCounter = document.getElementById('modal-sub-counter');
  const progressBar = document.getElementById('modal-progress-bar');
  const logTerminal = document.getElementById('modal-terminal-log');
  const statusPill = document.getElementById('auto-sync-status-pill');
  const modalTitle = document.getElementById('modal-sync-title');
  const modalSub = document.getElementById('modal-sync-subtitle');

  if (modalTitle) modalTitle.textContent = `Live ${meta.deptShort} Batch Sync`;
  if (modalSub) modalSub.textContent = `SBTET Live Gateway • ${meta.totalIntake} Students • 6 Concurrent Rate-Limited Workers`;

  // 1. Reset Modal State to 0%
  if (!isSilent && modal) {
    modal.style.display = 'flex';
    if (topPercentBadge) topPercentBadge.textContent = '0%';
    if (subCounter) subCounter.textContent = `0 / ${meta.totalIntake} Students (0%)`;
    if (progressBar) progressBar.style.width = '0%';
    if (logTerminal) {
      logTerminal.innerHTML = `<div style="color: #94a3b8;">Connecting to live SBTET gateway for ${meta.deptTitle}...</div>`;
    }
  }

  if (activeEventSource) {
    activeEventSource.close();
  }

  activeEventSource = new EventSource(`/api/hod/sync-stream?branch=${currentBranch}`);

  activeEventSource.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);

      if (data.type === 'CONNECTED') {
        if (logTerminal && !isSilent) {
          logTerminal.innerHTML += `<div style="color: #34d399; font-weight: 700;">✓ Connected. Dispatching 6 concurrent workers across ${meta.totalIntake} PINs...</div>`;
        }
      }

      if (data.type === 'PROGRESS' || data.type === 'PROGRESS_ERROR') {
        const total = data.total || meta.totalIntake;
        const completed = data.completed || 0;
        const percent = data.percent !== undefined ? data.percent : Math.round((completed / total) * 100);

        if (topPercentBadge && !isSilent) topPercentBadge.textContent = `${percent}%`;
        if (subCounter && !isSilent) subCounter.textContent = `${completed} / ${total} Students (${percent}%)`;
        if (progressBar && !isSilent) progressBar.style.width = `${percent}%`;

        if (data.type === 'PROGRESS' && data.student) {
          // Update in-memory dataset
          const idx = allStudents.findIndex(s => s.pin === data.student.pin);
          if (idx !== -1) {
            allStudents[idx] = data.student;
          } else {
            allStudents.push(data.student);
          }

          // Live Hydration of table row
          updateTableRowWithRealData(data.student);
          recalculateDepartmentSummaryStats();

          if (logTerminal && !isSilent) {
            const attPct = computeActiveAttendancePercentage(data.student);
            logTerminal.innerHTML += `<div style="color: #cbd5e1;">✓ Synced <strong style="color: #93c5fd; font-family: monospace;">${data.pin}</strong>: ${escapeHtml(data.student.name)} (${attPct !== null ? attPct : '--'}%)</div>`;
            logTerminal.scrollTop = logTerminal.scrollHeight;
          }
        } else if (logTerminal && !isSilent) {
          logTerminal.innerHTML += `<div style="color: #fbbf24;">⚠ ${data.pin}: ${data.error || 'Sync timeout'}</div>`;
          logTerminal.scrollTop = logTerminal.scrollHeight;
        }
      }

      if (data.type === 'COMPLETE') {
        if (topPercentBadge && !isSilent) topPercentBadge.textContent = '100%';
        if (subCounter && !isSilent) subCounter.textContent = `${meta.totalIntake} / ${meta.totalIntake} Students (100%)`;
        if (progressBar && !isSilent) progressBar.style.width = '100%';
        
        if (logTerminal && !isSilent) {
          logTerminal.innerHTML += `<div style="color: #34d399; font-weight: 800; margin-top: 8px;">✓ Batch Synchronization Completed Successfully!</div>`;
          logTerminal.scrollTop = logTerminal.scrollHeight;
        }

        activeEventSource.close();
        activeEventSource = null;
        isSyncInProgress = false;

        if (statusPill) {
          statusPill.innerHTML = `
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; display: inline-block; box-shadow: 0 0 8px #10b981;"></span>
            Live Synced Just Now
          `;
        }

        if (!isSilent) {
          alerts.success('Batch Sync Complete', `All ${meta.totalIntake} ${meta.deptShort} department students updated with fresh SBTET metrics.`);
        }
      }
    } catch (err) {
      console.error('[SSE Parse Error]', err);
    }
  };

  activeEventSource.onerror = () => {
    if (activeEventSource) {
      activeEventSource.close();
      activeEventSource = null;
    }
    isSyncInProgress = false;
    if (logTerminal && !isSilent) {
      logTerminal.innerHTML += `<div style="color: #f87171;">Connection completed or closed.</div>`;
    }
    if (statusPill) {
      statusPill.innerHTML = `
        <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
        Synchronized
      `;
    }
  };
}

/**
 * 5. DYNAMIC REAL-TIME ROW HYDRATION
 */
function updateTableRowWithRealData(student) {
  const row = document.getElementById(`row-${student.pin}`);
  if (!row) return;

  const attPct = computeActiveAttendancePercentage(student);
  const backlogs = Number(student.backlogs != null ? student.backlogs : (student.results?.backlogCount || student.backlogs_count || 0));
  const cgpa = Number(student.cgpa != null ? student.cgpa : (student.results?.cgpa || 0));
  const workingDays = student.attendance?.workingDays || 88;
  const daysPresent = student.attendance?.daysPresent || 0;

  // 1. Update verified student name
  const nameCell = row.querySelector('.student-name-cell') || row.cells[1];
  if (nameCell) {
    nameCell.innerHTML = `<strong style="color: var(--hod-text-main); font-weight: 700;">${escapeHtml(student.name)}</strong>`;
  }

  // 2. Update days present / working days
  row.cells[3].innerHTML = `<span class="mono-num"><strong style="color: var(--hod-text-main);">${daysPresent}</strong> <span style="color: var(--hod-text-sub);">/ ${workingDays} days</span></span>`;

  // 3. Update percentage with dynamic color
  if (attPct !== null) {
    const isCritical = attPct < 65;
    const isWarning = attPct >= 65 && attPct < 75;

    const statusBadge = isCritical
      ? `<span class="status-badge-critical">CRITICAL (&lt;65%)</span>`
      : isWarning
      ? `<span class="status-badge-warning">CONDONATION</span>`
      : `<span class="status-badge-good">ELIGIBLE (≥75%)</span>`;

    const pctColor = isCritical ? '#f87171' : isWarning ? '#fbbf24' : '#34d399';

    row.cells[4].innerHTML = `<span class="mono-num" style="font-weight: 900; color: ${pctColor}; font-size: 0.95rem;">${attPct.toFixed(1)}%</span>`;
    row.cells[5].innerHTML = statusBadge;
  }

  // 4. Update CGPA
  row.cells[6].innerHTML = `<span class="mono-num" style="font-weight: 700; color: #f8fafc;">${cgpa.toFixed(2)}</span>`;

  // 5. Update Backlogs Pill
  row.cells[7].innerHTML = backlogs > 0
    ? `<button type="button" class="btn-backlog-inspect" onclick="openBacklogDetailsModal('${student.pin}')" title="Click to view failed subjects" style="background: none; border: none; padding: 0; cursor: pointer;">
         <span class="status-badge-critical" style="background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); padding: 4px 10px; border-radius: 6px; font-weight: 800; font-size: 0.78rem;">✕ ${backlogs} Backlog${backlogs > 1 ? 's' : ''}</span>
       </button>`
    : `<span class="status-badge-good" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); padding: 4px 10px; border-radius: 6px; font-weight: 800; font-size: 0.78rem;">✓ 0 Cleared</span>`;

  // 6. Update last synced
  row.cells[8].innerHTML = `<span class="mono-num" style="font-size: 0.75rem; color: var(--hod-text-sub);">${student.lastSynced ? formatTime(student.lastSynced) : 'Just Now'}</span>`;
}

/**
 * 6. RECALCULATE DEPARTMENT SUMMARY STATS
 */
function recalculateDepartmentSummaryStats() {
  const meta = getBranchMeta(currentBranch);
  let totalAtt = 0;
  let syncedCount = 0;
  let eligible = 0;
  let condonation = 0;
  let critical = 0;
  let withBacklogs = 0;
  let totalBacklogsCount = 0;

  allStudents.forEach(s => {
    const attPct = computeActiveAttendancePercentage(s);
    const bCount = Number(s.backlogs != null ? s.backlogs : (s.results?.backlogCount || s.backlogs_count || 0));

    if (attPct !== null) {
      totalAtt += attPct;
      syncedCount++;

      if (attPct >= 75) eligible++;
      else if (attPct >= 65) condonation++;
      else critical++;
    }

    if (bCount > 0) {
      withBacklogs++;
      totalBacklogsCount += bCount;
    }
  });

  const avgAtt = syncedCount > 0 ? (totalAtt / syncedCount).toFixed(1) : 0;

  const avgElem = document.getElementById('stat-avg-attendance');
  const eligibleElem = document.getElementById('stat-eligible');
  const condonationElem = document.getElementById('stat-condonation');
  const criticalElem = document.getElementById('stat-detention');
  const backlogStudentsElem = document.getElementById('stat-backlogs');
  const totalBacklogsSub = document.getElementById('stat-total-backlogs-count');
  const totalIntakeElem = document.getElementById('stat-total-intake');

  if (totalIntakeElem) totalIntakeElem.textContent = meta.totalIntake;
  if (avgElem) avgElem.textContent = syncedCount > 0 ? `${avgAtt}%` : '--%';
  if (eligibleElem) eligibleElem.textContent = syncedCount > 0 ? eligible : '--';
  if (condonationElem) condonationElem.textContent = syncedCount > 0 ? condonation : '--';
  if (criticalElem) criticalElem.textContent = syncedCount > 0 ? critical : '--';
  if (backlogStudentsElem) backlogStudentsElem.textContent = syncedCount > 0 ? withBacklogs : '--';
  if (totalBacklogsSub) totalBacklogsSub.textContent = syncedCount > 0 ? `Total Backlogs: ${totalBacklogsCount}` : 'Total Backlogs: --';
}

/**
 * 7. OPEN & HYDRATE BACKLOG DETAILS MODAL
 */
async function openBacklogDetailsModal(pin) {
  const modal = document.getElementById('backlog-modal');
  const nameEl = document.getElementById('modal-student-name');
  const pinEl = document.getElementById('modal-student-pin');
  const schemeEl = document.getElementById('modal-student-scheme');
  const summaryEl = document.getElementById('modal-backlog-summary');
  const tableBody = document.getElementById('modal-backlog-table-body');
  const emptyState = document.getElementById('modal-backlog-empty');

  if (!modal) return;

  // 1. Locate student record from memory
  let student = allStudents.find(s => s.pin === pin);

  // 2. If no backlog_details cached, try a live single-student sync to fetch them
  if (!student || !student.backlog_details || student.backlog_details.length === 0) {
    try {
      const res = await api.request('/hod/sync-student', {
        method: 'POST',
        body: { pin }
      });
      if (res && res.success && res.student) {
        student = { ...student, ...res.student };
        const idx = allStudents.findIndex(s => s.pin === pin);
        if (idx !== -1) allStudents[idx] = student;
      }
    } catch (e) {
      console.warn('[Backlog Modal Sync Fallback Warning]', e);
    }
  }

  const backlogCount = student?.backlogs || student?.backlogs_count || student?.results?.backlogCount || 0;
  const details = student?.backlog_details || [];
  const meta = getBranchMeta(pin.includes('AIML') ? 'AIML' : 'CS');

  // 3. Hydrate Header Info
  if (nameEl) nameEl.textContent = student?.name || 'Student Name';
  if (pinEl) pinEl.textContent = student?.pin || pin;
  if (schemeEl) schemeEl.textContent = `Diploma C-24 ${meta.deptTitle}`;
  if (summaryEl) {
    summaryEl.textContent = `${backlogCount} Active Backlog${backlogCount !== 1 ? 's' : ''}`;
    summaryEl.style.color = backlogCount > 0 ? '#fb7185' : '#4ade80';
  }

  // 4. Render Subject Rows from backlog_details array
  if (tableBody) {
    tableBody.innerHTML = '';

    if (details.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
    } else {
      if (emptyState) emptyState.style.display = 'none';
      details.forEach(sub => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid rgba(255, 255, 255, 0.04)';
        const totalMarks = sub.total || (Number(sub.internal || 0) + Number(sub.external || 0));
        const isLowMarks = Number(totalMarks) < 35;
        row.innerHTML = `
          <td style="padding: 10px; font-weight: 600; color: #94a3b8;">${escapeHtml(sub.sem || '--')}</td>
          <td style="padding: 10px; font-family: monospace; font-weight: bold; color: #38bdf8;">${escapeHtml(sub.code || '--')}</td>
          <td style="padding: 10px; font-weight: 500; color: #f1f5f9;">${escapeHtml(sub.title || '--')}</td>
          <td style="padding: 10px; text-align: center; font-family: monospace; color: #cbd5e1;">${escapeHtml(sub.internal || '--')}</td>
          <td style="padding: 10px; text-align: center; font-family: monospace; color: #cbd5e1;">${escapeHtml(sub.external || '--')}</td>
          <td style="padding: 10px; text-align: center; font-family: monospace; font-weight: bold; color: ${isLowMarks ? '#fb7185' : '#f1f5f9'};">${escapeHtml(String(totalMarks) || '--')}</td>
          <td style="padding: 10px; text-align: center;">
            <span style="padding: 2px 8px; border-radius: 4px; background: rgba(244, 63, 94, 0.15); color: #fb7185; font-weight: 800; font-size: 0.72rem; border: 1px solid rgba(244, 63, 94, 0.25);">${escapeHtml(sub.grade || 'F')}</span>
          </td>
        `;
        tableBody.appendChild(row);
      });
    }
  }

  // 5. Reveal Modal
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  modal.style.display = 'flex';
}

function closeBacklogDetailsModal() {
  const modal = document.getElementById('backlog-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    modal.style.display = 'none';
  }
}

window.openBacklogDetailsModal = openBacklogDetailsModal;
window.closeBacklogDetailsModal = closeBacklogDetailsModal;
window.inspectStudentBacklogs = openBacklogDetailsModal;

/**
 * 8. SINGLE STUDENT SYNC
 */
window.syncSingleStudent = async function(pin) {
  alerts.info('Syncing...', `Fetching latest biometric metrics for ${pin}...`);
  try {
    const res = await api.request('/hod/sync-student', {
      method: 'POST',
      body: { pin }
    });

    if (res && res.success && res.student) {
      const idx = allStudents.findIndex(s => s.pin === pin);
      if (idx !== -1) {
        allStudents[idx] = res.student;
      }
      updateTableRowWithRealData(res.student);
      recalculateDepartmentSummaryStats();
      alerts.success('Synced', `${pin} (${res.student.name}) updated successfully.`);
    }
  } catch (err) {
    alerts.error('Sync Failed', `Could not update ${pin}.`);
  }
};

/**
 * 9. EXPORT CSV
 */
function exportDepartmentCSV() {
  const meta = getBranchMeta(currentBranch);
  if (allStudents.length === 0) {
    alerts.warning('No data to export.');
    return;
  }

  const headers = [
    'PIN',
    'Student Name',
    'Branch',
    'Scheme',
    'Semester',
    'Working Days',
    'Days Present',
    'Attendance %',
    'Eligibility Status',
    'CGPA',
    'Backlog Count',
    'Last Synced'
  ];

  const rows = allStudents.map(s => {
    const attPct = computeActiveAttendancePercentage(s);
    return [
      `"${s.pin}"`,
      `"${(s.name || '').replace(/"/g, '""')}"`,
      `"${meta.deptTitle}"`,
      `"${meta.scheme}"`,
      `"${s.semester || 6}"`,
      s.attendance?.workingDays || 88,
      s.attendance?.daysPresent || 0,
      attPct !== null ? attPct.toFixed(2) : 'Unsynced',
      `"${s.attendance?.status || 'UNSYNCED'}"`,
      (s.results?.cgpa || 0).toFixed(2),
      s.results?.backlogCount || 0,
      `"${s.lastSynced || ''}"`
    ];
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Samskruti_${meta.deptShort}_Department_Master_Sync_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  alerts.success('CSV Exported', `${meta.deptShort} department metrics downloaded successfully.`);
}

/**
 * 10. GENERATE ATTENDANCE REPORT (PDF)
 * High-fidelity institutional PDF generator for either CS (180) or AIML (120) with branch HOD credentials.
 */
function generateAttendancePDF() {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alerts.error('PDF Library Error', 'jsPDF is not loaded. Please verify your internet connection.');
    return;
  }
  if (!allStudents || allStudents.length === 0) {
    alerts.warning('No data to export.');
    return;
  }

  const meta = getBranchMeta(currentBranch);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Summary Metrics Computation
  let eligibleCount = 0;
  let condonationCount = 0;
  let detentionCount = 0;

  allStudents.forEach(s => {
    const attPct = computeActiveAttendancePercentage(s);
    if (attPct !== null) {
      if (attPct >= 75.0) eligibleCount++;
      else if (attPct >= 65.0) condonationCount++;
      else detentionCount++;
    }
  });

  const avgAttendance = document.getElementById('stat-avg-attendance')?.textContent || '0.0%';
  const generatedDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  // Table rows
  const tableData = allStudents.map((s, idx) => {
    const attPct = computeActiveAttendancePercentage(s);
    const elapsed = s.attendance?.workingDays || 88;
    const present = s.attendance?.daysPresent || 0;
    const pctStr = attPct !== null ? `${attPct.toFixed(2)}%` : '--%';
    
    let statusText = 'UNSYNCED';
    if (attPct !== null) {
      if (attPct >= 75.0) statusText = 'ELIGIBLE';
      else if (attPct >= 65.0) statusText = 'CONDONATION';
      else statusText = 'DETENTION RISK';
    }

    return [
      idx + 1,
      s.pin,
      s.name || `Student ${s.pin}`,
      elapsed,
      present,
      pctStr,
      statusText
    ];
  });

  doc.autoTable({
    head: [['S.No', 'Diploma PIN', 'Student Name', 'Elapsed', 'Present', 'Attendance %', 'Status']],
    body: tableData,
    startY: 125,
    margin: { top: 125, bottom: 85, left: 36, right: 36 },
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 4,
      valign: 'middle',
      lineColor: [220, 225, 230],
      lineWidth: 0.5
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [248, 250, 252],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 32 },
      1: { halign: 'center', cellWidth: 80, fontStyle: 'bold' },
      2: { halign: 'left', cellWidth: 175 },
      3: { halign: 'center', cellWidth: 48 },
      4: { halign: 'center', cellWidth: 48 },
      5: { halign: 'center', cellWidth: 68, fontStyle: 'bold' },
      6: { halign: 'center', cellWidth: 72, fontStyle: 'bold' }
    },
    didParseCell: function(data) {
      if (data.section === 'body' && data.column.index === 6) {
        const val = data.cell.raw;
        if (val === 'ELIGIBLE') {
          data.cell.styles.textColor = [16, 185, 129];
        } else if (val === 'CONDONATION') {
          data.cell.styles.textColor = [217, 119, 6];
        } else if (val === 'DETENTION RISK') {
          data.cell.styles.textColor = [225, 29, 72];
        }
      }
    },
    didDrawPage: function(data) {
      // Header Banner
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('SAMSKRUTI COLLEGE OF ENGINEERING & TECHNOLOGY', pageWidth / 2, 28, { align: 'center' });

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text('(Approved by AICTE, Affiliated to SBTET Telangana • College Code: 259)', pageWidth / 2, 42, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(currentBranch === 'AIML' ? 16 : 2, currentBranch === 'AIML' ? 185 : 132, currentBranch === 'AIML' ? 129 : 199);
      doc.text(`DEPARTMENT OF ${meta.deptTitle.toUpperCase()} • BIOMETRIC ATTENDANCE DOSSIER`, pageWidth / 2, 58, { align: 'center' });

      // Sub-bar info
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Scheme: C-24 | Batch: 24259 | Total Intake: ${meta.totalIntake} | Report Generated: ${generatedDate}`, 36, 74);
      doc.text(`Institutional Portal: digital-campus.samskruti.ac.in`, pageWidth - 36, 74, { align: 'right' });

      // KPI Metric Ribbon
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(36, 82, pageWidth - 72, 32, 4, 4, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);

      const colW = (pageWidth - 72) / 4;
      doc.text(`Total ${meta.deptShort} Intake: ${meta.totalIntake}`, 36 + (colW * 0.5), 102, { align: 'center' });
      doc.text(`Dept Average Att: ${avgAttendance}`, 36 + (colW * 1.5), 102, { align: 'center' });
      doc.setTextColor(16, 185, 129);
      doc.text(`Eligible (≥75%): ${eligibleCount}`, 36 + (colW * 2.5), 102, { align: 'center' });
      doc.setTextColor(225, 29, 72);
      doc.text(`Detention Alert (<65%): ${detentionCount}`, 36 + (colW * 3.5), 102, { align: 'center' });

      // Footer
      const totalPages = doc.internal.getNumberOfPages();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`Confidential • Samskruti College of Engineering & Technology (259) • Page ${data.pageNumber} of ${totalPages}`, 36, pageHeight - 24);
      doc.text(`Official SBTET Telangana Biometric Verification Portal`, pageWidth - 36, pageHeight - 24, { align: 'right' });
    }
  });

  // Final Page Verification & Signature Block
  const finalY = doc.lastAutoTable.finalY + 30;
  if (finalY < pageHeight - 90) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Certified that the biometric attendance records above represent the verified SBTET status for the Diploma C-24 ${meta.deptShort} batch.`, 36, finalY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('_________________________________', pageWidth - 240, finalY + 40);
    doc.text(meta.hodName, pageWidth - 240, finalY + 54);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(meta.hodSignatureTitle, pageWidth - 240, finalY + 66);
    doc.text('Samskruti College of Engineering & Technology', pageWidth - 240, finalY + 77);
  }

  doc.save(`Samskruti_${meta.deptShort}_Attendance_Status_Report_${meta.totalIntake}_${new Date().toISOString().slice(0, 10)}.pdf`);
  alerts.success('PDF Generated', `All ${meta.totalIntake} Students Attendance Report exported successfully.`);
}

/**
 * 11. GENERATE BACKLOGS-ONLY DOSSIER (PDF)
 * Official remedial audit dossier for failed subjects in landscape layout with HOD signature.
 */
function generateBacklogsDossierPDF() {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alerts.error('PDF Library Error', 'jsPDF is not loaded. Please verify your internet connection.');
    return;
  }

  const meta = getBranchMeta(currentBranch);

  // Filter students with backlogs
  const studentsWithBacklogs = allStudents.filter(s => {
    const bCount = Number(s.backlogs != null ? s.backlogs : (s.results?.backlogCount || s.backlogs_count || 0));
    const hasDetails = Array.isArray(s.backlog_details) && s.backlog_details.length > 0;
    return bCount > 0 || hasDetails;
  });

  if (studentsWithBacklogs.length === 0) {
    alerts.info('No Backlogs', `All ${meta.deptShort} students currently cleared! No active backlogs in the department.`);
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  let totalBacklogSubjectsCount = 0;
  const tableRows = [];

  studentsWithBacklogs.forEach(s => {
    const details = s.backlog_details || [];
    const cgpaVal = (s.cgpa != null ? Number(s.cgpa) : Number(s.results?.cgpa || 0)).toFixed(2);

    if (details.length > 0) {
      details.forEach((sub, sIdx) => {
        totalBacklogSubjectsCount++;
        const totalMarks = sub.total || (Number(sub.internal || 0) + Number(sub.external || 0));
        tableRows.push([
          tableRows.length + 1,
          sIdx === 0 ? s.pin : '',
          sIdx === 0 ? (s.name || `Student ${s.pin}`) : '',
          sIdx === 0 ? cgpaVal : '',
          sub.sem || '1SEM',
          sub.code || '--',
          sub.title || 'Core Subject',
          sub.internal || '--',
          sub.external || '--',
          totalMarks || '--',
          sub.grade || 'F'
        ]);
      });
    } else {
      const bCount = Number(s.backlogs != null ? s.backlogs : (s.results?.backlogCount || s.backlogs_count || 1));
      totalBacklogSubjectsCount += bCount;
      tableRows.push([
        tableRows.length + 1,
        s.pin,
        s.name || `Student ${s.pin}`,
        cgpaVal,
        'Various',
        '--',
        `${bCount} Active Failed Subject(s) [Pending Detailed Breakdown]`,
        '--',
        '--',
        '--',
        'F'
      ]);
    }
  });

  const generatedDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  doc.autoTable({
    head: [['S.No', 'Diploma PIN', 'Student Name', 'CGPA', 'Sem', 'Sub Code', 'Subject Title', 'Int', 'Ext', 'Total', 'Grade']],
    body: tableRows,
    startY: 110,
    margin: { top: 110, bottom: 70, left: 36, right: 36 },
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 3.5,
      valign: 'middle',
      lineColor: [220, 225, 230],
      lineWidth: 0.5
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [248, 250, 252],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 32 },
      1: { halign: 'center', cellWidth: 78, fontStyle: 'bold' },
      2: { halign: 'left', cellWidth: 160 },
      3: { halign: 'center', cellWidth: 45, fontStyle: 'bold' },
      4: { halign: 'center', cellWidth: 42 },
      5: { halign: 'center', cellWidth: 62, fontStyle: 'bold' },
      6: { halign: 'left', cellWidth: 195 },
      7: { halign: 'center', cellWidth: 36 },
      8: { halign: 'center', cellWidth: 36 },
      9: { halign: 'center', cellWidth: 42, fontStyle: 'bold' },
      10: { halign: 'center', cellWidth: 40, fontStyle: 'bold' }
    },
    didParseCell: function(data) {
      if (data.section === 'body' && data.column.index === 10) {
        data.cell.styles.textColor = [225, 29, 72];
      }
    },
    didDrawPage: function(data) {
      // Header Banner
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('SAMSKRUTI COLLEGE OF ENGINEERING & TECHNOLOGY', pageWidth / 2, 26, { align: 'center' });

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text('(Approved by AICTE, Affiliated to SBTET Telangana • College Code: 259)', pageWidth / 2, 38, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(225, 29, 72);
      doc.text(`DEPARTMENT OF ${meta.deptTitle.toUpperCase()} • OFFICIAL BACKLOGS INSPECTION DOSSIER`, pageWidth / 2, 52, { align: 'center' });

      // KPI Ribbon
      doc.setDrawColor(254, 205, 211);
      doc.setFillColor(255, 241, 242);
      doc.roundedRect(36, 62, pageWidth - 72, 30, 4, 4, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(190, 18, 60);

      const colW = (pageWidth - 72) / 3;
      doc.text(`Total Students with Active Backlogs: ${studentsWithBacklogs.length}`, 36 + (colW * 0.5), 81, { align: 'center' });
      doc.text(`Cumulative Failed Subjects: ${totalBacklogSubjectsCount}`, 36 + (colW * 1.5), 81, { align: 'center' });
      doc.setTextColor(71, 85, 105);
      doc.text(`Report Generated: ${generatedDate}`, 36 + (colW * 2.5), 81, { align: 'center' });

      // Footer
      const totalPages = doc.internal.getNumberOfPages();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`Confidential Academic Audit • Samskruti College of Engineering & Technology (259) • Page ${data.pageNumber} of ${totalPages}`, 36, pageHeight - 20);
      doc.text(`Official SBTET Telangana Remedial Audit Record`, pageWidth - 36, pageHeight - 20, { align: 'right' });
    }
  });

  // Final Page Verification & Signature Block
  const finalY = doc.lastAutoTable.finalY + 25;
  if (finalY < pageHeight - 80) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Official Academic Audit: This document serves as the verified departmental record of student backlogs for remedial instruction and special exam clearance.', 36, finalY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('_________________________________', pageWidth - 240, finalY + 36);
    doc.text(meta.hodName, pageWidth - 240, finalY + 48);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(meta.hodSignatureTitle, pageWidth - 240, finalY + 59);
    doc.text('Samskruti College of Engineering & Technology', pageWidth - 240, finalY + 70);
  }

  doc.save(`Samskruti_${meta.deptShort}_Backlogs_Inspection_Dossier_${new Date().toISOString().slice(0, 10)}.pdf`);
  alerts.success('PDF Generated', `Official ${meta.deptShort} Backlogs Dossier exported successfully.`);
}

function generateFallbackDepartmentStudents(branch = 'CS') {
  const meta = getBranchMeta(branch);
  return Array.from({ length: meta.totalIntake }, (_, i) => {
    const roll = i + 1;
    const pin = `${meta.prefix}${String(roll).padStart(3, '0')}`;
    return {
      pin,
      rollNumber: roll,
      name: `${meta.deptShort} Student ${roll}`,
      branch: meta.deptTitle,
      scheme: 'C-24',
      semester: '5th Sem',
      isSynced: false,
      attendance: null,
      results: null,
      lastSynced: null
    };
  });
}

function formatTime(iso) {
  if (!iso) return 'Never';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
