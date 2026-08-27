/**
 * Samskruti Digital Campus - Dynamic SBTET Consolidated Academic Results Controller
 * Automatically synchronizes academic results for whoever is logged in.
 */

import { api } from '../../js/api.js';
import { requireAuth } from '../../js/auth-guard.js';
import { renderDock } from '../../js/dock.js';
import { alerts } from '../../js/alerts.js';

// Resolve session of currently logged-in student
const user = requireAuth(['STUDENT', 'HOD', 'HOD_CS', 'ADMIN']);

function getActivePin() {
  const urlParams = new URLSearchParams(window.location.search);
  const queryPin = urlParams.get('pin');
  const storedPin = localStorage.getItem('student_pin');
  return (queryPin || storedPin || user?.sbtetPin || user?.rollNumber || '').trim().toUpperCase();
}

if (user) {
  renderDock('results.html', user.role || 'STUDENT');
}

let activeResultsData = null;
let currentSelectedSem = null;

document.addEventListener('DOMContentLoaded', () => {
  setupUserHeader();
  loadAcademicResults();
  setupSyncButton();
});

function setupUserHeader() {
  const pin = getActivePin();
  const subtitleElem = document.getElementById('student-meta-subtitle');
  if (subtitleElem) {
    subtitleElem.textContent = `Samskruti College (259) • State Board of Technical Education & Training Official Records (PIN: ${pin})`;
  }
}

async function loadAcademicResults() {
  const pin = getActivePin();

  try {
    const res = await api.get('/results', { pin });
    if (res && res.success) {
      renderResultsDashboard(res.data || res.results || res);
    } else {
      throw new Error('Malformed results response');
    }
  } catch (error) {
    console.warn('[Initial Load Fallback]:', error.message);
    triggerLiveSync(false);
  }
}

function setupSyncButton() {
  const syncBtn = document.getElementById('sync-results-btn');
  syncBtn?.addEventListener('click', () => {
    triggerLiveSync(true);
  });
}

async function triggerLiveSync(showFeedback = true) {
  const syncBtn = document.getElementById('sync-results-btn');
  const btnLabel = document.getElementById('sync-btn-label');
  const btnIcon = document.getElementById('sync-btn-icon');
  const pin = getActivePin();

  if (syncBtn) {
    syncBtn.disabled = true;
    if (btnLabel) btnLabel.textContent = 'Syncing SBTET Marks...';
    if (btnIcon) btnIcon.classList.add('spinning');
  }

  if (showFeedback) {
    alerts.info(`Connecting to SBTET Results Gateway for PIN ${pin}...`);
  }

  try {
    const res = await api.post('/results/sync', { pin, force: true });
    if (res && res.success) {
      renderResultsDashboard(res.data || res.results || res);
      if (showFeedback) {
        alerts.success(`SBTET marksheet for ${res.data?.studentName || pin} synchronized successfully!`);
      }
    } else {
      throw new Error(res.message || 'Failed to sync marksheet');
    }
  } catch (err) {
    console.error('[Live Results Sync Error]:', err);
    if (showFeedback) {
      alerts.warning('SBTET Gateway busy. Displaying verified institutional records.');
    }
  } finally {
    if (syncBtn) {
      syncBtn.disabled = false;
      if (btnLabel) btnLabel.textContent = 'Sync Live SBTET Marks';
      if (btnIcon) btnIcon.classList.remove('spinning');
    }
  }
}

function renderResultsDashboard(data) {
  activeResultsData = data;
  const summary = data.summary || {};
  const currentPin = getActivePin();

  // 1. Profile Bar
  const nameElem = document.getElementById('student-display-name');
  const pinElem = document.getElementById('student-display-pin');
  const schemeElem = document.getElementById('student-display-scheme');
  const branchElem = document.getElementById('student-display-branch');

  if (nameElem) nameElem.textContent = data.studentName || user.name || 'Student';
  if (pinElem) pinElem.textContent = data.pin || currentPin;
  if (schemeElem) schemeElem.textContent = data.scheme || 'C24';
  if (branchElem) branchElem.textContent = data.branch || 'CS';

  // 2. Metrics Cards
  const cgpaElem = document.getElementById('res-cgpa');
  const creditsElem = document.getElementById('res-credits');
  const backlogsElem = document.getElementById('res-backlogs');
  const schemeFooter = document.getElementById('res-scheme-footer');
  const semFooter = document.getElementById('res-sem-footer');
  const promoFooter = document.getElementById('res-promotion-footer');

  if (cgpaElem) cgpaElem.textContent = summary.cgpa !== undefined ? summary.cgpa : '0.00';
  if (creditsElem) creditsElem.textContent = summary.creditsRatio || `${summary.creditsGained || 0} / ${summary.totalMaxCredits || 80}`;
  if (backlogsElem) {
    const backlogs = summary.activeBacklogs || 0;
    backlogsElem.textContent = backlogs;
    backlogsElem.style.color = backlogs === 0 ? 'var(--accent-success)' : 'var(--accent-danger)';
  }

  if (schemeFooter) schemeFooter.textContent = `Scheme: ${data.scheme || 'C-24'} Regular`;
  if (semFooter) semFooter.textContent = `Latest Exam: ${summary.latestSemester || 'Current'}`;
  if (promoFooter) promoFooter.textContent = `Status: ${summary.promotionStatus || 'Promoted'}`;

  // 3. Render Semester Tabs
  renderSemesterTabs(data.semesters || {}, data.availableSemesters || []);
}

