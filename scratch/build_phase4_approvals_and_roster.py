import os, re

base = r'C:/Users/HiteshHimesh/.gemini/antigravity/scratch/Digital-Campus/stitch_campus_connect_design_system'

# -------------------------------------------------------------
# 1. BUILD DOCUMENT APPROVALS (Tab 2)
# -------------------------------------------------------------
appr_stitch = os.path.join(base, 'campus_connect_document_approvals_sign_offs/code.html')
with open(appr_stitch, 'r', encoding='utf-8') as f:
    appr_raw = f.read()

# Extract from <main to </main>
appr_main = re.search(r'<main[\s\S]*?</main>', appr_raw).group(0)

appr_html = f"""<!DOCTYPE html>
<html lang="en" class="light">
<head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  <title>Document Approvals &amp; Sign-Offs &bull; HOD Console (Code: 259)</title>

  <!-- Google Fonts: Plus Jakarta Sans, Darker Grotesque, Newsreader, IBM Plex Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""/>
  <link href="https://fonts.googleapis.com/css2?family=Darker+Grotesque:wght@600;700;800;900&family=IBM+Plex+Mono:wght@500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,500;0,6..72,700;1,6..72,500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <!-- Material Symbols Outlined -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
  <script src="https://unpkg.com/lucide@latest"></script>

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Unified Tailwind Configuration -->
  <script src="/js/stitch-tailwind-config.js"></script>

  <!-- Master Design System Stylesheets -->
  <link rel="stylesheet" href="/css/stitch-design-system.css"/>
  <link rel="stylesheet" href="/css/top-nav.css"/>

  <!-- Client State Engine & Dynamic Island Dock -->
  <script src="/js/stitch-state.js"></script>
  <script src="/js/dc-dynamic-island.js"></script>

  <style>
    .glass-card {{
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(220, 215, 205, 0.8);
      box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.04);
    }}
  </style>
</head>

<body class="bg-[#fcfaf6] dark:bg-[#020604] text-stone-800 dark:text-stone-100 font-sans antialiased min-h-screen flex flex-col justify-between relative selection:bg-emerald-500 selection:text-white">
  <!-- Dynamic Island Dock mounts via dc-dynamic-island.js -->

  <main class="w-full flex-grow pt-[84px] md:pt-[92px]">
    {appr_main}
  </main>

  <!-- Review & Sign-Off Modal -->
  <div id="reviewSignModal" class="fixed inset-0 z-[11000] hidden flex items-center justify-center p-4 bg-emerald-950/65 backdrop-blur-sm transition-all duration-300 opacity-0 pointer-events-none">
    <div class="w-full max-w-xl rounded-[32px] bg-white p-6 sm:p-8 shadow-2xl border border-emerald-500/30 transform scale-95 transition-transform duration-300 space-y-5" id="reviewModalCard">
      <div class="flex items-center justify-between pb-3 border-b border-stone-200">
        <div class="flex flex-col">
          <span class="font-mono text-xs uppercase tracking-wider text-emerald-700 font-bold">HOD Digital Sign-Off Authority</span>
          <h3 class="font-title-editorial text-2xl font-bold text-emerald-950" id="modalStudentTitle">Review Application</h3>
        </div>
        <button id="closeReviewModal" class="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors" type="button">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <!-- Application Details Strip -->
      <div class="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2.5">
        <div class="flex items-center justify-between">
          <span class="font-dg text-base text-stone-600 font-bold">Applicant PIN:</span>
          <span class="font-mono text-base font-bold text-emerald-950" id="modalStudentPin">24259-CS-025</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="font-dg text-base text-stone-600 font-bold">Document Type:</span>
          <span class="font-dg text-base font-extrabold text-emerald-800" id="modalDocType">Bonafide Certificate (1 Copy)</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="font-dg text-base text-stone-600 font-bold">Recorded Biometric Attendance:</span>
          <span class="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-mono text-xs font-bold" id="modalAttendanceBadge">27.78% (Critical Deficit)</span>
        </div>
        <div class="pt-2 border-t border-stone-200">
          <span class="block font-dg text-xs font-bold text-stone-500 uppercase">Stated Purpose</span>
          <p class="font-dg text-base text-stone-800 font-medium mt-0.5" id="modalPurpose">Passport verification and State scholarship document clearance submission.</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
        <button type="button" id="rejectBtn" class="w-full sm:w-auto px-5 py-2.5 rounded-full border border-rose-300 text-rose-700 hover:bg-rose-50 font-dg text-base font-bold transition-all">
          Reject (Attendance Deficit)
        </button>
        <button type="button" id="approveBtn" class="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-800 to-emerald-600 hover:opacity-95 text-white font-dg text-base font-bold shadow-md hover:scale-[1.02] active:scale-95 transition-all">
          Approve &amp; Generate Pickup OTP &rarr;
        </button>
      </div>
    </div>
  </div>

  <!-- Shared Samskruti Institutional Footer -->
  <footer class="w-full bg-[#f3efe6]/90 border-t border-emerald-900/10 mt-16 relative z-10">
    <div class="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-emerald-900/10">
        <div class="flex flex-col gap-1 text-center md:text-left">
          <div class="flex items-center justify-center md:justify-start gap-2">
            <span class="font-title-editorial text-2xl text-emerald-950 font-bold">Samskruti College of Engineering &amp; Technology</span>
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-dg text-sm font-bold">Code 259</span>
          </div>
          <p class="font-dg text-base text-stone-600 font-medium">Head of Department Executive Authority &bull; Department of Computer Science &amp; Engineering.</p>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-2">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-emerald-900/10 shadow-sm">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="font-dg text-sm text-on-surface font-bold">HOD Node 259: Active</span>
          </div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 border border-emerald-900/10 shadow-sm">
            <span class="material-symbols-outlined text-emerald-700 text-[16px]">verified</span>
            <span class="font-dg text-sm text-on-surface font-bold">SBTET Verified Terminal</span>
          </div>
        </div>
      </div>
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 text-stone-600">
        <span class="font-dg text-base">&copy; 2025 Samskruti College. Institutional Administration. All rights reserved.</span>
        <div class="flex items-center gap-4">
          <a class="font-dg text-base font-semibold hover:text-emerald-800 transition-colors" href="./hod-dashboard.html">Console</a>
          <a class="font-dg text-base font-semibold hover:text-emerald-800 transition-colors" href="./document-approvals.html">Approvals</a>
          <a class="font-dg text-base font-semibold hover:text-emerald-800 transition-colors" href="./security-roster.html">Roster</a>
          <a class="font-dg text-base font-semibold hover:text-emerald-800 transition-colors" href="./students-info.html">Students</a>
        </div>
      </div>
    </div>
  </footer>

  <!-- Toast Notification -->
  <div id="toastNotification" class="fixed bottom-6 right-6 z-[30000] hidden px-5 py-3 rounded-2xl bg-emerald-900 text-white font-dg text-lg font-bold shadow-2xl flex items-center gap-3 border border-emerald-400/40 transform transition-all duration-300">
    <span class="material-symbols-outlined text-emerald-300 text-[22px]" id="toastIcon">check_circle</span>
    <span id="toastMsg">Action completed successfully</span>
  </div>

  <script src="/screens/04-hod-portal/document-approvals.js"></script>
</body>
</html>
"""

