import os, re

base = r'C:/Users/HiteshHimesh/.gemini/antigravity/scratch/Digital-Campus/stitch_campus_connect_design_system'
console_stitch = os.path.join(base, 'campus_connect_hod_console_dashboard/code.html')

with open(console_stitch, 'r', encoding='utf-8') as f:
    stitch_html = f.read()

# Strip header
no_header = re.sub(r'<header[\s\S]*?</header>', '', stitch_html)

# Extract body content inside <body>...</body>
body_match = re.search(r'<body[^>]*>([\s\S]*?)</body>', no_header)
if not body_match:
    print("Could not find body in console stitch!")
    exit(1)

body_content = body_match.group(1)

# Remove any existing footer or scripts
body_content = re.sub(r'<footer[\s\S]*?</footer>', '', body_content)
body_content = re.sub(r'<script[\s\S]*?</script>', '', body_content)

# Replace all blue-600, blue-700, blue-500, blue-50 with emerald tokens
body_content = body_content.replace('bg-blue-600', 'bg-[#003519]')
body_content = body_content.replace('bg-blue-700', 'bg-[#022c22]')
body_content = body_content.replace('text-blue-600', 'text-[#047857]')
body_content = body_content.replace('text-blue-700', 'text-[#003519]')
body_content = body_content.replace('border-blue-600', 'border-emerald-600')
body_content = body_content.replace('border-blue-200', 'border-emerald-200')
body_content = body_content.replace('bg-blue-50', 'bg-emerald-50')
body_content = body_content.replace('text-blue-800', 'text-emerald-900')
body_content = body_content.replace('from-blue-600 to-indigo-600', 'from-[#003519] via-[#047857] to-[#10b981]')
body_content = body_content.replace('hover:bg-blue-700', 'hover:opacity-95')

# Ensure Review buttons and links route properly
body_content = body_content.replace('href="#"', 'href="javascript:void(0)"')

console_html = f"""<!DOCTYPE html>
<html lang="en" class="light">
<head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  <title>HOD Executive Console &bull; Samskruti College (Code: 259)</title>

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
      background: rgba(255, 255, 255, 0.88);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(220, 215, 205, 0.8);
      box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.02);
    }}
    .hero-mesh {{
      background: linear-gradient(135deg, #022c22 0%, #064e3b 45%, #047857 100%);
    }}
  </style>
</head>

<body class="bg-[#fcfaf6] dark:bg-[#020604] text-stone-800 dark:text-stone-100 font-sans antialiased min-h-screen flex flex-col justify-between relative selection:bg-emerald-500 selection:text-white">
  <!-- Fixed Global Navigation & Floating Dynamic Island Dock will mount via dc-dynamic-island.js -->

  <main class="w-full flex-grow pt-[84px] md:pt-[92px]">
    <div class="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {body_content}
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

  <script src="/screens/04-hod-portal/hod-dashboard.js"></script>
</body>
</html>
"""

console_js = """/**
 * Samskruti College HOD Executive Console Controller
 * Automated 180-Student Sync Worker, KPI Refresh, and Navigation Routing
 */

document.addEventListener('DOMContentLoaded', () => {
  initConsoleSync();
  initQueueActions();
});

function initConsoleSync() {
  const syncBtn = document.querySelector('button:has(span:contains("Sync All 180")), button:contains("Sync All 180")') || 
                  Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Sync All 180'));

  const viewBatchBtn = Array.from(document.querySelectorAll('button, a')).find(b => b.textContent.includes('View Batch'));

  viewBatchBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = './students-info.html';
  });

  if (!syncBtn) return;

  syncBtn.addEventListener('click', () => {
    if (navigator.vibrate) navigator.vibrate(15);

    const progressBar = document.querySelector('.bg-gradient-to-r.from-emerald-500, .bg-emerald-500, [style*="width: 78%"], [style*="width:"]');
    const processedCounter = Array.from(document.querySelectorAll('span, p')).find(el => el.textContent.includes('/ 180'));
    const currentPinBadge = Array.from(document.querySelectorAll('span, code')).find(el => el.textContent.includes('24259-CS-'));

    syncBtn.disabled = true;
    syncBtn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[18px]">sync</span><span>Syncing 180 Students...</span>';

    showToast('Starting automated department biometric sync across 180 CSE nodes...');

    let current = 142;
    const interval = setInterval(() => {
      current += 6;
      if (current > 180) current = 180;

      const pct = Math.round((current / 180) * 100);
      if (progressBar) progressBar.style.width = `${pct}%`;
      if (processedCounter) processedCounter.textContent = `Processed ${current} / 180 students`;
      if (currentPinBadge) currentPinBadge.textContent = `24259-CS-${String(current).padStart(3, '0')}`;

      if (current >= 180) {
        clearInterval(interval);
        syncBtn.disabled = false;
        syncBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">done_all</span><span>All 180 Synced ✓</span>';
        showToast('Batch Synchronization complete! 180 student records validated against SBTET C-24 ledger.');
      }
    }, 120);
  });
}

function initQueueActions() {
  // Wire Review buttons to approvals tab
  document.querySelectorAll('button, a').forEach(btn => {
    const txt = btn.textContent || '';
    if (txt.includes('Review →') || txt.includes('Full Queue →')) {
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
"""

dest_html = r'C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\hod-dashboard.html'
dest_js = r'C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\hod-dashboard.js'

with open(dest_html, 'w', encoding='utf-8') as f:
    f.write(console_html)

with open(dest_js, 'w', encoding='utf-8') as f:
    f.write(console_js)

print("Phase 3: hod-dashboard.html and hod-dashboard.js successfully created!")
