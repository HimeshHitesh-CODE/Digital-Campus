import re

base_roster = r'frontend/screens/04-hod-portal/security-roster.html'
with open(base_roster, 'r', encoding='utf-8') as f:
    html = f.read()

# Make sure campus-180-roster.js is in head
if '/js/campus-180-roster.js' not in html:
    html = html.replace('<script src="/js/stitch-state.js"></script>', '<script src="/js/campus-180-roster.js"></script>\n  <script src="/js/stitch-state.js"></script>')

# Replace pagination bar with continuous scroll summary
pager_pattern = r'<!-- Pagination & Master Hash Bar -->[\s\S]*?</div>\s*</div>\s*</div>\s*</section>'

continuous_scroll_footer = """<!-- Infinite Scroll Master Status Bar -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 pb-1 border-t border-stone-200">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span class="font-dg text-base text-stone-700 font-semibold" id="rosterCountStatus">
          Displaying all <strong class="text-on-surface font-mono" id="visibleCount">180</strong> of <strong class="text-on-surface font-mono">180</strong> Computer Science Pre-Allocations (Continuous Scroll)
        </span>
      </div>
      <div class="flex items-center gap-2">
        <button id="scrollToTopBtn" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition cursor-pointer" type="button">
          <span class="material-symbols-outlined text-[16px]">arrow_upward</span>
          <span>Scroll to Top</span>
        </button>
        <button id="exportCsvBtn" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold transition cursor-pointer" type="button">
          <span class="material-symbols-outlined text-[16px]">download</span>
          <span>Download 180 CSV</span>
        </button>
      </div>
    </div>
  </div>
</section>"""

html = re.sub(pager_pattern, continuous_scroll_footer, html)

# Wrap table in a scrollable container with max-h-[640px] and sticky thead
html = re.sub(r'<div class="overflow-x-auto rounded-2xl[^"]*">', '<div class="overflow-x-auto max-h-[640px] overflow-y-auto rounded-2xl border border-stone-200 bg-white/80 shadow-inner" id="rosterScrollContainer">', html)
html = re.sub(r'<thead class="bg-stone-50[^"]*">', '<thead class="sticky top-0 z-10 bg-[#f5f1e8] backdrop-blur-md border-b border-stone-200 shadow-xs">', html)

# Give tbody id
html = re.sub(r'<tbody[^>]*>', '<tbody id="securityRosterTbody" class="divide-y divide-stone-100 font-dg text-base">', html)

with open(base_roster, 'w', encoding='utf-8') as f:
    f.write(html)

print("Updated security-roster.html for continuous scroll!")
