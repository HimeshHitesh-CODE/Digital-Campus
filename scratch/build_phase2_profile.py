import os, re

base = r'C:/Users/HiteshHimesh/.gemini/antigravity/scratch/Digital-Campus/stitch_campus_connect_design_system'
profile_stitch = os.path.join(base, 'campus_connect_student_profile_records/code.html')

with open(profile_stitch, 'r', encoding='utf-8') as f:
    stitch_html = f.read()

# Extract from <main to </main>
main_match = re.search(r'<main[\s\S]*?</main>', stitch_html)
if not main_match:
    print("Could not find <main> in profile stitch!")
    exit(1)

main_content = main_match.group(0)

# Replace any top-0 or fixed header issues, wrap properly
profile_html = f"""<!DOCTYPE html>
<html lang="en" class="light">
<head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  <title>Student Profile &amp; Academic Records &bull; Samskruti College (Code: 259)</title>

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
    .dark .glass-card {{
      background: rgba(4, 30, 20, 0.85);
      border-color: rgba(16, 185, 129, 0.2);
    }}
  </style>
</head>

<body class="bg-[#fcfaf6] dark:bg-[#020604] text-stone-800 dark:text-stone-100 font-sans antialiased min-h-screen flex flex-col justify-between relative selection:bg-emerald-500 selection:text-white">
  <!-- Fixed Global Navigation & Floating Dynamic Island Dock will mount via dc-dynamic-island.js -->

  <!-- Top-level main content wrapper with clean padding below the fixed header -->
  <div class="w-full flex-grow pt-[84px] md:pt-[92px]">
    {main_content}
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
          <p class="font-dg text-base text-stone-600 font-medium">Permanent SBTET &amp; AICTE Affiliation. Autonomous Campus Registry &amp; Academic Management Portal.</p>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-2">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-emerald-900/10 shadow-sm">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="font-dg text-sm text-on-surface font-bold">Biometric Sync Online</span>
          </div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 border border-emerald-900/10 shadow-sm">
            <span class="material-symbols-outlined text-emerald-700 text-[16px]">verified</span>
            <span class="font-dg text-sm text-on-surface font-bold">SBTET Verified Hub</span>
          </div>
        </div>
      </div>
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 text-stone-600">
        <span class="font-dg text-base">&copy; 2025 Samskruti College. PIN 24259-CS-025 Registry. All rights reserved.</span>
        <div class="flex items-center gap-4">
          <a class="font-dg text-base font-semibold hover:text-emerald-800 transition-colors" href="#">Academic Regulations</a>
          <a class="font-dg text-base font-semibold hover:text-emerald-800 transition-colors" href="#">Attendance Mandates</a>
          <a class="font-dg text-base font-semibold hover:text-emerald-800 transition-colors" href="#">Campus Support</a>
        </div>
      </div>
    </div>
  </footer>

  <!-- Edit Contact Info Modal -->
  <div id="editContactModal" class="fixed inset-0 z-[11000] hidden flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-sm transition-all duration-300 opacity-0 pointer-events-none">
    <div class="w-full max-w-lg rounded-[32px] bg-white p-6 sm:p-8 shadow-2xl border border-emerald-500/30 transform scale-95 transition-transform duration-300" id="contactModalCard">
      <div class="flex items-center justify-between pb-4 border-b border-stone-200">
        <div class="flex flex-col">
          <span class="font-dg text-sm font-bold uppercase text-emerald-700">Verified Contact Directory</span>
          <h3 class="font-title-editorial text-2xl font-bold text-emerald-950">Update Contact Details</h3>
        </div>
        <button id="closeContactModal" class="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors" type="button">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <form id="contactEditForm" class="space-y-4 pt-4" onsubmit="event.preventDefault(); saveContactDetails();">
        <div class="space-y-1">
          <label class="block font-dg text-base font-bold text-emerald-950">Institutional Email</label>
          <input type="email" id="editEmail" class="w-full px-4 py-2.5 rounded-xl border border-stone-300 font-sans text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50" readonly value="karnati.himesh@samskruti.ac.in"/>
          <p class="font-dg text-xs text-stone-500">Official college email is managed by Administrative IT Office.</p>
        </div>

        <div class="space-y-1">
          <label class="block font-dg text-base font-bold text-emerald-950">Registered Student Mobile</label>
          <input type="tel" id="editMobile" class="w-full px-4 py-2.5 rounded-xl border border-stone-300 font-sans text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" required value="+91 98765 43210"/>
        </div>

        <div class="space-y-1">
          <label class="block font-dg text-base font-bold text-emerald-950">Emergency Parent / Guardian Contact</label>
          <input type="tel" id="editParentContact" class="w-full px-4 py-2.5 rounded-xl border border-stone-300 font-sans text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" required value="+91 98765 43211"/>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3">
          <button type="button" id="cancelContactModal" class="px-5 py-2 rounded-full border border-stone-300 font-dg text-base font-semibold text-stone-600 hover:bg-stone-50 transition-colors">
            Cancel
          </button>
          <button type="submit" class="px-6 py-2 rounded-full bg-gradient-to-r from-emerald-800 to-emerald-600 hover:opacity-95 text-white font-dg text-base font-bold shadow-sm transition-all">
            Save Contact Info
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Toast Notification -->
  <div id="toastNotification" class="fixed bottom-6 right-6 z-[30000] hidden px-5 py-3 rounded-2xl bg-emerald-900 text-white font-dg text-lg font-bold shadow-2xl flex items-center gap-3 border border-emerald-400/40 transform transition-all duration-300">
    <span class="material-symbols-outlined text-emerald-300 text-[22px]" id="toastIcon">check_circle</span>
    <span id="toastMsg">Action completed successfully</span>
  </div>

  <script src="/screens/02-student-portal/profile.js"></script>
</body>
</html>
"""

