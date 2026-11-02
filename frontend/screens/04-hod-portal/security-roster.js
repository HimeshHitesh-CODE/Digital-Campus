/**
 * Samskruti College HOD Student Anti-Spoofing Security Keys Roster Controller
 * Continuous Scroll for AIML (120) & CS (180) Students, Real-Time Search, Clipboard Copy, and CSV Export
 */

document.addEventListener('DOMContentLoaded', () => {
  initSecurityRoster();
  initHelpDeskLinks();
});

let currentRosterList = [];
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

function initSecurityRoster() {
  activeDepartment = getActiveDepartment();
  loadDepartmentRoster(activeDepartment);

  bindSearchInput();
  bindDepartmentPills();
  bindActionButtons();
}

function loadDepartmentRoster(dept) {
  activeDepartment = dept;
  if (dept === 'AIML' || dept === 'CS') {
    localStorage.setItem('hod_active_dept', dept);
  }

  const aimlStudents = (typeof window.CampusAimlRoster !== 'undefined') ? 
                       window.CampusAimlRoster.getAll() : [];
  const csStudents = (typeof window.CampusRoster !== 'undefined') ? 
                     window.CampusRoster.getAll() : [];

  if (dept === 'AIML') {
    currentRosterList = [...aimlStudents];
  } else if (dept === 'CS') {
    currentRosterList = [...csStudents];
  } else {
    // All
    currentRosterList = [...aimlStudents, ...csStudents];
  }

  updateHeaderUI();
  updatePillsUI();
  filterRoster();
}

function updateHeaderUI() {
  const hodNameEl = document.getElementById('rosterHodName');
  const hodPinEl = document.getElementById('rosterHodPin');
  const activeKeysBadge = document.getElementById('activeKeysCountBadge');
  const kpiTotalKeys = document.getElementById('kpiTotalKeys');
  const kpiDeptBadge = document.getElementById('kpiDeptBadge');

  const count = currentRosterList.length;

  if (activeDepartment === 'AIML') {
    if (hodNameEl) hodNameEl.textContent = 'PROF. RAMESH';
    if (hodPinEl) hodPinEl.textContent = 'PIN: AIML-HOD';
    if (kpiDeptBadge) kpiDeptBadge.textContent = 'AIML Department';
  } else if (activeDepartment === 'CS') {
    if (hodNameEl) hodNameEl.textContent = 'DR. J. VAMSHI KRISHNA';
    if (hodPinEl) hodPinEl.textContent = 'PIN: VAMSHI-CS-HOD';
    if (kpiDeptBadge) kpiDeptBadge.textContent = 'CS Department';
  } else {
    if (hodNameEl) hodNameEl.textContent = 'INSTITUTIONAL ADMINISTRATION';
    if (hodPinEl) hodPinEl.textContent = 'ALL DEPARTMENTS';
    if (kpiDeptBadge) kpiDeptBadge.textContent = 'Combined Roster';
  }

  if (activeKeysBadge) activeKeysBadge.textContent = `${count} Keys Active`;
  if (kpiTotalKeys) kpiTotalKeys.textContent = count;
}

function updatePillsUI() {
  const aimlBtn = document.getElementById('filterAimlKeys');
  const csBtn = document.getElementById('filterCsKeys');
  const allBtn = document.getElementById('filterAllKeys');

  const activeClass = 'px-4 py-2 rounded-full bg-primary text-white font-dg text-xs font-black uppercase tracking-wider shrink-0 shadow-xs transition-all cursor-pointer';
  const inactiveClass = 'px-4 py-2 rounded-full bg-white hover:bg-stone-100 text-stone-700 border border-stone-200/70 font-dg text-xs font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer';

  if (aimlBtn) aimlBtn.className = activeDepartment === 'AIML' ? activeClass : inactiveClass;
  if (csBtn) csBtn.className = activeDepartment === 'CS' ? activeClass : inactiveClass;
  if (allBtn) allBtn.className = activeDepartment === 'All' ? activeClass : inactiveClass;
}

function bindDepartmentPills() {
  document.getElementById('filterAimlKeys')?.addEventListener('click', () => {
    loadDepartmentRoster('AIML');
    showToast('Viewing AIML Department (120 Anti-Spoofing Keys)');
  });

  document.getElementById('filterCsKeys')?.addEventListener('click', () => {
    loadDepartmentRoster('CS');
    showToast('Viewing CS Department (180 Anti-Spoofing Keys)');
  });

  document.getElementById('filterAllKeys')?.addEventListener('click', () => {
    loadDepartmentRoster('All');
    showToast('Viewing All Departments (300 Anti-Spoofing Keys)');
  });
}