appr_js = """/**
 * Samskruti College HOD Document Approvals Controller
 * Interactive Filtering, Real-Time Search, Review Modal, and 6-Digit Counter OTP Issuance
 */

document.addEventListener('DOMContentLoaded', () => {
  initApprovals();
});

let activeFilter = 'All';

function initApprovals() {
  bindFilterPills();
  bindSearchInput();
  bindReviewButtons();
  bindModalActions();
}

function bindFilterPills() {
  const pills = document.querySelectorAll('button:has(span:contains("Requests")), button:has(span:contains("Bonafide")), button:has(span:contains("NOC"))') || [];
  
  document.querySelectorAll('button').forEach(btn => {
    const txt = btn.textContent || '';
    if (txt.includes('All Requests') || txt.includes('Bonafide Certificates') || txt.includes('Internship NOC')) {
      btn.addEventListener('click', () => {
        // Clear active
        document.querySelectorAll('button').forEach(b => {
          if (b.textContent.includes('Requests') || b.textContent.includes('Bonafide') || b.textContent.includes('NOC')) {
            b.classList.remove('bg-emerald-800', 'text-white', 'shadow-sm');
            b.classList.add('bg-white', 'text-stone-700');
          }
        });
        btn.classList.add('bg-emerald-800', 'text-white', 'shadow-sm');
        btn.classList.remove('bg-white', 'text-stone-700');

        activeFilter = txt.includes('Bonafide') ? 'Bonafide' : (txt.includes('NOC') ? 'NOC' : 'All');
        filterRows();
      });
    }
  });
}

function bindSearchInput() {
  const search = document.querySelector('input[placeholder*="Search by PIN"]') || document.querySelector('input[type="text"]');
  if (!search) return;

  search.addEventListener('input', () => {
    filterRows();
  });
}

function filterRows() {
  const search = document.querySelector('input[placeholder*="Search by PIN"]') || document.querySelector('input[type="text"]');
  const query = search ? search.value.toLowerCase().trim() : '';

  document.querySelectorAll('tbody tr').forEach(row => {
    const text = row.textContent.toLowerCase();
    const matchesSearch = !query || text.includes(query);
    let matchesFilter = true;

    if (activeFilter === 'Bonafide') {
      matchesFilter = text.includes('bonafide');
    } else if (activeFilter === 'NOC') {
      matchesFilter = text.includes('noc') || text.includes('internship');
    }

    if (matchesSearch && matchesFilter) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

let activeRow = null;

function bindReviewButtons() {
  document.querySelectorAll('tbody tr').forEach(row => {
    const revBtn = Array.from(row.querySelectorAll('button')).find(b => b.textContent.includes('Review & Sign'));
    if (!revBtn) return;

    revBtn.addEventListener('click', (e) => {
      e.preventDefault();
      activeRow = row;

      const name = row.querySelector('.font-bold, .font-semibold')?.textContent.trim() || 'Student';
      const pin = row.querySelector('.font-mono')?.textContent.trim() || '24259-CS-025';
      const docType = row.querySelector('span.rounded-full.bg-emerald-100, span.rounded-full.bg-stone-100')?.textContent.trim() || 'Bonafide Certificate';

      document.getElementById('modalStudentTitle').textContent = `Review: ${name}`;
      document.getElementById('modalStudentPin').textContent = pin;
      document.getElementById('modalDocType').textContent = `${docType} (1 Copy)`;

      openReviewModal();
    });
  });
}

function openReviewModal() {
  const modal = document.getElementById('reviewSignModal');
  const card = document.getElementById('reviewModalCard');
  if (!modal) return;

  modal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
  setTimeout(() => {
    card.classList.remove('scale-95');
    card.classList.add('scale-100');
  }, 20);
}

function closeReviewModal() {
  const modal = document.getElementById('reviewSignModal');
  const card = document.getElementById('reviewModalCard');
  if (!modal) return;

  card.classList.remove('scale-100');
  card.classList.add('scale-95');
  modal.classList.add('opacity-0', 'pointer-events-none');
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 200);
}

function bindModalActions() {
  document.getElementById('closeReviewModal')?.addEventListener('click', closeReviewModal);
  
  // Approve
  document.getElementById('approveBtn')?.addEventListener('click', () => {
    if (navigator.vibrate) navigator.vibrate(20);
    const pin = document.getElementById('modalStudentPin')?.textContent || '24259-CS-025';
    const otp = '584386';

    if (activeRow) {
      const actionCell = activeRow.querySelector('td:last-child');
      if (actionCell) {
        actionCell.innerHTML = `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-bold"><span class="material-symbols-outlined text-[14px]">check_circle</span>Approved (OTP: ${otp})</span>`;
      }
    }

    // Save to StitchState
    if (typeof StitchState !== 'undefined') {
      const requests = StitchState.getRequests();
      if (requests.length > 0) {
        requests[0].status = 'READY FOR PICKUP';
        requests[0].otp = otp;
        localStorage.setItem('stitch_requests', JSON.stringify(requests));
      }
    }

    closeReviewModal();
    showToast(`Approved! 6-Digit Counter Token ${otp} issued for student PIN ${pin}. Ready for desk collection.`);
  });

  // Reject
  document.getElementById('rejectBtn')?.addEventListener('click', () => {
    if (navigator.vibrate) navigator.vibrate(20);
    const pin = document.getElementById('modalStudentPin')?.textContent || '24259-CS-025';

    if (activeRow) {
      const actionCell = activeRow.querySelector('td:last-child');
      if (actionCell) {
        actionCell.innerHTML = `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-mono text-xs font-bold"><span class="material-symbols-outlined text-[14px]">cancel</span>Rejected (Deficit)</span>`;
      }
    }

    closeReviewModal();
    showToast(`Application for ${pin} marked as REJECTED due to statutory attendance deficit.`, 'error');
  });
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toastNotification');
  const msgEl = document.getElementById('toastMsg');
  const iconEl = document.getElementById('toastIcon');
  if (!toast) return;

  msgEl.textContent = message;
  iconEl.textContent = type === 'error' ? 'cancel' : 'check_circle';
  toast.classList.remove('hidden');

  clearTimeout(window._apprToastTimeout);
  window._apprToastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}
"""

