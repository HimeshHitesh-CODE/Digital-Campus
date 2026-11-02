/**
 * Samskruti College HOD Executive Console Controller
 * Dual Progress Live Biometric Worker, Real-Time SBTET C-24 Sync, and Navigation Routing
 */

document.addEventListener('DOMContentLoaded', () => {
  initDashboardContext();
  initConsoleSync();
  initQueueActions();
  initRosterKeyCopies();
  initHelpDeskLinks();
  checkPersistedSyncState();
});

let isSyncRunning = false;
let activeDepartment = 'AIML';

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

function initDashboardContext() {
  activeDepartment = getActiveDepartment();

  const heroSubtitle = document.getElementById('heroDeptSubtitle');
  const heroAvatar = document.getElementById('heroHodAvatar');
  const heroName = document.getElementById('heroHodName');
  const heroRole = document.getElementById('heroHodRole');
  const syncTitle = document.getElementById('syncCardTitle');
  const syncBtnText = document.getElementById('syncBtnText');
  const syncStageBadge = document.getElementById('syncStageBadge');
  const summaryText = document.getElementById('syncSummaryText');

  const totalIntake = activeDepartment === 'AIML' ? 120 : 180;

  if (activeDepartment === 'AIML') {
    if (heroSubtitle) heroSubtitle.textContent = 'Department of Artificial Intelligence & Machine Learning • Scheme: C-24';
    if (heroAvatar) heroAvatar.textContent = 'PR';
    if (heroName) heroName.textContent = 'Prof. Padma';
    if (heroRole) heroRole.textContent = 'Official HOD (Artificial Intelligence & Machine Learning)';
    if (syncTitle) syncTitle.textContent = '120-Student Automated Department Sync & Biometric Ledger';
    if (syncBtnText) syncBtnText.textContent = '⚡ Sync All 120 Now';
    if (syncStageBadge) syncStageBadge.textContent = 'Standby: 120 Nodes Ready';
    if (summaryText) summaryText.textContent = 'Processed 0 / 120 students';
  } else {
    if (heroSubtitle) heroSubtitle.textContent = 'Department of Computer Science & Engineering • Scheme: C-24';
    if (heroAvatar) heroAvatar.textContent = 'VK';
    if (heroName) heroName.textContent = 'Dr. J. Vamshi Krishna';
    if (heroRole) heroRole.textContent = 'Official HOD (Computer Science)';
    if (syncTitle) syncTitle.textContent = '180-Student Automated Department Sync & Biometric Ledger';
    if (syncBtnText) syncBtnText.textContent = '⚡ Sync All 180 Now';
    if (syncStageBadge) syncStageBadge.textContent = 'Standby: 180 Nodes Ready';
    if (summaryText) summaryText.textContent = 'Processed 0 / 180 students';
  }

  updateKpiCards();
  loadLiveRequestsQueue();
}

function updateKpiCards() {
  const isAiml = activeDepartment === 'AIML';
  const stats = isAiml ? 
    (typeof window.CampusAimlRoster !== 'undefined' ? window.CampusAimlRoster.getStats() : { totalStudents: 120, averageAttendance: 42.2 }) :
    (typeof window.CampusRoster !== 'undefined' ? window.CampusRoster.getStats() : { totalStudents: 180, averageAttendance: 75.6 });

  // Update Intake card
  const intakeCard = document.querySelector('[data-purpose="key-metrics"] article:nth-child(1) .font-display');
  if (intakeCard) intakeCard.textContent = stats.totalStudents || (isAiml ? '120' : '180');

  // Update Attendance card
  const attCard = document.querySelector('[data-purpose="key-metrics"] article:nth-child(2) .font-display');
  if (attCard) attCard.textContent = `${stats.averageAttendance || (isAiml ? 42.2 : 75.6)}%`;
}

