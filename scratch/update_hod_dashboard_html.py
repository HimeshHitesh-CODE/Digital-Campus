import re

# Read current hod-dashboard.html
with open(r'frontend/screens/04-hod-portal/hod-dashboard.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the single sync card with the Dual Loading Bar Sync Card
old_sync_card_pattern = r'<section class="glass-card rounded-\[28px\] p-5 md:p-6" data-purpose="sync-status-card">[\s\S]*?</section>'

dual_sync_card = """<section class="glass-card rounded-[28px] p-5 md:p-7 space-y-4" data-purpose="sync-status-card" id="syncStatusSection">
  <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-2">
    <!-- Left: Status title & beacon -->
    <div class="space-y-1.5">
      <div class="flex flex-wrap items-center gap-2.5">
        <span class="relative flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" id="syncPingBeacon"></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" id="syncDotBeacon"></span>
        </span>
        <h3 class="text-base sm:text-lg font-bold text-slate-900 font-display">
          180-Student Automated Department Sync &amp; Biometric Ledger
        </h3>
        <span id="syncStageBadge" class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all">
          Standby: 180 Nodes Ready
        </span>
      </div>
      <p class="text-xs text-slate-600 font-medium">
        Active worker stream: <span class="text-slate-800 font-semibold font-mono" id="syncSummaryText">Processed 12 / 180 students</span>. Currently auditing: 
        <span class="font-mono text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60" id="currentSyncPin">24259-CS-012</span>
        <span class="text-slate-500 font-medium ml-1" id="currentSyncName">(K. SAI MANIDEEP)</span>
      </p>
    </div>

    <!-- Right: Action Buttons -->
    <div class="flex items-center gap-3 shrink-0">
      <button id="syncAllBtn" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#003519] via-[#047857] to-[#10b981] hover:opacity-95 text-white text-xs font-bold tracking-wide shadow-md shadow-emerald-700/20 transition-all active:scale-95 cursor-pointer" type="button">
        <span class="material-symbols-outlined text-[18px]" id="syncBtnIcon">bolt</span>
        <span id="syncBtnText">⚡ Sync All 180 Now</span>
      </button>
      <button id="viewBatchBtn" class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition-all cursor-pointer" type="button">
        <span>View Batch →</span>
      </button>
    </div>
  </div>

  <!-- Dual Loading Bars Container -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200/60">
    <!-- Dual Bar 1: Biometric Hardware Nodes -->
    <div class="space-y-1.5 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/50">
      <div class="flex items-center justify-between text-xs font-semibold text-slate-700">
        <span class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-emerald-700 text-[16px]">fingerprint</span>
          Biometric Hardware Stream
        </span>
        <span class="font-mono text-emerald-800 font-bold" id="bar1Counter">12 / 180 (6%)</span>
      </div>
      <div class="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
        <div id="progressBar1" class="bg-gradient-to-r from-[#047857] to-[#10b981] h-2.5 rounded-full w-[6%] transition-all duration-300 ease-out shadow-xs"></div>
      </div>
      <div class="flex items-center justify-between text-[11px] text-slate-500">
        <span>Sensor Nodes: 8 Gateways</span>
        <span class="text-emerald-700 font-medium">99.8% Hardware Ping</span>
      </div>
    </div>

    <!-- Dual Bar 2: State Board (SBTET) Ledger Audit -->
    <div class="space-y-1.5 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/50">
      <div class="flex items-center justify-between text-xs font-semibold text-slate-700">
        <span class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[#003519] text-[16px]">verified</span>
          SBTET Scheme C-24 Ledger Audit
        </span>
        <span class="font-mono text-slate-800 font-bold" id="bar2Counter">8 / 180 (4%)</span>
      </div>
      <div class="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
        <div id="progressBar2" class="bg-gradient-to-r from-[#003519] to-[#047857] h-2.5 rounded-full w-[4%] transition-all duration-300 ease-out shadow-xs"></div>
      </div>
      <div class="flex items-center justify-between text-[11px] text-slate-500">
        <span>Central Ledger: Node 259</span>
        <span class="text-slate-600 font-medium">TLS 1.3 Hash Verified</span>
      </div>
    </div>
  </div>
</section>"""

html = re.sub(old_sync_card_pattern, dual_sync_card, html)

# Add link to campus-180-roster.js in head
if '/js/campus-180-roster.js' not in html:
    html = html.replace('<script src="/js/stitch-state.js"></script>', '<script src="/js/campus-180-roster.js"></script>\n  <script src="/js/stitch-state.js"></script>')

# Make sure Help desk buttons in header or anywhere link to helpdesk
html = html.replace('href="#help"', 'href="/screens/02-student-portal/helpdesk.html"')

with open(r'frontend/screens/04-hod-portal/hod-dashboard.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Updated hod-dashboard.html with dual progress bar and script imports!")