function renderSemesterTabs(semestersMap, semesterList) {
  const tabContainer = document.getElementById('semester-tab-bar');
  if (!tabContainer) return;

  const sems = semesterList.length > 0 ? semesterList : Object.keys(semestersMap);
  if (sems.length === 0) return;

  // Default to latest semester
  if (!currentSelectedSem || !semestersMap[currentSelectedSem]) {
    currentSelectedSem = sems[sems.length - 1];
  }

  tabContainer.innerHTML = sems.map(semKey => {
    const semNum = semKey.replace(/[^0-9]/g, '') || semKey;
    const label = `${semNum}${getOrdinal(semNum)} Sem`;
    const isActive = semKey === currentSelectedSem ? 'active' : '';

    return `
      <button class="neu-btn neu-btn-sm sem-btn ${isActive}" data-sem="${semKey}">
        ${label}
      </button>
    `;
  }).join('');

  tabContainer.querySelectorAll('.sem-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      tabContainer.querySelectorAll('.sem-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const targetSem = e.currentTarget.getAttribute('data-sem');
      currentSelectedSem = targetSem;
      renderSemesterTable(semestersMap[targetSem], targetSem);
    });
  });

  // Initial Table Render
  renderSemesterTable(semestersMap[currentSelectedSem], currentSelectedSem);
}

function renderSemesterTable(semData, semKey) {
  const headingElem = document.getElementById('semester-heading');
  const subHeadingElem = document.getElementById('semester-subheading');
  const statusBadge = document.getElementById('res-status-badge');
  const tbody = document.getElementById('results-tbody');

  const semNum = (semKey || '').replace(/[^0-9]/g, '') || '1';
  const romanNum = getRoman(semNum);

  if (headingElem) {
    headingElem.textContent = `Semester ${romanNum} Subject Breakdown`;
  }

  if (subHeadingElem && semData?.examMonthYear) {
    subHeadingElem.textContent = `Exam Session: ${semData.examMonthYear} • SBTET Official Record`;
  }

  const subjects = semData?.subjects || [];
  const hasBacklog = subjects.some(s => s.status === 'FAIL');

  if (statusBadge) {
    if (hasBacklog) {
      statusBadge.textContent = 'BACKLOG DETECTED';
      statusBadge.className = 'neu-badge neu-badge-danger';
    } else {
      statusBadge.textContent = 'PASS - ALL CLEARED';
      statusBadge.className = 'neu-badge neu-badge-success';
    }
  }

  if (tbody) {
    if (subjects.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No records available for this semester.</td></tr>`;
      return;
    }

    tbody.innerHTML = subjects.map(sub => {
      const isPass = sub.status === 'PASS';
      const statusClass = isPass ? 'neu-badge-success' : 'neu-badge-danger';

      return `
        <tr>
          <td><code>${sub.code}</code></td>
          <td>${sub.name}</td>
          <td>${sub.internal}</td>
          <td>${sub.external}</td>
          <td><strong>${sub.total}</strong></td>
          <td><span class="grade-pill">${sub.grade}</span></td>
          <td><span class="neu-badge ${statusClass}">${sub.status}</span></td>
        </tr>
      `;
    }).join('');
  }
}

function getOrdinal(n) {
  const num = parseInt(n, 10);
  if (num === 1) return 'st';
  if (num === 2) return 'nd';
  if (num === 3) return 'rd';
  return 'th';
}

function getRoman(n) {
  const num = parseInt(n, 10);
  const romans = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI' };
  return romans[num] || String(n);
}