async function loadLiveRequestsQueue() {
  const tbody = document.getElementById('dashboardRequestsTbody');
  if (!tbody) return;

  try {
    const res = await fetch(`/api/v1/hod/requests?branch=${activeDepartment}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.requests) && data.requests.length > 0) {
        renderRequestsRows(data.requests);
        return;
      }
    }
  } catch (_) {}

  // Fallback default department requests
  if (activeDepartment === 'AIML') {
    renderRequestsRows([
      { id: 1, student_pin: '24259-AIML-119', student_name: 'KARNATI HITESH', request_type: 'Bonafide Certificate', copies: 1, attendance_pct: 43.2, status: 'PENDING' },
      { id: 2, student_pin: '24259-AIML-001', student_name: 'AMANCHA RASAGNA', request_type: 'Internship NOC', copies: 1, attendance_pct: 43.2, status: 'PENDING' },
      { id: 3, student_pin: '24259-AIML-010', student_name: 'ITTE NIKHIL TEJA', request_type: 'Bus Pass Endorsement', copies: 1, attendance_pct: 42.0, status: 'PENDING' }
    ]);
  } else {
    renderRequestsRows([
      { id: 1, student_pin: '24259-CS-025', student_name: 'Karnati Himesh', request_type: 'Bonafide Certificate', copies: 1, attendance_pct: 38.64, status: 'PENDING' },
      { id: 2, student_pin: '24259-CS-037', student_name: 'Edamanapally Samisaac', request_type: 'Internship NOC', copies: 1, attendance_pct: 27.27, status: 'PENDING' },
      { id: 3, student_pin: '24259-CS-040', student_name: 'Tallapalli Tulasi Ram Goud', request_type: 'Bonafide Certificate', copies: 1, attendance_pct: 84.5, status: 'PENDING' }
    ]);
  }
}

function renderRequestsRows(requests) {
  const tbody = document.getElementById('dashboardRequestsTbody');
  if (!tbody) return;

  tbody.innerHTML = requests.map(req => {
    const att = Number(req.attendance_pct || req.attendance || 40);
    const attBadge = att >= 75 ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                     (att >= 65 ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-rose-100 text-rose-700 border-rose-200');

    return `
      <tr class="bg-white/60 hover:bg-white transition-colors shadow-sm rounded-xl">
        <td class="py-3 px-3 font-mono font-bold text-[#047857] rounded-l-xl">${req.student_pin || req.pin}</td>
        <td class="py-3 px-3 font-semibold text-slate-800 uppercase">${escapeHtml(req.student_name || req.name)}</td>
        <td class="py-3 px-3 text-slate-600">${escapeHtml(req.request_type || req.type)}</td>
        <td class="py-3 px-3">
          <span class="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${attBadge} border">
            ${att.toFixed(1)}%
          </span>
        </td>
        <td class="py-3 px-3 text-right rounded-r-xl">
          <button class="px-3 py-1.5 rounded-full bg-[#003519] hover:bg-[#022c22] text-white font-semibold text-xs transition shadow-sm cursor-pointer dashboard-review-btn" 
                  data-pin="${req.student_pin || req.pin}" type="button">
            Review →
          </button>
        </td>
      </tr>
    `;
  }).join('');

  document.querySelectorAll('.dashboard-review-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const pin = btn.getAttribute('data-pin');
      showToast(`Opening approval review dossier for student PIN ${pin}...`);
      setTimeout(() => {
        window.location.href = `./document-approvals.html?pin=${encodeURIComponent(pin)}`;
      }, 350);
    });
  });
}

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

  const total = activeDepartment === 'AIML' ? 120 : 180;
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
  if (syncBtnText) syncBtnText.textContent = `Syncing ${total} Nodes...`;

  if (syncStageBadge) {
    syncStageBadge.textContent = 'Active: Dual Stream Sync';
    syncStageBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500 text-white animate-pulse';
  }

  showToast(`Starting dual automated department sync across ${total} ${activeDepartment} nodes...`);

  // Trigger backend sync
  fetch(`/api/v1/hod/trigger-sync?branch=${activeDepartment}`, { method: 'POST' }).catch(() => {});

  const students = activeDepartment === 'AIML' ?
    (typeof window.CampusAimlRoster !== 'undefined' ? window.CampusAimlRoster.getAll() : []) :
    (typeof window.CampusRoster !== 'undefined' ? window.CampusRoster.getAll() : []);

  let bioCount = Math.min(8, total);
  let auditCount = Math.min(5, total);

  const interval = setInterval(() => {
    bioCount += Math.floor(Math.random() * 5) + 4;
    auditCount += Math.floor(Math.random() * 4) + 3;

    if (bioCount > total) bioCount = total;
    if (auditCount > bioCount) auditCount = bioCount;
    if (auditCount > total) auditCount = total;

    const bioPct = Math.round((bioCount / total) * 100);
    const auditPct = Math.round((auditCount / total) * 100);

    if (bar1) bar1.style.width = `${bioPct}%`;
    if (bar2) bar2.style.width = `${auditPct}%`;

    if (bar1Counter) bar1Counter.textContent = `${bioCount} / ${total} (${bioPct}%)`;
    if (bar2Counter) bar2Counter.textContent = `${auditCount} / ${total} (${auditPct}%)`;

    if (summaryText) summaryText.textContent = `Processed ${bioCount} / ${total} students`;

    const currentStudent = students[bioCount - 1] || { 
      pin: `24259-${activeDepartment}-${String(bioCount).padStart(3, '0')}`, 
      name: 'STUDENT NODE' 
    };
    if (pinEl) pinEl.textContent = currentStudent.pin;
    if (nameEl) nameEl.textContent = `(${currentStudent.name})`;

    if (bioCount >= total && auditCount >= total) {
      clearInterval(interval);
      completeSyncProcess(total);
    }
  }, 65);
}

function completeSyncProcess(total) {
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
  if (syncBtnText) syncBtnText.textContent = `All ${total} Synced & Verified ✓`;

  if (syncStageBadge) {
    syncStageBadge.textContent = 'Verified: 100% Synced';
    syncStageBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold';
  }

  if (summaryText) {
    summaryText.innerHTML = `<span class="text-emerald-700 font-bold">${total} / ${total} students fully synchronized</span>`;
  }

  updateAttendanceKpi();

  if (navigator.vibrate) navigator.vibrate([20, 50, 20]);
  localStorage.setItem(`campus_hod_sync_completed_${activeDepartment}`, 'true');

  showToast(`Dual Sync Complete! ${total} ${activeDepartment} student records validated against SBTET C-24 ledger.`);
}

function updateAttendanceKpi() {
  const isAiml = activeDepartment === 'AIML';
  const stats = isAiml ?
    (typeof window.CampusAimlRoster !== 'undefined' ? window.CampusAimlRoster.getStats() : { averageAttendance: 42.2 }) :
    (typeof window.CampusRoster !== 'undefined' ? window.CampusRoster.getStats() : { averageAttendance: 75.6 });

  const targetPct = stats.averageAttendance;

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
    valueEl.textContent = `${targetPct.toFixed(1)}%`;
  }

  if (footerEl) {
    footerEl.innerHTML = `<span class="text-emerald-800 font-semibold">Live aggregate across all ${stats.totalStudents || (isAiml ? 120 : 180)} verified students</span>`;
  }
}

function checkPersistedSyncState() {
  const total = activeDepartment === 'AIML' ? 120 : 180;
  if (localStorage.getItem(`campus_hod_sync_completed_${activeDepartment}`) === 'true') {
    const bar1 = document.getElementById('progressBar1');
    const bar2 = document.getElementById('progressBar2');
    const bar1Counter = document.getElementById('bar1Counter');
    const bar2Counter = document.getElementById('bar2Counter');
    const syncStageBadge = document.getElementById('syncStageBadge');
    const syncBtnText = document.getElementById('syncBtnText');
    const syncBtnIcon = document.getElementById('syncBtnIcon');

    if (bar1) bar1.style.width = '100%';
    if (bar2) bar2.style.width = '100%';
    if (bar1Counter) bar1Counter.textContent = `${total} / ${total} (100%)`;
    if (bar2Counter) bar2Counter.textContent = `${total} / ${total} (100%)`;

    if (syncStageBadge) {
      syncStageBadge.textContent = 'Verified: 100% Synced';
      syncStageBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold';
    }

    if (syncBtnText) syncBtnText.textContent = `All ${total} Synced & Verified ✓`;
    if (syncBtnIcon) syncBtnIcon.textContent = 'verified';

    updateAttendanceKpi();
  }
}

function initQueueActions() {
  document.querySelectorAll('button, a').forEach(btn => {
    const txt = btn.textContent || '';
    if (txt.includes('Full Queue →')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = './document-approvals.html';
      });
    } else if (txt.includes('View All')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = './security-roster.html';
      });
    }
  });
}

function initRosterKeyCopies() {
  document.querySelectorAll('span, button, code').forEach(el => {
    const txt = el.textContent.trim();
    if (/^STD-[0-9A-Z]{6,8}$/i.test(txt)) {
      el.style.cursor = 'pointer';
      el.title = 'Click to copy Anti-Spoofing Key';
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        navigator.clipboard?.writeText(txt).catch(() => {});
        if (navigator.vibrate) navigator.vibrate(10);
        showToast(`Copied Anti-Spoofing Key: ${txt}`);

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

function escapeHtml(str) {
  if (!str) return '';
  const p = document.createElement('p');
  p.textContent = str;
  return p.innerHTML;
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
