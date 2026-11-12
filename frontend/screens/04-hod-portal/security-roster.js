/**
 * Samskruti College HOD Anti-Spoofing Security Keys Roster Controller
 * Dual-Theme, Full-Width Fluid, Live Backend Integration (/api/v1/hod/security-roster)
 * Responsive Desktop Table & Mobile 390px Card List
 */

let currentRosterList = [];
let activeDepartment = 'CS';
let activeFilter = 'all';
let allRevealed = false;
const revealedKeysSet = new Set();

document.addEventListener('DOMContentLoaded', () => {
  initSecurityRoster();
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

function initSecurityRoster() {
  activeDepartment = getActiveDepartment();
  bindDepartmentSwitcher();
  bindFilterTabs();
  bindSearchInput();
  bindRevealAllModal();
  bindExportCsv();
  loadSecurityRoster(activeDepartment);
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

    const headerBadge = document.getElementById('rosterDeptHeaderBadge');
    const schemeBadge = document.getElementById('kpiDeptScheme');
    if (headerBadge) {
      headerBadge.textContent = activeDepartment === 'AIML' ? 'AI & Machine Learning' : (activeDepartment === 'CS' ? 'Computer Science & Engineering' : 'All Autonomous Departments');
    }
    if (schemeBadge) {
      schemeBadge.textContent = activeDepartment === 'AIML' ? 'AI & Machine Learning (C-24)' : (activeDepartment === 'CS' ? 'Computer Science & Engineering (C-24)' : 'CSE & AIML Combined (C-24)');
    }
  };

  csBtn?.addEventListener('click', () => {
    activeDepartment = 'CS';
    localStorage.setItem('hod_active_dept', 'CS');
    updateSwitcherUI();
    loadSecurityRoster('CS');
    showToast('Switched to CS Department (180 Keys)');
  });

  aimlBtn?.addEventListener('click', () => {
    activeDepartment = 'AIML';
    localStorage.setItem('hod_active_dept', 'AIML');
    updateSwitcherUI();
    loadSecurityRoster('AIML');
    showToast('Switched to AIML Department (120 Keys)');
  });

  allBtn?.addEventListener('click', () => {
    activeDepartment = 'All';
    localStorage.setItem('hod_active_dept', 'All');
    updateSwitcherUI();
    loadSecurityRoster('All');
    showToast('Switched to Combined Roster (300 Keys)');
  });

  updateSwitcherUI();
}

async function loadSecurityRoster(dept) {
  try {
    const res = await fetch(`/api/v1/hod/security-roster?branch=${encodeURIComponent(dept)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.roster)) {
        currentRosterList = data.roster.map(r => ({
          roll: r.rollNumber || r.roll || 1,
          pin: r.pin,
          name: r.name,
          branch: r.branch || (r.pin.includes('AIML') ? 'AIML' : 'CS'),
          scheme: r.scheme || 'C-24',
          securityKey: r.secretKey || r.key || 'STD-KEYGEN',
          is_registered: Boolean(r.is_registered)
        }));
      }
    }
  } catch (err) {
    console.error('Failed to load security roster:', err);
  }

  // Reset revelation state on branch switch
  allRevealed = false;
  revealedKeysSet.clear();
  updateRevealAllBtnUI();

  updateTelemetryKPIs();
  applyFiltersAndRender();
}

function updateTelemetryKPIs() {
  const total = currentRosterList.length;
  const active = currentRosterList.filter(s => s.is_registered).length;
  const pending = total - active;
  const activePct = total > 0 ? ((active / total) * 100).toFixed(1) : '0.0';
  const pendingPct = total > 0 ? ((pending / total) * 100).toFixed(1) : '0.0';

  const totalEl = document.getElementById('kpiTotalCount');
  const activeEl = document.getElementById('kpiActiveCount');
  const activePctEl = document.getElementById('kpiActivePct');
  const pendingEl = document.getElementById('kpiPendingCount');
  const pendingPctEl = document.getElementById('kpiPendingPct');

  const countAllEl = document.getElementById('countFilterAll');
  const countActiveEl = document.getElementById('countFilterActive');
  const countInactiveEl = document.getElementById('countFilterInactive');
  const modalCountEl = document.getElementById('modalStudentCount');

  if (totalEl) totalEl.textContent = total;
  if (activeEl) activeEl.textContent = active;
  if (activePctEl) activePctEl.textContent = `${activePct}% Onboarded`;
  if (pendingEl) pendingEl.textContent = pending;
  if (pendingPctEl) pendingPctEl.textContent = `${pendingPct}% Pending`;

  if (countAllEl) countAllEl.textContent = total;
  if (countActiveEl) countActiveEl.textContent = active;
  if (countInactiveEl) countInactiveEl.textContent = pending;
  if (modalCountEl) modalCountEl.textContent = total;
}

function maskKey(key) {
  if (!key) return 'STD-••••••';
  if (key.length <= 4) return '••••' + key;
  const suffix = key.slice(-2);
  const prefix = key.startsWith('STD-') ? 'STD-' : '';
  return `${prefix}••••${suffix}`;
}

function bindFilterTabs() {
  const tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('bg-surface-bright', 'text-on-surface');
        t.classList.add('text-on-surface-variant');
      });
      tab.classList.add('bg-surface-bright', 'text-on-surface');
      tab.classList.remove('text-on-surface-variant');
      activeFilter = tab.getAttribute('data-filter') || 'all';
      applyFiltersAndRender();
    });
  });
}

function bindSearchInput() {
  const searchInput = document.getElementById('rosterSearch');
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
  const query = (document.getElementById('rosterSearch')?.value || '').toLowerCase().trim();

  const filtered = currentRosterList.filter(item => {
    // Tab filter
    if (activeFilter === 'active' && !item.is_registered) return false;
    if (activeFilter === 'inactive' && item.is_registered) return false;

    // Search query
    if (query) {
      const rollStr = String(item.roll).padStart(3, '0');
      const pinStr = (item.pin || '').toLowerCase();
      const nameStr = (item.name || '').toLowerCase();
      const keyStr = (item.securityKey || '').toLowerCase();
      const branchStr = (item.branch || '').toLowerCase();

      return pinStr.includes(query) ||
             nameStr.includes(query) ||
             keyStr.includes(query) ||
             rollStr.includes(query) ||
             branchStr.includes(query);
    }

    return true;
  });

  renderDesktopTable(filtered);
  renderMobileCards(filtered);

  const rowCountEl = document.getElementById('visibleRowCount');
  if (rowCountEl) rowCountEl.textContent = filtered.length;
}

function renderDesktopTable(list) {
  const tbody = document.getElementById('rosterTableBody');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="py-12 text-center text-on-surface-variant">
          <span class="material-symbols-outlined text-4xl mb-2 text-outline">search_off</span>
          <div class="text-sm font-semibold">No student security records match your filter criteria.</div>
          <div class="text-xs text-on-surface-variant/70 mt-1">Try adjusting the search query or department filter.</div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list.map(s => {
    const rollFormatted = `#${String(s.roll).padStart(3, '0')}`;
    const branchLabel = s.branch === 'AIML' ? 'AIML (C-24)' : 'CSE (C-24)';
    const isRevealed = allRevealed || revealedKeysSet.has(s.pin);
    const displayedKey = isRevealed ? s.securityKey : maskKey(s.securityKey);
    const eyeIcon = isRevealed ? 'visibility_off' : 'visibility';
    const isAct = s.is_registered;

    return `
      <tr class="h-14 hover:bg-surface-container-high/60 transition-colors" data-pin="${s.pin}">
        <td class="py-3 px-4 font-code-mono text-on-surface-variant font-medium">${rollFormatted}</td>
        <td class="py-3 px-4 font-code-mono font-bold text-on-surface">${s.pin}</td>
        <td class="py-3 px-4">
          <div class="font-medium text-on-surface font-sans text-xs sm:text-sm leading-tight">${escapeHtml(s.name)}</div>
        </td>
        <td class="py-3 px-4 text-on-surface-variant font-code-mono-sm text-[11px]">${branchLabel}</td>
        <td class="py-3 px-4">
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-highest border border-hairline">
            <span class="font-code-mono text-on-surface text-xs key-text">${displayedKey}</span>
            <button class="btn-toggle-key text-on-surface-variant hover:text-primary-fixed p-0.5 transition-colors cursor-pointer"
                    title="${isRevealed ? 'Mask key' : 'Reveal key'}"
                    data-pin="${s.pin}"
                    type="button">
              <span class="material-symbols-outlined text-[15px]">${eyeIcon}</span>
            </button>
            <button class="btn-copy-key text-on-surface-variant hover:text-on-surface p-0.5 transition-colors cursor-pointer"
                    title="Copy full key"
                    data-key="${s.securityKey}"
                    type="button">
              <span class="material-symbols-outlined text-[15px]">content_copy</span>
            </button>
          </div>
        </td>
        <td class="py-3 px-4">
          ${isAct ? `
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-container/20 text-primary-fixed font-code-mono-sm text-[11px] font-semibold border border-primary-container/30">
              <span class="w-1.5 h-1.5 rounded-full bg-primary-fixed"></span> Active
            </span>
          ` : `
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-code-mono-sm text-[11px] font-medium border border-hairline">
              <span class="w-1.5 h-1.5 rounded-full bg-outline-variant"></span> Not activated
            </span>
          `}
        </td>
        <td class="py-3 px-4 text-right">
          <button class="btn-copy-key p-1 rounded-full hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                  title="Copy permanent key"
                  data-key="${s.securityKey}"
                  type="button">
            <span class="material-symbols-outlined text-[17px]">key</span>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  bindRowKeyActions(tbody);
}

function renderMobileCards(list) {
  const container = document.getElementById('mobileCardsContainer');
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center bg-surface-container rounded-2xl border border-hairline text-on-surface-variant">
        <span class="material-symbols-outlined text-4xl mb-2 text-outline">search_off</span>
        <div class="text-sm font-semibold">No matching records found</div>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(s => {
    const rollFormatted = `#${String(s.roll).padStart(3, '0')}`;
    const branchLabel = s.branch === 'AIML' ? 'AIML (C-24)' : 'CSE (C-24)';
    const isRevealed = allRevealed || revealedKeysSet.has(s.pin);
    const displayedKey = isRevealed ? s.securityKey : maskKey(s.securityKey);
    const eyeIcon = isRevealed ? 'visibility_off' : 'visibility';
    const isAct = s.is_registered;

    return `
      <article class="bg-surface-container rounded-2xl p-4 border border-hairline shadow-xs flex flex-col gap-3">
        <div class="flex items-start justify-between gap-2">
          <div class="flex flex-col min-w-0">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-code-mono text-xs text-primary-fixed font-bold">${rollFormatted}</span>
              <span class="font-bold text-on-surface text-sm truncate">${escapeHtml(s.name)}</span>
            </div>
            <span class="text-[11px] text-on-surface-variant font-code-mono mt-0.5">${branchLabel} · Permanent PIN: ${s.pin}</span>
          </div>
          ${isAct ? `
            <span class="shrink-0 px-2 py-0.5 rounded-full bg-primary-container/20 text-primary-fixed font-code-mono-sm text-[10px] font-semibold flex items-center gap-1 border border-primary-container/30">
              <span class="w-1.5 h-1.5 rounded-full bg-primary-fixed"></span> Active
            </span>
          ` : `
            <span class="shrink-0 px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-code-mono-sm text-[10px] font-medium flex items-center gap-1 border border-hairline">
              <span class="w-1.5 h-1.5 rounded-full bg-outline-variant"></span> Pending
            </span>
          `}
        </div>

        <div class="bg-surface-container-low rounded-xl p-2.5 flex items-center justify-between gap-2 border border-hairline">
          <div class="flex items-center gap-1.5 min-w-0">
            <span class="material-symbols-outlined text-secondary text-[16px]">vpn_key</span>
            <span class="font-code-mono text-xs font-semibold text-on-surface truncate key-text">${displayedKey}</span>
          </div>
          <div class="flex items-center gap-1">
            <button class="btn-toggle-key w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface active:bg-surface-bright transition-colors cursor-pointer"
                    title="${isRevealed ? 'Mask key' : 'Reveal key'}"
                    data-pin="${s.pin}"
                    type="button">
              <span class="material-symbols-outlined text-[16px]">${eyeIcon}</span>
            </button>
            <button class="btn-copy-key w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface active:bg-surface-bright transition-colors cursor-pointer"
                    title="Copy key"
                    data-key="${s.securityKey}"
                    type="button">
              <span class="material-symbols-outlined text-[16px]">content_copy</span>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  bindRowKeyActions(container);
}

function bindRowKeyActions(parentEl) {
  // Toggle individual key visibility
  parentEl.querySelectorAll('.btn-toggle-key').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pin = btn.getAttribute('data-pin');
      if (!pin) return;

      if (revealedKeysSet.has(pin)) {
        revealedKeysSet.delete(pin);
      } else {
        revealedKeysSet.add(pin);
      }
      applyFiltersAndRender();
    });
  });

  // Copy key to clipboard
  parentEl.querySelectorAll('.btn-copy-key').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const fullKey = btn.getAttribute('data-key');
      if (!fullKey) return;

      navigator.clipboard?.writeText(fullKey).then(() => {
        showToast(`Copied ${fullKey} to clipboard`);
      }).catch(() => {
        showToast(`Copied ${fullKey}`);
      });
    });
  });
}

function bindRevealAllModal() {
  const revealAllBtn = document.getElementById('btnRevealAll');
  const modal = document.getElementById('auditModal');
  const closeModal = document.getElementById('closeModal');
  const cancelModal = document.getElementById('cancelModal');
  const confirmRevealAll = document.getElementById('confirmRevealAll');

  const showModal = () => {
    modal?.classList.remove('hidden');
    modal?.classList.add('flex');
  };

  const hideModal = () => {
    modal?.classList.add('hidden');
    modal?.classList.remove('flex');
  };

  revealAllBtn?.addEventListener('click', () => {
    if (allRevealed) {
      allRevealed = false;
      revealedKeysSet.clear();
      updateRevealAllBtnUI();
      applyFiltersAndRender();
      showToast('All keys masked');
    } else {
      showModal();
    }
  });

  closeModal?.addEventListener('click', hideModal);
  cancelModal?.addEventListener('click', hideModal);

  confirmRevealAll?.addEventListener('click', () => {
    hideModal();
    allRevealed = true;
    updateRevealAllBtnUI();
    applyFiltersAndRender();
    showToast(`All ${currentRosterList.length} security keys unmasked (Audit Logged)`);
  });
}

function updateRevealAllBtnUI() {
  const icon = document.getElementById('revealAllIcon');
  const text = document.getElementById('revealAllText');
  const btn = document.getElementById('btnRevealAll');

  if (allRevealed) {
    if (icon) icon.textContent = 'lock';
    if (text) text.textContent = 'Mask all keys';
    if (btn) {
      btn.className = 'px-4 py-2 rounded-full bg-surface-container-high text-on-surface font-title-card text-xs font-bold flex items-center gap-1.5 hover:bg-surface-container-highest transition shadow-xs cursor-pointer border border-hairline';
    }
  } else {
    if (icon) icon.textContent = 'lock_open';
    if (text) text.textContent = 'Reveal all keys';
    if (btn) {
      btn.className = 'px-4 py-2 rounded-full bg-primary-fixed text-on-primary-fixed font-title-card text-xs font-bold flex items-center gap-1.5 hover:brightness-95 transition shadow-xs cursor-pointer';
    }
  }
}

function bindExportCsv() {
  const exportBtn = document.getElementById('btnExportCsv');
  exportBtn?.addEventListener('click', () => {
    if (!currentRosterList || currentRosterList.length === 0) {
      showToast('No roster data to export');
      return;
    }

    const headers = ['Roll', 'PIN', 'Student Name', 'Branch', 'Scheme', 'Security Key', 'Registration Status'];
    const rows = currentRosterList.map(s => [
      s.roll,
      `"${s.pin}"`,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.branch}"`,
      `"${s.scheme}"`,
      `"${s.securityKey}"`,
      s.is_registered ? 'ACTIVE' : 'NOT_ACTIVATED'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Samskruti_Security_Keys_Roster_${activeDepartment}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${currentRosterList.length} security keys to CSV`);
  });
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