with open(r'C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\document-approvals.html', 'w', encoding='utf-8') as f:
    f.write(appr_html)

with open(r'C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\document-approvals.js', 'w', encoding='utf-8') as f:
    f.write(appr_js)

print("Phase 4A: document-approvals.html and .js created successfully!")

# -------------------------------------------------------------
# 2. BUILD SECURITY KEYS ROSTER (Tab 3)
# -------------------------------------------------------------
roster_stitch = os.path.join(base, 'campus_connect_anti_spoofing_security_keys_roster/code.html')
with open(roster_stitch, 'r', encoding='utf-8') as f:
    roster_raw = f.read()

roster_main = re.search(r'<main[\s\S]*?</main>', roster_raw).group(0)

roster_html = f"""<!DOCTYPE html>
<html lang="en" class="light">
<head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  <title>Anti-Spoofing Security Keys Roster &bull; HOD Console (Code: 259)</title>

  <!-- Google Fonts: Plus Jakarta Sans, Darker Grotesque, Newsreader, IBM Plex Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""/>
  <link href="https://fonts.googleapis.com/css2?family=Darker+Grotesque:wght@600;700;800;900&family=IBM+Plex+Mono:wght@500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,500;0,6..72,700;1,6..72,500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <!-- Material Symbols Outlined -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
  <script src="https://unpkg.com/lucide@latest"></script>

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Unified Tailwind Configuration -->
  <script src="/js/stitch-tailwind-config.js"></script>

  <!-- Master Design System Stylesheets -->
  <link rel="stylesheet" href="/css/stitch-design-system.css"/>
  <link rel="stylesheet" href="/css/top-nav.css"/>

  <!-- Client State Engine & Dynamic Island Dock -->
  <script src="/js/stitch-state.js"></script>
  <script src="/js/dc-dynamic-island.js"></script>

  <style>
    .glass-card {{
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(220, 215, 205, 0.8);
      box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.04);
    }}
  </style>
</head>

<body class="bg-[#fcfaf6] dark:bg-[#020604] text-stone-800 dark:text-stone-100 font-sans antialiased min-h-screen flex flex-col justify-between relative selection:bg-emerald-500 selection:text-white">
  <!-- Dynamic Island Dock mounts via dc-dynamic-island.js -->

  <main class="w-full flex-grow pt-[84px] md:pt-[92px]">
    {roster_main}
  </main>

  <!-- Shared Samskruti Institutional Footer -->
  <footer class="w-full bg-[#f3efe6]/90 border-t border-emerald-900/10 mt-16 relative z-10">
    <div class="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-emerald-900/10">
        <div class="flex flex-col gap-1 text-center md:text-left">
          <div class="flex items-center justify-center md:justify-start gap-2">
            <span class="font-title-editorial text-2xl text-emerald-950 font-bold">Samskruti College of Engineering &amp; Technology</span>
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-dg text-sm font-bold">Code 259</span>
          </div>
          <p class="font-dg text-base text-stone-600 font-medium">Anti-Spoofing Cryptographic Key Directory &bull; SBTET Scheme C-24.</p>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-2">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-emerald-900/10 shadow-sm">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="font-dg text-sm text-on-surface font-bold">180 Keys Enrolled</span>
          </div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 border border-emerald-900/10 shadow-sm">
            <span class="material-symbols-outlined text-emerald-700 text-[16px]">verified</span>
            <span class="font-dg text-sm text-on-surface font-bold">SHA-256 Validated</span>
          </div>
        </div>
      </div>
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 text-stone-600">
        <span class="font-dg text-base">&copy; 2025 Samskruti College. Institutional Administration. All rights reserved.</span>
        <div class="flex items-center gap-4">
          <a class="font-dg text-base font-semibold hover:text-emerald-800 transition-colors" href="./hod-dashboard.html">Console</a>
          <a class="font-dg text-base font-semibold hover:text-emerald-800 transition-colors" href="./document-approvals.html">Approvals</a>
          <a class="font-dg text-base font-semibold hover:text-emerald-800 transition-colors" href="./security-roster.html">Roster</a>
          <a class="font-dg text-base font-semibold hover:text-emerald-800 transition-colors" href="./students-info.html">Students</a>
        </div>
      </div>
    </div>
  </footer>

  <!-- Toast Notification -->
  <div id="toastNotification" class="fixed bottom-6 right-6 z-[30000] hidden px-5 py-3 rounded-2xl bg-emerald-900 text-white font-dg text-lg font-bold shadow-2xl flex items-center gap-3 border border-emerald-400/40 transform transition-all duration-300">
    <span class="material-symbols-outlined text-emerald-300 text-[22px]" id="toastIcon">check_circle</span>
    <span id="toastMsg">Action completed successfully</span>
  </div>

  <script src="/screens/04-hod-portal/security-roster.js"></script>
</body>
</html>
"""

