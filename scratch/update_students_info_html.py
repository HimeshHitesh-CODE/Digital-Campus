import re

base_file = r'frontend/screens/04-hod-portal/students-info.html'
with open(base_file, 'r', encoding='utf-8') as f:
    html = f.read()

# Make sure campus-180-roster.js is in head
if '/js/campus-180-roster.js' not in html:
    html = html.replace('<script src="/js/stitch-state.js"></script>', '<script src="/js/campus-180-roster.js"></script>\n  <script src="/js/stitch-state.js"></script>')

# Remove bottom backlog drawer section completely
html = re.sub(r'<!-- Backlog Drawer Section -->[\s\S]*?</div>\s*</div>\s*</div>\s*</section>', '', html)
html = re.sub(r'<div class="rounded-\[28px\] bg-\[#fbfcfb\][\s\S]*?id="backlogDossierDrawer"[\s\S]*?</div>\s*</div>\s*</div>', '', html)

# Replace the table pagination with continuous scroll bar
pager_pattern = r'<!-- Pagination row -->[\s\S]*?</div>\s*</div>\s*</div>\s*</section>'

continuous_scroll_footer = """<!-- Infinite Scroll Master Status Bar -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 pb-1 border-t border-slate-200">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span class="font-mono text-xs text-slate-700">
          Displaying all <strong class="text-slate-900 font-bold" id="studentsVisibleCount">180</strong> of 180 students registered in Batch 2024–25 (Continuous Scroll Active)
        </span>
      </div>
      <div class="flex items-center gap-2">
        <button id="scrollToTopStudentsBtn" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer" type="button">
          <span class="material-symbols-outlined text-[16px]">arrow_upward</span>
          <span>Scroll to Top</span>
        </button>
        <button id="exportStudentsCsvBtn" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold transition cursor-pointer" type="button">
          <span class="material-symbols-outlined text-[16px]">download</span>
          <span>Export 180 Cohort CSV</span>
        </button>
      </div>
    </div>
  </div>
</section>"""

html = re.sub(pager_pattern, continuous_scroll_footer, html)

# Wrap table in a scrollable container with max-h-[640px] and sticky thead
html = re.sub(r'<div class="overflow-x-auto rounded-2xl[^"]*">', '<div class="overflow-x-auto max-h-[640px] overflow-y-auto rounded-2xl border border-slate-200 bg-white/90 shadow-inner" id="studentsScrollContainer">', html)
html = re.sub(r'<thead class="bg-slate-50[^"]*">', '<thead class="sticky top-0 z-10 bg-[#f5f1e8] backdrop-blur-md border-b border-slate-200 shadow-xs">', html)

# Give tbody id
html = re.sub(r'<tbody[^>]*>', '<tbody id="masterStudentsTbody" class="divide-y divide-slate-100 font-sans text-sm">', html)

# Add Backlogs Pop-Up Modal before </body>
backlog_popup_modal = """
  <!-- POP-UP MODAL: Interactive Comprehensive Backlog Dossier -->
  <div id="backlogPopupModal" class="fixed inset-0 z-[60000] hidden flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity duration-300 opacity-0 pointer-events-none">
    <div id="backlogModalCard" class="relative w-full max-w-3xl bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto transform scale-95 transition-transform duration-300 space-y-6">
      
      <!-- Modal Header -->
      <div class="flex items-start justify-between gap-4 pb-4 border-b border-stone-200">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-xl font-bold font-mono shadow-xs shrink-0" id="modalStudentAvatar">
            KH
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-2xl font-bold text-stone-900 font-display" id="modalStudentName">KARNATI HIMESH</h3>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-stone-100 text-stone-700" id="modalStudentPin">24259-CS-025</span>
            </div>
            <p class="text-xs text-stone-500 font-medium mt-0.5" id="modalStudentSubtitle">
              Department of Computer Science &amp; Engineering &bull; Scheme C-24 &bull; Semester IV
            </p>
          </div>
        </div>

        <button id="closeBacklogModal" class="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition cursor-pointer" type="button" aria-label="Close modal">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <!-- KPI Summary Ribbon -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="bg-rose-50/70 border border-rose-200/80 p-3.5 rounded-2xl">
          <span class="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">Backlog Deficit</span>
          <span class="text-2xl font-extrabold text-rose-700 font-display" id="modalBacklogCount">2 Subjects</span>
        </div>
        <div class="bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-2xl">
          <span class="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Semester Attendance</span>
          <span class="text-2xl font-extrabold text-amber-700 font-display" id="modalAttendanceVal">27.8%</span>
        </div>
        <div class="bg-emerald-50/70 border border-emerald-200/80 p-3.5 rounded-2xl">
          <span class="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">SBTET Supply Status</span>
          <span class="text-sm font-extrabold text-emerald-800 mt-1 block" id="modalExamEligibility">Exam Eligible (Fee Pending)</span>
        </div>
      </div>

      <!-- Backlogs Breakdown Table -->
      <div class="space-y-3">
        <h4 class="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
          <span class="material-symbols-outlined text-rose-600 text-[18px]">warning</span>
          <span>Deficit Curricular Units &amp; Marks Trajectory</span>
        </h4>

        <div class="overflow-x-auto rounded-2xl border border-stone-200 bg-stone-50/40">
          <table class="w-full text-left text-xs">
            <thead class="bg-stone-100 text-stone-700 font-bold uppercase tracking-wider border-b border-stone-200">
              <tr>
                <th class="px-4 py-3">Subject Code &amp; Title</th>
                <th class="px-3 py-3">Internals (Deficit)</th>
                <th class="px-3 py-3">End Exam</th>
                <th class="px-3 py-3">Min Passing</th>
                <th class="px-4 py-3">Remedial Allocation</th>
              </tr>
            </thead>
            <tbody id="modalBacklogTbody" class="divide-y divide-stone-200 bg-white font-medium">
              <!-- Rendered dynamically -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Footer Actions -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-200">
        <span class="text-xs text-stone-500 font-medium">
          Official SBTET Scheme C-24 Academic Audit Ledger
        </span>
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <button id="printModalDossierBtn" class="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition cursor-pointer" type="button">
            <span class="material-symbols-outlined text-[16px]">print</span>
            <span>Print Dossier PDF</span>
          </button>
          <button id="messageStudentFromModalBtn" class="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#003519] to-[#047857] hover:opacity-95 text-white text-xs font-bold tracking-wide shadow-md transition active:scale-95 cursor-pointer" type="button">
            <span class="material-symbols-outlined text-[16px]">chat</span>
            <span>Dispatch Directive →</span>
          </button>
        </div>
      </div>

    </div>
  </div>
"""

if '#backlogPopupModal' not in html:
    html = html.replace('<!-- Toast Notification -->', backlog_popup_modal + '\n  <!-- Toast Notification -->')

with open(base_file, 'w', encoding='utf-8') as f:
    f.write(html)

print("Updated students-info.html with continuous scroll and Backlog Pop-Up Modal!")
