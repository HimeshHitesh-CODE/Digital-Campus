import os, re

base = r'C:/Users/HiteshHimesh/.gemini/antigravity/scratch/Digital-Campus/stitch_campus_connect_design_system'

# -------------------------------------------------------------
# 1. BUILD STUDENTS INFO & DOSSIER (Tab 4)
# -------------------------------------------------------------
students_stitch = os.path.join(base, 'campus_connect_cs_department_master_students_info_dossier/code.html')
with open(students_stitch, 'r', encoding='utf-8') as f:
    st_raw = f.read()

st_main = re.search(r'<main[\s\S]*?</main>', st_raw).group(0)

# Replace any blue classes if any
st_main = st_main.replace('bg-blue-600', 'bg-[#003519]')
st_main = st_main.replace('text-blue-600', 'text-[#047857]')

st_html = f"""<!DOCTYPE html>
<html lang="en" class="light">
<head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  <title>CS Master Students Info &amp; Dossier &bull; HOD Console (Code: 259)</title>

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
    .tactile-tile {{
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }}
    .tactile-tile:hover {{
      transform: translateY(-3px);
      box-shadow: 0 12px 30px -6px rgba(4, 120, 87, 0.15);
    }}
  </style>
</head>

<body class="bg-[#fcfaf6] dark:bg-[#020604] text-stone-800 dark:text-stone-100 font-sans antialiased min-h-screen flex flex-col justify-between relative selection:bg-emerald-500 selection:text-white">
  <!-- Dynamic Island Dock mounts via dc-dynamic-island.js -->

  <main class="w-full flex-grow pt-[84px] md:pt-[92px]">
    <div class="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {st_main}
    </div>
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
          <p class="font-dg text-base text-stone-600 font-medium">Head of Department Executive Authority &bull; Department of Computer Science &amp; Engineering.</p>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-2">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-emerald-900/10 shadow-sm">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="font-dg text-sm text-on-surface font-bold">180 Student Nodes Synced</span>
          </div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 border border-emerald-900/10 shadow-sm">
            <span class="material-symbols-outlined text-emerald-700 text-[16px]">verified</span>
            <span class="font-dg text-sm text-on-surface font-bold">Scheme C-24 Ledger</span>
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

  <script src="/screens/04-hod-portal/students-info.js"></script>
</body>
</html>
"""

