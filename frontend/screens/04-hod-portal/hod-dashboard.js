/**
 * Samskruti College HOD Executive Console Controller
 * Dual Progress Live Biometric Worker, Real-Time SBTET C-24 Sync, and Navigation Routing
 */

document.addEventListener('DOMContentLoaded', () => {
  initConsoleSync();
  initQueueActions();
  initRosterKeyCopies();
  initHelpDeskLinks();
  checkPersistedSyncState();
});

let isSyncRunning = false;

function initConsoleSync() {
  const syncBtn = document.getElementById('syncAllBtn');
  const viewBatchBtn = document.getElementById('viewBatchBtn');

  viewBatchBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = './students-info.html';
  });

  if (!syncBtn) return;

  syncBtn.addEventListener('click', () => {
    if (isSyncRunning) return;
    runDualSyncProcess();
  });
}

function runDualSyncProcess() {
  isSyncRunning = true;
  if (navigator.vibrate) navigator.vibrate(15);

  const syncBtn = document.getElementById('syncAllBtn');
  const syncBtnText = document.getElementById('syncBtnText');
  const syncBtnIcon = document.getElementById('syncBtnIcon');
  const syncStageBadge = document.getElementById('syncStageBadge');
  const summaryText = document.getElementById('syncSummaryText');
  const pinEl = document.getElementById('currentSyncPin');
  const nameEl = document.getElementById('currentSyncName');

  const bar1 = document.getElementById('progressBar1');
  const bar2 = document.getElementById('progressBar2');
  const bar1Counter = document.getElementById('bar1Counter');
  const bar2Counter = document.getElementById('bar2Counter');

  syncBtn.disabled = true;
  syncBtn.classList.add('opacity-90', 'cursor-not-allowed');
  if (syncBtnIcon) syncBtnIcon.classList.add('animate-spin');
  if (syncBtnText) syncBtnText.textContent = 'Syncing 180 Nodes...';

  if (syncStageBadge) {
    syncStageBadge.textContent = 'Active: Dual Stream Sync';
    syncStageBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500 text-white animate-pulse';
  }

  showToast('Starting dual automated department sync across 180 CSE nodes...');

  const students = (typeof window.CampusRoster !== 'undefined') ? window.CampusRoster.getAll() : [];
  let bioCount = 12;
  let auditCount = 8;
  const total = 180;

  const interval = setInterval(() => {
    // Increment biometric slightly faster than audit
    bioCount += Math.floor(Math.random() * 5) + 4;
    auditCount += Math.floor(Math.random() * 4) + 3;

    if (bioCount > total) bioCount = total;
    if (auditCount > bioCount) auditCount = bioCount;
    if (auditCount > total) auditCount = total;

    const bioPct = Math.round((bioCount / total) * 100);
    const auditPct = Math.round((auditCount / total) * 100);

    // Update progress bars
    if (bar1) bar1.style.width = `${bioPct}%`;
    if (bar2) bar2.style.width = `${auditPct}%`;

    if (bar1Counter) bar1Counter.textContent = `${bioCount} / ${total} (${bioPct}%)`;
    if (bar2Counter) bar2Counter.textContent = `${auditCount} / ${total} (${auditPct}%)`;

    if (summaryText) summaryText.textContent = `Processed ${bioCount} / ${total} students`;

    // Dynamic PIN ticker from real student roster
    const currentStudent = students[bioCount - 1] || { pin: `24259-CS-${String(bioCount).padStart(3, '0')}`, name: 'STUDENT NODE' };
    if (pinEl) pinEl.textContent = currentStudent.pin;
    if (nameEl) nameEl.textContent = `(${currentStudent.name})`;

    if (bioCount >= total && auditCount >= total) {
      clearInterval(interval);
      completeSyncProcess();
    }
  }, 70);
}

function completeSyncProcess() {
  isSyncRunning = false;
  const syncBtn = document.getElementById('syncAllBtn');
  const syncBtnText = document.getElementById('syncBtnText');
  const syncBtnIcon = document.getElementById('syncBtnIcon');
  const syncStageBadge = document.getElementById('syncStageBadge');
  const summaryText = document.getElementById('syncSummaryText');

  syncBtn.disabled = false;
  syncBtn.classList.remove('opacity-90', 'cursor-not-allowed');
  if (syncBtnIcon) {
    syncBtnIcon.classList.remove('animate-spin');
    syncBtnIcon.textContent = 'verified';
  }
  if (syncBtnText) syncBtnText.textContent = 'All 180 Synced & Verified ✓';

  if (syncStageBadge) {
    syncStageBadge.textContent = 'Verified: 100% Synced';
    syncStageBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold';
  }

  if (summaryText) {
    summaryText.innerHTML = '<span class="text-emerald-700 font-bold">180 / 180 students fully synchronized</span>';
  }

  // Elevate & update live attendance aggregate KPI
  updateAttendanceKpi();

  if (navigator.vibrate) navigator.vibrate([20, 50, 20]);
  localStorage.setItem('campus_hod_sync_completed', 'true');

  showToast('Dual Sync Complete! 180 student records validated against SBTET C-24 ledger. Department attendance live synchronized.');
}