function renderRosterRows(students) {
  const tbody = document.getElementById('securityRosterTbody');
  const visibleCountEl = document.getElementById('visibleCount');
  if (!tbody) return;

  if (visibleCountEl) visibleCountEl.textContent = students.length;

  if (students.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="px-6 py-12 text-center text-stone-500 font-dg text-lg">
          <span class="material-symbols-outlined text-4xl text-stone-400 block mb-2">person_search</span>
          No students found matching your search criteria.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = students.map((s) => {
    const rollPadded = `#${String(s.roll).padStart(3, '0')}`;
    const branchLabel = s.branch === 'AIML' ? 'Artificial Intelligence & Machine Learning (C-24)' : 'Computer Science & Engineering (C-24)';
    const secKey = s.securityKey || 'STD-KEYGEN';
    const mfa = s.mfaStatus || 'Active FIDO2';

    return `
      <tr class="hover:bg-stone-50/80 transition-colors group">
        <td class="py-4 px-4 font-mono text-xs font-bold text-stone-500">${rollPadded}</td>
        <td class="py-4 px-4 font-mono text-xs font-bold text-on-surface">
          <span class="hover:text-emerald-800 transition cursor-pointer copy-pin-btn" data-pin="${s.pin}" title="Click to copy PIN">${s.pin}</span>
        </td>
        <td class="py-4 px-4 font-dg text-[17px] font-bold text-on-surface leading-snug">
          ${escapeHtml(s.name)}
        </td>
        <td class="py-4 px-4">
          <button type="button" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-950 font-mono text-xs font-semibold shadow-2xs hover:bg-emerald-100 hover:border-emerald-400 transition-all cursor-pointer key-copy-pill"
                  data-key="${secKey}" title="Click to copy anti-spoofing security key">
            <span class="material-symbols-outlined text-[14px] text-emerald-800">vpn_key</span>
            <span>${secKey}</span>
            <span class="material-symbols-outlined text-[13px] text-emerald-600 opacity-60 group-hover:opacity-100">content_copy</span>
          </button>
        </td>
        <td class="py-4 px-4 font-dg text-base text-stone-600 font-semibold">
          ${branchLabel}
        </td>
        <td class="py-4 px-4">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-dg text-xs font-bold uppercase tracking-wider shadow-2xs">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-700 animate-pulse"></span>
            ${mfa}
          </span>
        </td>
      </tr>
    `;
  }).join('');

  bindKeyCopyEvents();
}

function bindKeyCopyEvents() {
  document.querySelectorAll('.key-copy-pill').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const key = btn.getAttribute('data-key');
      if (!key) return;

      navigator.clipboard?.writeText(key).catch(() => {});
      if (navigator.vibrate) navigator.vibrate(10);
      showToast(`Copied Anti-Spoofing Key: ${key} to clipboard!`);

      // Visual pulse
      btn.classList.add('bg-emerald-200', 'scale-105');
      setTimeout(() => btn.classList.remove('bg-emerald-200', 'scale-105'), 250);
    });
  });

  document.querySelectorAll('.copy-pin-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pin = btn.getAttribute('data-pin');
      if (!pin) return;
      navigator.clipboard?.writeText(pin).catch(() => {});
      showToast(`Copied PIN: ${pin} to clipboard!`);
    });
  });
}

function bindSearchInput() {
  const search = document.getElementById('rosterSearch') ||
                 document.querySelector('input[placeholder*="Search PIN"]') || 
                 document.querySelector('input[type="text"]');
  if (!search) return;

  search.addEventListener('input', () => {
    filterRoster();
  });
}

function filterRoster() {
  const search = document.getElementById('rosterSearch') ||
                 document.querySelector('input[placeholder*="Search PIN"]') || 
                 document.querySelector('input[type="text"]');
  const query = search ? search.value.toLowerCase().trim() : '';

  const filtered = currentRosterList.filter(s => {
    if (!query) return true;
    return s.pin.toLowerCase().includes(query) ||
           (s.sbtetPin && s.sbtetPin.toLowerCase().includes(query)) ||
           s.name.toLowerCase().includes(query) ||
           (s.securityKey && s.securityKey.toLowerCase().includes(query)) ||
           String(s.roll).includes(query);
  });

  renderRosterRows(filtered);
}

function bindActionButtons() {
  // Scroll to Top Button
  document.getElementById('scrollToTopBtn')?.addEventListener('click', () => {
    const container = document.getElementById('rosterScrollContainer');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // Print Roster
  document.getElementById('printBtn')?.addEventListener('click', () => {
    window.print();
  });

  // Export CSV
  document.getElementById('exportCsvBtn')?.addEventListener('click', () => {
    exportRosterCsv();
  });
}

function exportRosterCsv() {
  let csv = 'Roll,PIN,Student Name,Branch,Scheme,Security Key,MFA Status\n';
  currentRosterList.forEach(s => {
    csv += `"${s.roll}","${s.pin}","${s.name}","${s.branch}","${s.scheme}","${s.securityKey}","${s.mfaStatus}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Samskruti_${activeDepartment}_Security_Keys_Roster_C24.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast(`Official Scheme C-24 ${activeDepartment} Security Roster CSV exported.`);
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

  clearTimeout(window._rosterToastTimeout);
  window._rosterToastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}