st_js = """/**
 * Samskruti College HOD Master Students Info & Dossier Controller
 * Search, Cohort Filters, Backlog Drawer Toggle, Individual Sync, and CSV/PDF Export
 */

document.addEventListener('DOMContentLoaded', () => {
  initStudentsInfo();
});

let activeCohortFilter = 'All';

function initStudentsInfo() {
  bindCohortFilterPills();
  bindStudentSearch();
  bindBacklogDossierDrawer();
  bindRowSyncButtons();
  bindExportButtons();
}

function bindCohortFilterPills() {
  document.querySelectorAll('button').forEach(btn => {
    const txt = btn.textContent || '';
    if (txt.includes('All (180)') || txt.includes('Critical (<65%)') || txt.includes('Warning') || txt.includes('Eligible') || txt.includes('With Backlogs')) {
      btn.addEventListener('click', () => {
        document.querySelectorAll('button').forEach(b => {
          if (b.textContent.includes('All (180)') || b.textContent.includes('Critical') || b.textContent.includes('Warning') || b.textContent.includes('Eligible') || b.textContent.includes('With Backlogs')) {
            b.classList.remove('bg-emerald-800', 'text-white', 'shadow-sm');
            b.classList.add('bg-white', 'text-stone-700');
          }
        });
        btn.classList.add('bg-emerald-800', 'text-white', 'shadow-sm');
        btn.classList.remove('bg-white', 'text-stone-700');

        if (txt.includes('Critical')) activeCohortFilter = 'Critical';
        else if (txt.includes('Warning')) activeCohortFilter = 'Warning';
        else if (txt.includes('Eligible')) activeCohortFilter = 'Eligible';
        else if (txt.includes('With Backlogs')) activeCohortFilter = 'Backlogs';
        else activeCohortFilter = 'All';

        filterStudentRows();
      });
    }
  });
}

function bindStudentSearch() {
  const search = document.querySelector('input[placeholder*="Search student PIN"]') || document.querySelector('input[type="text"]');
  if (!search) return;

  search.addEventListener('input', () => {
    filterStudentRows();
  });
}

function filterStudentRows() {
  const search = document.querySelector('input[placeholder*="Search student PIN"]') || document.querySelector('input[type="text"]');
  const query = search ? search.value.toLowerCase().trim() : '';

  document.querySelectorAll('tbody tr').forEach(row => {
    const text = row.textContent.toLowerCase();
    const matchesSearch = !query || text.includes(query);
    let matchesFilter = true;

    if (activeCohortFilter === 'Critical') {
      matchesFilter = text.includes('critical') || text.includes('detained') || text.includes('deficit');
    } else if (activeCohortFilter === 'Warning') {
      matchesFilter = text.includes('warning') || text.includes('condonable');
    } else if (activeCohortFilter === 'Eligible') {
      matchesFilter = text.includes('eligible') || text.includes('regular');
    } else if (activeCohortFilter === 'Backlogs') {
      matchesFilter = text.includes('backlog') && !text.includes('0 backlogs');
    }

    if (matchesSearch && matchesFilter) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

function bindBacklogDossierDrawer() {
  const drawer = document.getElementById('backlogDossierDrawer') || document.querySelector('[data-purpose="backlog-drawer"]') || document.querySelector('.bg-emerald-50\\/40, .border-emerald-200');
  
  // Wire clicking student rows or backlog pills
  document.querySelectorAll('tbody tr').forEach(row => {
    const backlogPill = Array.from(row.querySelectorAll('span, button')).find(el => el.textContent.includes('Backlog') || el.textContent.includes('Viewing'));
    if (!backlogPill) return;

    backlogPill.style.cursor = 'pointer';
    backlogPill.addEventListener('click', (e) => {
      e.stopPropagation();
      const name = row.querySelector('.font-bold, .font-semibold')?.textContent.trim() || 'Student';
      const pin = row.querySelector('.font-mono')?.textContent.trim() || '24259-CS-025';

      // Update drawer title
      const titleEl = document.querySelector('h3:has(span), h3');
      showToast(`Opened comprehensive backlog dossier for ${name} (${pin})`);

      // Scroll drawer into view
      drawer?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });

  // Wire Print Form button
  document.querySelectorAll('button').forEach(btn => {
    if (btn.textContent.includes('Print Form')) {
      btn.addEventListener('click', () => window.print());
    }
  });
}

function bindRowSyncButtons() {
  document.querySelectorAll('tbody button').forEach(btn => {
    if (btn.textContent.includes('Sync') || btn.querySelector('.material-symbols-outlined')?.textContent === 'sync') {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (navigator.vibrate) navigator.vibrate(10);

        const icon = btn.querySelector('.material-symbols-outlined');
        if (icon) icon.classList.add('animate-spin');

        setTimeout(() => {
          if (icon) icon.classList.remove('animate-spin');
          showToast('Live SBTET punch records synchronized for student.');
        }, 600);
      });
    }
  });
}

function bindExportButtons() {
  document.querySelectorAll('button').forEach(btn => {
    const txt = btn.textContent || '';
    if (txt.includes('CSV')) {
      btn.addEventListener('click', () => {
        showToast('Generating official SBTET Scheme C-24 cohort CSV ledger...');
      });
    } else if (txt.includes('PDF')) {
      btn.addEventListener('click', () => {
        window.print();
      });
    } else if (txt.includes('Live Sync')) {
      btn.addEventListener('click', () => {
        btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[16px]">sync</span><span>Syncing...</span>';
        setTimeout(() => {
          btn.innerHTML = '<span class="material-symbols-outlined text-[16px]">bolt</span><span>Live Sync</span>';
          showToast('Live biometric synchronization complete for 180 department nodes.');
        }, 900);
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
"""

with open(r'C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\students-info.html', 'w', encoding='utf-8') as f:
    f.write(st_html)

with open(r'C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\students-info.js', 'w', encoding='utf-8') as f:
    f.write(st_js)

print("Phase 5A: students-info.html and .js created successfully!")

# -------------------------------------------------------------
# 2. BUILD HOD CAMPUS MESSAGES (Tab 5)
# -------------------------------------------------------------
msg_stitch = os.path.join(base, 'campus_connect_campus_messages_peer_threads/code.html')
with open(msg_stitch, 'r', encoding='utf-8') as f:
    msg_raw = f.read()

# Strip header
msg_no_header = re.sub(r'<header[\s\S]*?</header>', '', msg_raw)

# Extract body
msg_body = re.search(r'<body[^>]*>([\s\S]*?)</body>', msg_no_header).group(1)
msg_body = re.sub(r'<footer[\s\S]*?</footer>', '', msg_body)
msg_body = re.sub(r'<script[\s\S]*?</script>', '', msg_body)