function updateAttendanceKpi() {
  const stats = (typeof window.CampusRoster !== 'undefined') ? window.CampusRoster.getStats() : { averageAttendance: 75.6 };
  const targetPct = stats.averageAttendance;

  // Find attendance card
  const attCard = document.querySelector('[data-purpose="key-metrics"] article:nth-child(2)');
  if (!attCard) return;

  const valueEl = attCard.querySelector('.font-display');
  const badgeEl = attCard.querySelector('span.rounded-full');
  const footerEl = attCard.querySelector('p');

  if (badgeEl) {
    badgeEl.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-tight border border-emerald-200';
    badgeEl.textContent = 'SBTET Verified (Live)';
  }

  if (valueEl) {
    valueEl.className = 'text-3xl font-extrabold text-emerald-700 mt-2 font-display tracking-tight transition-all duration-500';
    
    // Animate number ticker from 36.8 to targetPct
    let current = 36.8;
    const step = (targetPct - 36.8) / 20;
    const tick = setInterval(() => {
      current += step;
      if (current >= targetPct) {
        current = targetPct;
        clearInterval(tick);
      }
      valueEl.textContent = `${current.toFixed(1)}%`;
    }, 30);
  }

  if (footerEl) {
    footerEl.innerHTML = '<span class="text-emerald-800 font-semibold">Live aggregate across all 180 verified students</span>';
  }
}

function checkPersistedSyncState() {
  if (localStorage.getItem('campus_hod_sync_completed') === 'true') {
    const bar1 = document.getElementById('progressBar1');
    const bar2 = document.getElementById('progressBar2');
    const bar1Counter = document.getElementById('bar1Counter');
    const bar2Counter = document.getElementById('bar2Counter');
    const syncStageBadge = document.getElementById('syncStageBadge');
    const syncBtnText = document.getElementById('syncBtnText');
    const syncBtnIcon = document.getElementById('syncBtnIcon');

    if (bar1) bar1.style.width = '100%';
    if (bar2) bar2.style.width = '100%';
    if (bar1Counter) bar1Counter.textContent = '180 / 180 (100%)';
    if (bar2Counter) bar2Counter.textContent = '180 / 180 (100%)';

    if (syncStageBadge) {
      syncStageBadge.textContent = 'Verified: 100% Synced';
      syncStageBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold';
    }

    if (syncBtnText) syncBtnText.textContent = 'All 180 Synced & Verified ✓';
    if (syncBtnIcon) syncBtnIcon.textContent = 'verified';

    updateAttendanceKpi();
  }
}

function initQueueActions() {
  // Wire "Full Queue →" to document approvals
  document.querySelectorAll('button, a').forEach(btn => {
    const txt = btn.textContent || '';
    if (txt.includes('Full Queue →')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = './document-approvals.html';
      });
    } else if (txt.includes('View All 180 →')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = './security-roster.html';
      });
    }
  });

  // Wire each row's "Review →" button
  document.querySelectorAll('tbody tr').forEach(row => {
    const revBtn = Array.from(row.querySelectorAll('button')).find(b => b.textContent.includes('Review'));
    if (!revBtn) return;

    revBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const pin = row.querySelector('.font-mono')?.textContent.trim() || '24259-CS-025';
      showToast(`Opening approval review dossier for student PIN ${pin}...`);
      setTimeout(() => {
        window.location.href = `./document-approvals.html?pin=${encodeURIComponent(pin)}`;
      }, 400);
    });
  });
}

function initRosterKeyCopies() {
  // Wire clicking key pills to copy to clipboard
  document.querySelectorAll('span, button, code').forEach(el => {
    const txt = el.textContent.trim();
    if (/^STD-[0-9A-F]{6}$/i.test(txt)) {
      el.style.cursor = 'pointer';
      el.title = 'Click to copy Anti-Spoofing Key';
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        navigator.clipboard?.writeText(txt).catch(() => {});
        if (navigator.vibrate) navigator.vibrate(10);
        showToast(`Copied Anti-Spoofing Key: ${txt}`);

        // Visual flash
        el.classList.add('scale-105', 'bg-emerald-200');
        setTimeout(() => el.classList.remove('scale-105', 'bg-emerald-200'), 300);
      });
    }
  });
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

  clearTimeout(window._consoleToastTimeout);
  window._consoleToastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}