profile_js = """/**
 * Samskruti College Student Profile Controller
 * Dynamic fill and contact editor logic
 */

document.addEventListener('DOMContentLoaded', () => {
  initProfile();
  initContactModal();
});

function initProfile() {
  if (typeof StitchState === 'undefined') return;
  const user = StitchState.getUser();

  // Dynamic user data binding
  const nameEls = document.querySelectorAll('[data-bind="userName"]');
  nameEls.forEach(el => el.textContent = user.name.toUpperCase());

  const pinEls = document.querySelectorAll('[data-bind="userPin"]');
  pinEls.forEach(el => el.textContent = user.pin || '24259-CS-025');

  // Load custom contact info if stored
  const customContact = localStorage.getItem('dc_student_contact');
  if (customContact) {
    try {
      const data = JSON.parse(customContact);
      if (data.mobile) {
        const mobEl = document.getElementById('displayMobile');
        if (mobEl) mobEl.textContent = data.mobile;
      }
      if (data.parent) {
        const parentEl = document.getElementById('displayParent');
        if (parentEl) parentEl.textContent = data.parent;
      }
    } catch (e) {}
  }
}

function initContactModal() {
  const modal = document.getElementById('editContactModal');
  const card = document.getElementById('contactModalCard');
  const closeBtn = document.getElementById('closeContactModal');
  const cancelBtn = document.getElementById('cancelContactModal');

  // Wire all edit contact triggers
  const editBtns = document.querySelectorAll('button:has(span:contains("Edit Contact Info")), button:contains("Edit Contact Info"), button:contains("Update Contact Phone Numbers")');
  
  // Find buttons by text
  document.querySelectorAll('button').forEach(btn => {
    const txt = btn.textContent || '';
    if (txt.includes('Edit Contact Info') || txt.includes('Update Contact Phone Numbers')) {
      btn.addEventListener('click', openModal);
    }
  });

  function openModal() {
    if (!modal) return;
    modal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
    setTimeout(() => {
      card?.classList.remove('scale-95');
      card?.classList.add('scale-100');
    }, 20);
  }

  function closeModal() {
    if (!modal) return;
    card?.classList.remove('scale-100');
    card?.classList.add('scale-95');
    modal.classList.add('opacity-0', 'pointer-events-none');
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 200);
  }

  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  window.saveContactDetails = function() {
    const mobile = document.getElementById('editMobile')?.value.trim();
    const parent = document.getElementById('editParentContact')?.value.trim();

    localStorage.setItem('dc_student_contact', JSON.stringify({ mobile, parent }));

    // Update live DOM displays if present
    document.querySelectorAll('.font-mono').forEach(el => {
      if (el.textContent.includes('+91 98765 43210') && mobile) {
        el.textContent = mobile;
      }
      if (el.textContent.includes('+91 98765 43211') && parent) {
        el.textContent = parent;
      }
    });

    closeModal();
    showToast('Contact details successfully updated in campus registry!');
  };
}

function showToast(message) {
  const toast = document.getElementById('toastNotification');
  const msgEl = document.getElementById('toastMsg');
  if (!toast) return;

  msgEl.textContent = message;
  toast.classList.remove('hidden');

  clearTimeout(window._profileToastTimeout);
  window._profileToastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}
"""

dest_html = r'C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\profile.html'
dest_js = r'C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\profile.js'

with open(dest_html, 'w', encoding='utf-8') as f:
    f.write(profile_html)

with open(dest_js, 'w', encoding='utf-8') as f:
    f.write(profile_js)

print("Phase 2: profile.html and profile.js successfully created!")