msg_html = f"""<!DOCTYPE html>
<html lang="en" class="light">
<head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  <title>Campus Messages &amp; Faculty Threads &bull; HOD Console (Code: 259)</title>

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
    <div class="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {msg_body}
    </div>
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
          <p class="font-dg text-base text-stone-600 font-medium">Head of Department Executive Authority &bull; Department of Computer Science &amp; Engineering.</p>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-2">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-emerald-900/10 shadow-sm">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="font-dg text-sm text-on-surface font-bold">HOD Node 259: Active</span>
          </div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 border border-emerald-900/10 shadow-sm">
            <span class="material-symbols-outlined text-emerald-700 text-[16px]">verified</span>
            <span class="font-dg text-sm text-on-surface font-bold">Encrypted Relay</span>
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

  <script src="/screens/04-hod-portal/messages.js"></script>
</body>
</html>
"""

msg_js = """/**
 * Samskruti College HOD Campus Messages Controller
 * Real-Time Thread Switching, Interactive Embedded Application Card, and Live Chat Composer
 */

document.addEventListener('DOMContentLoaded', () => {
  initHodMessages();
});

function initHodMessages() {
  bindThreadSwitching();
  bindEmbeddedCardActions();
  bindChatComposer();
}

function bindThreadSwitching() {
  const threads = document.querySelectorAll('article, [data-purpose="conversation-item"]');
  threads.forEach(thread => {
    thread.addEventListener('click', () => {
      // Highlight active thread
      threads.forEach(t => {
        t.classList.remove('bg-emerald-50/90', 'border-emerald-500/70', 'shadow-md');
        t.classList.add('bg-white/60');
      });
      thread.classList.add('bg-emerald-50/90', 'border-emerald-500/70', 'shadow-md');
      thread.classList.remove('bg-white/60');

      const name = thread.querySelector('span.font-bold, span.font-extrabold, h3')?.textContent.trim() || 'Student';
      showToast(`Switched active encrypted communication relay to ${name}`);
    });
  });
}

function bindEmbeddedCardActions() {
  // Wire "Review & Sign Off in Console →" inside embedded card to route to Approvals
  document.querySelectorAll('button').forEach(btn => {
    const txt = btn.textContent || '';
    if (txt.includes('Review & Sign Off in Console')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Routing to Document Approvals & Sign-Offs terminal...');
        setTimeout(() => {
          window.location.href = './document-approvals.html';
        }, 500);
      });
    }
  });
}

function bindChatComposer() {
  const form = document.querySelector('form') || document.querySelector('.pt-3 form');
  const input = document.querySelector('input[placeholder*="Type your message"]') || document.querySelector('input[type="text"]');
  const sendBtn = document.querySelector('button[type="submit"]') || Array.from(document.querySelectorAll('button')).find(b => b.querySelector('.material-symbols-outlined')?.textContent === 'send');

  function sendMessage() {
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    if (navigator.vibrate) navigator.vibrate(10);

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append outgoing bubble
    const stream = document.querySelector('.overflow-y-auto') || document.querySelector('section .flex-grow');
    if (stream) {
      const bubble = document.createElement('div');
      bubble.className = 'flex flex-col items-end gap-1 mt-3';
      bubble.innerHTML = `
        <div class="max-w-[85%] sm:max-w-[70%] p-3.5 sm:p-4 rounded-[22px] rounded-tr-none text-white font-dg text-lg font-medium shadow-sm leading-relaxed" 
             style="background: linear-gradient(135deg, #003519, #047857);">
          ${escapeHtml(text)}
        </div>
        <div class="flex items-center gap-1 px-2 font-dg text-xs text-stone-500 font-bold">
          <span>${timeFormatted}</span>
          <span class="material-symbols-outlined text-[14px] text-emerald-600">done_all</span>
        </div>
      `;
      stream.appendChild(bubble);
      stream.scrollTop = stream.scrollHeight;
    }

    input.value = '';
    showToast('Message dispatched via HOD encrypted relay node.');
  }

  sendBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    sendMessage();
  });

  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
}

function escapeHtml(str) {
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

  clearTimeout(window._hodMsgToastTimeout);
  window._hodMsgToastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}
"""

with open(r'C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\messages.html', 'w', encoding='utf-8') as f:
    f.write(msg_html)

with open(r'C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\messages.js', 'w', encoding='utf-8') as f:
    f.write(msg_js)

print("Phase 5B: HOD messages.html and .js created successfully!")
