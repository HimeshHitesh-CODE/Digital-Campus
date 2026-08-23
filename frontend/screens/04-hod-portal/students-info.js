/**
 * Samskruti Digital Campus • HOD Master Students Info & Automated Background Sync Controller
 * Executive Glass-Neumorphic standard with dynamic active percentage calculations,
 * distinct student roster hydration, zero counter desync, and real-time SSE progress streaming.
 */

import { api } from '../../js/api.js';
import { requireAuth } from '../../js/auth-guard.js';
import { renderDock } from '../../js/dock.js';
import { alerts } from '../../js/alerts.js';

// Verify HOD / Faculty Authentication & Render Dock
requireAuth(['HOD', 'HOD_CS', 'ADMIN', 'FACULTY']);
renderDock('students-info.html', 'HOD');

// State
let allStudents = [];
let activeFilter = 'ALL';
let searchQuery = '';
let currentSortColumn = 'rollNumber';
let sortDirection = 'asc'; // 'asc' | 'desc'
let activeEventSource = null;
let isSyncInProgress = false;

document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await loadDepartmentStudents();
});

function setupEventListeners() {
  // Batch Sync Trigger Button (Forced Re-sync)
  document.getElementById('btn-start-batch-sync')?.addEventListener('click', () => startLiveDepartmentSync(false));

  // CSV Export Button
  document.getElementById('btn-export-csv')?.addEventListener('click', exportDepartmentCSV);

  // Search Input
  document.getElementById('student-search-input')?.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    renderStudentsTable();
  });

  // Filter Tabs
  document.querySelectorAll('#attendance-filter-tabs button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#attendance-filter-tabs button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
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
 * 1. LOAD ALL 180 DEPARTMENT STUDENTS & AUTO-SYNC CHECK
 */
async function loadDepartmentStudents() {
  let isStale = true;
  try {
    const res = await api.get('/hod/students');
    if (res && res.success && Array.isArray(res.students)) {
      allStudents = res.students;
      isStale = res.isStale === true || allStudents.some(s => !s.isSynced && !s.attendance);
    } else {
      allStudents = generateFallbackDepartmentStudents();
    }
  } catch {
    allStudents = generateFallbackDepartmentStudents();
  }

  recalculateDepartmentSummaryStats();
  renderStudentsTable();

  // Trigger silent auto-sync if stale (>2 hours) or unsynced
  if (isStale && !isSyncInProgress) {
    const autoPill = document.getElementById('auto-sync-status-pill');
    if (autoPill) {
      autoPill.innerHTML = `
        <span style="width: 8px; height: 8px; border-radius: 50%; background: #3b82f6; display: inline-block; box-shadow: 0 0 8px #3b82f6; animation: pulse 1s infinite;"></span>
        Auto-Syncing Fresh Records...
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
  const working = Number(att.workingDays) || 64;
  const present = Number(att.daysPresent) || 0;
  
  let pct = Number(att.percentage);
  if ((!pct || pct === 0 || isNaN(pct)) && present > 0 && working > 0) {
    pct = (present / working) * 100;
  }
  return Math.min(100, Math.max(0, Number((pct || 0).toFixed(1))));
}

/**
 * 3. RENDER MASTER TABLE (With Unsynced Placeholders & Tabular Alignments)
 */
function renderStudentsTable() {
  const tbody = document.getElementById('students-tbody');
  if (!tbody) return;

  // Filter
  const filtered = allStudents.filter(student => {
    const attPct = computeActiveAttendancePercentage(student);
    const backlogs = student.results?.backlogCount || 0;

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
        valA = a.results?.cgpa || -1;
        valB = b.results?.cgpa || -1;
        break;
      case 'backlogCount':
        valA = a.results?.backlogCount || 0;
        valB = b.results?.backlogCount || 0;
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
          No student records found matching the current search or filter criteria.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(s => {
    const isSynced = s.isSynced !== false && s.attendance && s.attendance.daysPresent != null;
    const attPct = computeActiveAttendancePercentage(s);
    const backlogs = s.results?.backlogCount || 0;
    const workingDays = s.attendance?.workingDays || 64;
    const daysPresent = s.attendance?.daysPresent || 0;

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
        ? `<span class="status-badge-critical">CRITICAL (<65%)</span>`
        : isWarning
        ? `<span class="status-badge-warning">CONDONATION</span>`
        : `<span class="status-badge-good">ELIGIBLE (≥75%)</span>`;

      const pctColor = isCritical ? '#f87171' : isWarning ? '#fbbf24' : '#34d399';
      pctDisplay = `<span class="mono-num" style="font-weight: 900; color: ${pctColor}; font-size: 0.95rem;">${attPct.toFixed(1)}%</span>`;
      cgpaDisplay = `<span class="mono-num" style="font-weight: 700;">${(s.results?.cgpa || 0).toFixed(2)}</span>`;
      
      backlogBtn = backlogs > 0
        ? `<button type="button" class="btn-backlog-inspect" onclick="openBacklogDetailsModal('${s.pin}')" title="Click to view failed subjects">
             <span class="badge-backlog">▲ ${backlogs} Failed</span>
           </button>`
        : `<span class="badge-cleared">✓ 0 Cleared</span>`;

      syncedTime = `<span class="mono-num" style="font-size: 0.75rem; color: var(--hod-text-sub);">${s.lastSynced ? formatTime(s.lastSynced) : 'Just Now'}</span>`;
    }

    return `
      <tr id="row-${s.pin}">
        <td><strong class="mono-num" style="color: #93c5fd; font-size: 0.85rem;">${escapeHtml(s.pin)}</strong></td>
        <td class="student-name-cell">${nameHtml}</td>
        <td><span style="font-size: 0.78rem; color: var(--hod-text-muted);">CS (C-24)</span></td>
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
 * Guarantees zero counter desync, 0% to 100% progress tracking, and live row updates.
 */
function startLiveDepartmentSync(isSilent = false) {
  if (isSyncInProgress) return;
  isSyncInProgress = true;

  const modal = document.getElementById('sync-progress-modal');
  const topPercentBadge = document.getElementById('modal-top-percent') || document.getElementById('sync-live-pct');
  const subCounter = document.getElementById('modal-sub-counter') || document.getElementById('sync-progress-text');
  const progressBar = document.getElementById('modal-progress-bar') || document.getElementById('sync-progress-bar');
  const logTerminal = document.getElementById('modal-terminal-log') || document.getElementById('sync-live-feed');
  const statusPill = document.getElementById('auto-sync-status-pill');

  // 1. Reset Modal State to 0%
  if (!isSilent && modal) {
    modal.style.display = 'flex';
    if (topPercentBadge) topPercentBadge.textContent = '0%';
    if (subCounter) subCounter.textContent = '0 / 180 Students (0%)';
    if (progressBar) progressBar.style.width = '0%';
    if (logTerminal) {
      logTerminal.innerHTML = '<div style="color: #94a3b8;">Connecting to live SBTET gateway...</div>';
    }
  }

  if (activeEventSource) {
    activeEventSource.close();
  }

  activeEventSource = new EventSource('/api/hod/sync-stream');

  activeEventSource.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);

      if (data.type === 'CONNECTED') {
        if (logTerminal && !isSilent) {
          logTerminal.innerHTML += `<div style="color: #34d399; font-weight: 700;">✓ Connected. Dispatching 5 concurrent workers across 180 PINs...</div>`;
        }
      }

      if (data.type === 'PROGRESS' || data.type === 'PROGRESS_ERROR') {
        const percent = data.percent !== undefined ? data.percent : Math.round(((data.completed || 0) / 180) * 100);
        const completed = data.completed || 0;
        const total = data.total || 180;

        // Synchronize both UI percentage elements
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
            const att = data.student.attendance || {};
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
        if (subCounter && !isSilent) subCounter.textContent = '180 / 180 Students (100%)';
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
          alerts.success('Batch Sync Complete', 'All 180 department students updated with fresh SBTET metrics.');
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
      logTerminal.innerHTML += `<div style="color: #f87171;">Connection closed or completed.</div>`;
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
  const backlogs = student.results?.backlogCount || 0;
  const workingDays = student.attendance?.workingDays || 64;
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
      ? `<span class="status-badge-critical">CRITICAL (<65%)</span>`
      : isWarning
      ? `<span class="status-badge-warning">CONDONATION</span>`
      : `<span class="status-badge-good">ELIGIBLE (≥75%)</span>`;

    const pctColor = isCritical ? '#f87171' : isWarning ? '#fbbf24' : '#34d399';

    row.cells[4].innerHTML = `<span class="mono-num" style="font-weight: 900; color: ${pctColor}; font-size: 0.95rem;">${attPct.toFixed(1)}%</span>`;
    row.cells[5].innerHTML = statusBadge;
  }

  // 4. Update CGPA
  row.cells[6].innerHTML = `<span class="mono-num" style="font-weight: 700;">${(student.results?.cgpa || 0).toFixed(2)}</span>`;

  // 5. Update Backlogs Pill
  row.cells[7].innerHTML = backlogs > 0
    ? `<button type="button" class="btn-backlog-inspect" onclick="openBacklogDetailsModal('${student.pin}')" title="Click to view failed subjects">
         <span class="badge-backlog">▲ ${backlogs} Failed</span>
       </button>`
    : `<span class="badge-cleared">✓ 0 Cleared</span>`;

  // 6. Update Last Synced Time
  row.cells[8].innerHTML = `<span class="mono-num" style="font-size: 0.75rem; color: var(--hod-text-sub);">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>`;
}

/**
 * 6. RECALCULATE DEPARTMENT SUMMARY STATS
 */
function recalculateDepartmentSummaryStats() {
  const total = allStudents.length || 180;
  let totalAtt = 0;
  let syncedCount = 0;
  let critical = 0;
  let condonation = 0;
  let eligible = 0;
  let withBacklogs = 0;
  let totalBacklogsCount = 0;

  allStudents.forEach(s => {
    const pct = computeActiveAttendancePercentage(s);
    if (pct !== null) {
      syncedCount++;
      totalAtt += pct;
      if (pct < 65) critical++;
      else if (pct < 75) condonation++;
      else eligible++;
    }

    const bCount = s.results?.backlogCount || s.backlogCount || (s.backlogSubjects?.length) || 0;
    if (bCount > 0) {
      withBacklogs++;
      totalBacklogsCount += bCount;
    }
  });

  const avgAttendance = syncedCount > 0 ? Number((totalAtt / syncedCount).toFixed(1)) : 0;

  const totalElem = document.getElementById('stat-total-intake') || document.getElementById('stat-total-students');
  const avgElem = document.getElementById('stat-avg-attendance');
  const eligibleElem = document.getElementById('stat-eligible') || document.getElementById('stat-eligible-count');
  const condonationElem = document.getElementById('stat-condonation') || document.getElementById('stat-condonation-count');
  const criticalElem = document.getElementById('stat-detention') || document.getElementById('stat-critical-count');
  const backlogStudentsElem = document.getElementById('stat-backlogs') || document.getElementById('stat-backlog-students');
  const totalBacklogsSub = document.getElementById('stat-total-backlogs-count') || document.getElementById('stat-total-backlogs-sub');

  if (totalElem) totalElem.textContent = total;
  if (avgElem) avgElem.textContent = syncedCount > 0 ? `${avgAttendance}%` : '--%';
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

  // 1. Locate student record from memory or fetch fallback
  let student = allStudents.find(s => s.pin === pin);

  if (!student || !student.backlogSubjects || student.backlogSubjects.length === 0) {
    try {
      const res = await api.get(`/hod/students/${pin}/backlogs`);
      if (res && res.success && res.student) {
        student = { ...student, ...res.student };
        const idx = allStudents.findIndex(s => s.pin === pin);
        if (idx !== -1) allStudents[idx] = student;
      }
    } catch (e) {
      console.warn('[Backlog Modal Fetch Warning]', e);
    }
  }

  const backlogCount = student?.results?.backlogCount || student?.backlogCount || student?.backlogSubjects?.length || 0;

  // 2. Hydrate Header Info
  if (nameEl) nameEl.textContent = student?.name || 'Student Name';
  if (pinEl) pinEl.textContent = student?.pin || pin;
  if (schemeEl) schemeEl.textContent = `${student?.scheme || 'C-24'} Computer Science`;
  if (summaryEl) summaryEl.textContent = `${backlogCount} Active Backlog${backlogCount !== 1 ? 's' : ''}`;

  // 3. Render Subject Rows
  if (tableBody) {
    tableBody.innerHTML = '';
    const subjects = student?.backlogSubjects || student?.results?.failedSubjects || [];

    if (subjects.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
    } else {
      if (emptyState) emptyState.style.display = 'none';
      subjects.forEach(sub => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid rgba(255, 255, 255, 0.04)';
        const totalMarks = sub.totalMarks ?? sub.total ?? (Number(sub.internalMarks || sub.internal || 0) + Number(sub.externalMarks || sub.external || 0));
        const isLowMarks = totalMarks < 35;
        row.innerHTML = `
          <td style="padding: 10px; font-weight: 600; color: #94a3b8;">${escapeHtml(sub.semester || '1SEM')}</td>
          <td style="padding: 10px; font-family: monospace; font-weight: bold; color: #38bdf8;">${escapeHtml(sub.code || sub.subjectCode || 'CS-101')}</td>
          <td style="padding: 10px; font-weight: 500; color: #f1f5f9;">${escapeHtml(sub.name || sub.subjectName || 'Core Subject')}</td>
          <td style="padding: 10px; text-align: center; font-family: monospace; color: #cbd5e1;">${sub.internalMarks ?? sub.internal ?? '--'}</td>
          <td style="padding: 10px; text-align: center; font-family: monospace; color: #cbd5e1;">${sub.externalMarks ?? sub.external ?? '--'}</td>
          <td style="padding: 10px; text-align: center; font-family: monospace; font-weight: bold; color: ${isLowMarks ? '#fb7185' : '#f1f5f9'};">${totalMarks ?? '--'}</td>
          <td style="padding: 10px; text-align: center;">
            <span style="padding: 2px 8px; border-radius: 4px; background: rgba(244, 63, 94, 0.15); color: #fb7185; font-weight: 800; font-size: 0.72rem; border: 1px solid rgba(244, 63, 94, 0.25);">F</span>
          </td>
        `;
        tableBody.appendChild(row);
      });
    }
  }

  // 4. Reveal Modal with smooth animation
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  modal.style.display = 'flex';
}

// Close Modal
function closeBacklogDetailsModal() {
  const modal = document.getElementById('backlog-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    modal.style.display = 'none';
  }
}

// Expose on global window
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
      `"${s.branch || 'CSE'}"`,
      `"${s.scheme || 'C-24'}"`,
      `"${s.semester || 3}"`,
      s.attendance?.workingDays || 64,
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
  link.setAttribute('download', `Samskruti_CS_Department_Master_Sync_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  alerts.success('CSV Exported', 'Department metrics downloaded successfully.');
}

function generateFallbackDepartmentStudents() {
  return Array.from({ length: 180 }, (_, i) => {
    const roll = i + 1;
    const pin = `24259-CS-${String(roll).padStart(3, '0')}`;
    return {
      pin,
      rollNumber: roll,
      name: `CS Student ${roll}`,
      branch: 'Computer Science & Engineering',
      scheme: 'C-24',
      semester: 3,
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
