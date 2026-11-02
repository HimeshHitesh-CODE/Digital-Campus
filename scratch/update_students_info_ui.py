import re

with open(r'frontend/screens/04-hod-portal/students-info.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update thead to be sortable with click handlers and indicators
old_thead_pattern = r'<thead[\s\S]*?</thead>'

new_thead = """<thead class="sticky top-0 z-10 bg-[#f5f8f6] backdrop-blur-md border-b border-slate-200/80 shadow-xs">
  <tr class="text-slate-600 font-dg text-xs font-bold uppercase tracking-wider select-none">
    <th class="py-3.5 px-4 cursor-pointer hover:text-emerald-900 transition-colors sortable-header group" data-sort="pin" title="Click to sort by PIN (Asc/Desc)">
      <div class="flex items-center gap-1">
        <span># PIN</span>
        <span class="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-emerald-700 transition-transform sort-icon" id="sort-icon-pin">unfold_more</span>
      </div>
    </th>
    <th class="py-3.5 px-4 cursor-pointer hover:text-emerald-900 transition-colors sortable-header group" data-sort="name" title="Click to sort by Name (A-Z/Z-A)">
      <div class="flex items-center gap-1">
        <span>Student Name</span>
        <span class="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-emerald-700 transition-transform sort-icon" id="sort-icon-name">unfold_more</span>
      </div>
    </th>
    <th class="py-3.5 px-3 cursor-pointer hover:text-emerald-900 transition-colors sortable-header group" data-sort="branch" title="Click to sort by Branch">
      <div class="flex items-center gap-1">
        <span>Branch</span>
        <span class="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-emerald-700 transition-transform sort-icon" id="sort-icon-branch">unfold_more</span>
      </div>
    </th>
    <th class="py-3.5 px-4 cursor-pointer hover:text-emerald-900 transition-colors sortable-header group" data-sort="days" title="Click to sort by Present Days">
      <div class="flex items-center gap-1">
        <span>Days (Pres/Elap)</span>
        <span class="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-emerald-700 transition-transform sort-icon" id="sort-icon-days">unfold_more</span>
      </div>
    </th>
    <th class="py-3.5 px-4 cursor-pointer hover:text-emerald-900 transition-colors sortable-header group" data-sort="attendance" title="Click to sort by Attendance %">
      <div class="flex items-center gap-1">
        <span>Attendance %</span>
        <span class="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-emerald-700 transition-transform sort-icon" id="sort-icon-attendance">unfold_more</span>
      </div>
    </th>
    <th class="py-3.5 px-3">Status</th>
    <th class="py-3.5 px-3 cursor-pointer hover:text-emerald-900 transition-colors sortable-header group" data-sort="cgpa" title="Click to sort by CGPA">
      <div class="flex items-center gap-1">
        <span>CGPA</span>
        <span class="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-emerald-700 transition-transform sort-icon" id="sort-icon-cgpa">unfold_more</span>
      </div>
    </th>
    <th class="py-3.5 px-4 cursor-pointer hover:text-emerald-900 transition-colors sortable-header group" data-sort="backlogs" title="Click to sort by Backlog Count">
      <div class="flex items-center gap-1">
        <span>Backlogs</span>
        <span class="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-emerald-700 transition-transform sort-icon" id="sort-icon-backlogs">unfold_more</span>
      </div>
    </th>
    <th class="py-3.5 px-4 text-right">Actions</th>
  </tr>
</thead>"""

html = re.sub(old_thead_pattern, new_thead, html)

# 2. Add Mass Sync Button & Quick Sort Dropdown to Action Bar
toolbar_replacement = """<!-- Toolbar with Live Azure Mass Sync & Sorting -->
    <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
      <div class="flex flex-wrap items-center gap-2">
        <button id="azureMassSyncBtn" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#003519] via-[#047857] to-[#10b981] hover:opacity-95 text-white text-xs font-bold tracking-wide shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer" type="button" title="Synchronize all 180 department nodes directly from Azure SBTET Cloud Gateway">
          <span class="material-symbols-outlined text-[18px]" id="azureMassSyncIcon">cloud_sync</span>
          <span id="azureMassSyncText">⚡ Live Mass Sync (Azure &amp; SBTET)</span>
        </button>

        <div class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-slate-200 shadow-xs text-xs">
          <span class="material-symbols-outlined text-slate-500 text-[16px]">swap_vert</span>
          <label for="quickSortSelect" class="sr-only">Sort Table</label>
          <select id="quickSortSelect" class="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer">
            <option value="pin-asc">Sort: PIN (001 → 180)</option>
            <option value="pin-desc">Sort: PIN (180 → 001)</option>
            <option value="name-asc">Sort: Name (A → Z)</option>
            <option value="name-desc">Sort: Name (Z → A)</option>
            <option value="cgpa-desc">Sort: CGPA (Highest First)</option>
            <option value="cgpa-asc">Sort: CGPA (Lowest First)</option>
            <option value="att-desc">Sort: Attendance (High → Low)</option>
            <option value="att-asc">Sort: Attendance (Low → High)</option>
            <option value="days-desc">Sort: Present Days (High → Low)</option>
            <option value="backlogs-asc">Sort: Backlogs (0 Clear First)</option>
            <option value="backlogs-desc">Sort: Backlogs (Deficits First)</option>
          </select>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs font-mono text-slate-500 hidden sm:inline" id="azureSyncStatusPill">
          ☁️ Azure Gateway: <strong class="text-emerald-700">Online</strong>
        </span>
      </div>
    </div>
"""

# Insert toolbar before table
html = re.sub(r'(<div class="overflow-x-auto max-h-\[640px\])', toolbar_replacement + '\n\\1', html)

# 3. Add Azure Mass Sync Modal Overlay before </body>
azure_mass_sync_modal = """
  <!-- POP-UP MODAL: Real-time Azure Portal Mass Sync Progression -->
  <div id="azureSyncProgressModal" class="fixed inset-0 z-[65000] hidden flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity duration-300 opacity-0 pointer-events-none">
    <div id="azureSyncModalCard" class="relative w-full max-w-lg bg-white rounded-[32px] p-6 sm:p-7 shadow-2xl border border-stone-200 transform scale-95 transition-transform duration-300 space-y-5">
      
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-3 border-b border-stone-200">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#003519] to-[#047857] text-white flex items-center justify-center shadow-md">
            <span class="material-symbols-outlined text-2xl animate-spin" id="azureModalSpinIcon">cloud_sync</span>
          </div>
          <div>
            <h3 class="text-lg font-bold text-stone-900 font-display">Azure &bull; SBTET Live Mass Sync</h3>
            <p class="text-xs text-stone-500 font-medium">Gateway: azure.sbtet.telangana.gov.in / SCET-259-C24</p>
          </div>
        </div>
        <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800" id="azureModalStatusBadge">Streaming</span>
      </div>

      <!-- Live Dual Counters -->
      <div class="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
        <div class="flex items-center justify-between text-xs font-semibold text-stone-700">
          <span>Azure Biometric Punch Ledger</span>
          <span class="font-mono text-emerald-700 font-bold" id="azureModalCounter">12 / 180 Nodes</span>
        </div>
        <div class="w-full bg-stone-200 rounded-full h-2.5 overflow-hidden">
          <div id="azureModalProgressBar" class="bg-gradient-to-r from-[#003519] via-[#047857] to-[#10b981] h-2.5 rounded-full w-[6%] transition-all duration-150"></div>
        </div>
        <div class="flex items-center justify-between text-[11px] text-stone-500 font-mono">
          <span>Current Stream Node: <strong class="text-slate-900" id="azureModalCurrentPin">24259-CS-012</strong></span>
          <span class="text-emerald-700 font-bold" id="azureModalPercentage">6%</span>
        </div>
      </div>

      <!-- Live Stream Console Output -->
      <div class="p-3 bg-stone-900 text-emerald-300 font-mono text-[11px] rounded-xl h-24 overflow-y-auto space-y-1" id="azureStreamConsole">
        <div>[AZURE-TLS1.3] Initializing cryptographic handshake with SBTET Node 259...</div>
        <div>[SBTET-GATEWAY] Certificate verified: C-24 Scheme Ledger Active.</div>
      </div>

      <!-- Modal Footer -->
      <div class="flex items-center justify-between pt-2">
        <span class="text-xs text-stone-400 font-medium">180 Registered Students (CSE-A &amp; CSE-B)</span>
        <button id="closeAzureSyncModal" class="px-4 py-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition cursor-pointer" type="button">
          Cancel
        </button>
      </div>

    </div>
  </div>
"""

if '#azureSyncProgressModal' not in html:
    html = html.replace('<!-- Toast Notification -->', azure_mass_sync_modal + '\n  <!-- Toast Notification -->')

with open(r'frontend/screens/04-hod-portal/students-info.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Updated students-info.html with sortable headers, Azure Mass Sync button, and Azure Sync Modal!")