roster_js = """/**
 * Samskruti College Anti-Spoofing Security Keys Roster Controller
 * Clipboard Copying, Filtering, Print Roster, and Master Hash Regeneration
 */

document.addEventListener('DOMContentLoaded', () => {
  initRoster();
});

function initRoster() {
  bindCopyKeyPills();
  bindDepartmentFilter();
  bindRosterSearch();
  bindActionButtons();
}

function bindCopyKeyPills() {
  document.querySelectorAll('code, span').forEach(el => {
    const text = el.textContent.trim();
    if (text.startsWith('STD-')) {
      el.style.cursor = 'pointer';
      el.title = 'Click to copy Anti-Spoofing Key';
      el.classList.add('hover:scale-105', 'active:scale-95', 'transition-transform');

      el.addEventListener('click', () => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text);
        }
        if (navigator.vibrate) navigator.vibrate(10);
        showToast(`Copied Security Key: ${text}`);
      });
    }
  });
}

function bindDepartmentFilter() {
  document.querySelectorAll('button').forEach(btn => {
    const txt = btn.textContent || '';
    if (txt.includes('CS Dept') || txt.includes('AIML Dept') || txt.includes('All Departments')) {
      btn.addEventListener('click', () => {
        document.querySelectorAll('button').forEach(b => {
          if (b.textContent.includes('Dept') || b.textContent.includes('All Departments')) {
            b.classList.remove('bg-emerald-800', 'text-white', 'shadow-sm');
            b.classList.add('bg-white', 'text-stone-700');
          }
        });
        btn.classList.add('bg-emerald-800', 'text-white', 'shadow-sm');
        btn.classList.remove('bg-white', 'text-stone-700');

        showToast(`Filtered roster: ${txt.trim().split('\\n')[0]}`);
      });
    }
  });
}

function bindRosterSearch() {
  const search = document.querySelector('input[placeholder*="Search PIN"]') || document.querySelector('input[type="text"]');
  if (!search) return;

  search.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    document.querySelectorAll('tbody tr').forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = (!query || text.includes(query)) ? '' : 'none';
    });
  });
}

function bindActionButtons() {
  // Print button
  document.querySelectorAll('button').forEach(btn => {
    const txt = btn.textContent || '';
    if (txt.includes('Print Roster') || txt.includes('print')) {
      btn.addEventListener('click', () => {
        window.print();
      });
    } else if (txt.includes('Regenerate') || txt.includes('Master Hash')) {
      btn.addEventListener('click', () => {
        btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[18px]">sync</span><span>Revalidating...</span>';
        setTimeout(() => {
          btn.innerHTML = '<span class="material-symbols-outlined text-[18px]">verified</span><span>Hash Validated ✓</span>';
          showToast('Master cryptographic salt & SHA-256 integrity hash re-validated for Node 259.');
        }, 800);
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
"""

with open(r'C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\security-roster.html', 'w', encoding='utf-8') as f:
    f.write(roster_html)

with open(r'C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\security-roster.js', 'w', encoding='utf-8') as f:
    f.write(roster_js)

print("Phase 4B: security-roster.html and .js created successfully!")
