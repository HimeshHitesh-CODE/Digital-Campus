/**
 * Samskruti College HOD Student Anti-Spoofing Security Keys Roster Controller
 * Continuous Scroll for All 180 Students, Real-Time Search, Clipboard Copy, and CSV Export
 */

document.addEventListener('DOMContentLoaded', () => {
  initSecurityRoster();
  initHelpDeskLinks();
});

let currentRosterList = [];
let activeDepartment = 'CS';

function initSecurityRoster() {
  currentRosterList = (typeof window.CampusRoster !== 'undefined') ? window.CampusRoster.getAll() : [];
  render180Students(currentRosterList);
  bindSearchInput();
  bindDepartmentPills();
  bindActionButtons();
}

function render180Students(students) {
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

  tbody.innerHTML = students.map((s, idx) => {
    return `
      <tr class="hover:bg-emerald-50/40 transition-colors group">
        <td class="px-5 py-3.5 whitespace-nowrap">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
              ${s.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div class="font-bold text-stone-900 group-hover:text-emerald-950 transition-colors">${escapeHtml(s.name)}</div>
              <div class="font-mono text-xs text-stone-500">${s.pin} • Roll #${s.roll}</div>
            </div>
          </div>
        </td>
        <td class="px-5 py-3.5 whitespace-nowrap">
          <span class="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 font-mono text-xs font-semibold">
            ${s.scheme}
          </span>
        </td>
        <td class="px-5 py-3.5 whitespace-nowrap">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-900 font-mono text-xs font-bold cursor-pointer hover:bg-emerald-100 active:scale-95 transition-all shadow-2xs key-copy-pill"
               data-key="${s.securityKey}" title="Click to copy security key">
            <span class="material-symbols-outlined text-[15px] text-emerald-700">key</span>
            <span>${s.securityKey}</span>
            <span class="material-symbols-outlined text-[13px] text-emerald-600 opacity-60 group-hover:opacity-100">content_copy</span>
          </div>
        </td>
        <td class="px-5 py-3.5 whitespace-nowrap">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span class="font-medium text-xs text-stone-700">${s.mfaStatus}</span>
          </div>
        </td>
        <td class="px-5 py-3.5 whitespace-nowrap font-mono text-xs text-stone-500">
          ${s.lastSynced}
        </td>
        <td class="px-5 py-3.5 whitespace-nowrap text-right">
          <button class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-semibold shadow-2xs transition active:scale-95 cursor-pointer row-copy-btn"
                  data-key="${s.securityKey}">
            <span class="material-symbols-outlined text-[14px]">content_copy</span>
            <span>Copy Key</span>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  bindKeyCopyEvents();
}

function bindKeyCopyEvents() {
  document.querySelectorAll('.key-copy-pill, .row-copy-btn').forEach(btn => {
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
}

function bindSearchInput() {
  const search = document.querySelector('input[placeholder*="Search by Student Name"]') || 
                 document.querySelector('input[type="text"]');
  if (!search) return;

  search.addEventListener('input', () => {
    filterRoster();
  });
}

function bindDepartmentPills() {
  document.querySelectorAll('button').forEach(btn => {
    const txt = btn.textContent || '';
    if (txt.includes('CS Dept') || txt.includes('AIML Dept') || txt.includes('All Departments')) {
      btn.addEventListener('click', () => {
        document.querySelectorAll('button').forEach(b => {
          if (b.textContent.includes('CS Dept') || b.textContent.includes('AIML Dept') || b.textContent.includes('All Departments')) {
            b.classList.remove('bg-emerald-800', 'text-white', 'shadow-xs');
            b.classList.add('bg-stone-100', 'text-stone-700');
          }
        });
        btn.classList.add('bg-emerald-800', 'text-white', 'shadow-xs');
        btn.classList.remove('bg-stone-100', 'text-stone-700');

        if (txt.includes('AIML')) activeDepartment = 'AIML';
        else if (txt.includes('All')) activeDepartment = 'All';
        else activeDepartment = 'CS';

        filterRoster();
      });
    }
  });
}

function filterRoster() {
  const search = document.querySelector('input[placeholder*="Search by Student Name"]') || 
                 document.querySelector('input[type="text"]');
  const query = search ? search.value.toLowerCase().trim() : '';

  const all = (typeof window.CampusRoster !== 'undefined') ? window.CampusRoster.getAll() : currentRosterList;

  const filtered = all.filter(s => {
    const matchesQuery = !query || s.pin.toLowerCase().includes(query) || s.name.toLowerCase().includes(query) || s.securityKey.toLowerCase().includes(query);
    let matchesDept = true;
    if (activeDepartment === 'AIML') {
      matchesDept = s.roll % 3 === 0; // Simulated AIML subset
    }
    return matchesQuery && matchesDept;
  });

  render180Students(filtered);
}

function bindActionButtons() {
  // Scroll to Top Button
  document.getElementById('scrollToTopBtn')?.addEventListener('click', () => {
    const container = document.getElementById('rosterScrollContainer');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // Download 180 CSV Button
  document.getElementById('exportCsvBtn')?.addEventListener('click', () => {
    export180Csv();
  });

  // Regenerate Hashes Button
  document.querySelectorAll('button').forEach(btn => {
    const txt = btn.textContent || '';
    if (txt.includes('Regenerate') || txt.includes('Sync All Keys')) {
      btn.addEventListener('click', () => {
        if (navigator.vibrate) navigator.vibrate(20);
        const icon = btn.querySelector('.material-symbols-outlined');
        if (icon) icon.classList.add('animate-spin');

        setTimeout(() => {
          if (icon) icon.classList.remove('animate-spin');
          showToast('Regenerated SHA-256 cryptographic nonces for all 180 enrolled department nodes.');
        }, 800);
      });
    } else if (txt.includes('Print Roster')) {
      btn.addEventListener('click', () => {
        window.print();
      });
    }
  });
}

function export180Csv() {
  const students = (typeof window.CampusRoster !== 'undefined') ? window.CampusRoster.getAll() : currentRosterList;
  let csv = 'Roll,PIN,Student Name,Scheme,Branch,Security Key,MFA Status,Attendance %,Status,Last Synced\\n';

  students.forEach(s => {
    csv += `"${s.roll}","${s.pin}","${s.name}","${s.scheme}","${s.branch}","${s.securityKey}","${s.mfaStatus}","${s.attendance}%","${s.status}","${s.lastSynced}"\\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Samskruti_CS_180_Security_Keys_Roster_C24.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('Official Scheme C-24 180-Student Security Roster CSV exported successfully.');
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

  clearTimeout(window._rosterToastTimeout);
  window._rosterToastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}
