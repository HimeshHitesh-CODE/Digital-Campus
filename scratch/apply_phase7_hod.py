import re

# 1. Update hod-dashboard.html
dash_html_path = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\hod-dashboard.html"
with open(dash_html_path, "r", encoding="utf-8") as f:
    dhtml = f.read()

# Reset syncSummaryText and pin/name
dhtml = re.sub(
    r'<span class="text-slate-800 font-semibold font-mono" id="syncSummaryText">Processed 12 / 180 students</span>',
    '<span class="text-slate-800 font-semibold font-mono" id="syncSummaryText">Processed 0 / 180 students</span>',
    dhtml
)
dhtml = re.sub(
    r'<span[^>]*id="currentSyncPin"[^>]*>24259-CS-012</span>',
    '<span class="font-mono text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60" id="currentSyncPin">Standby</span>',
    dhtml
)
dhtml = re.sub(
    r'<span[^>]*id="currentSyncName"[^>]*>\(K\. SAI MANIDEEP\)</span>',
    '<span class="text-slate-500 font-medium ml-1" id="currentSyncName"></span>',
    dhtml
)

# Reset bar1Counter and progressBar1
dhtml = re.sub(
    r'<span class="font-mono text-emerald-800 font-bold" id="bar1Counter">12 / 180 \(6%\)</span>',
    '<span class="font-mono text-emerald-800 font-bold" id="bar1Counter">0 / 180 (0%)</span>',
    dhtml
)
dhtml = re.sub(
    r'<div id="progressBar1" class="([^"]*)\bw-\[6%\]',
    r'<div id="progressBar1" class="\1w-[0%]" style="width: 0%;"',
    dhtml
)

# Reset bar2Counter and progressBar2
dhtml = re.sub(
    r'<span class="font-mono text-slate-800 font-bold" id="bar2Counter">8 / 180 \(4%\)</span>',
    '<span class="font-mono text-slate-800 font-bold" id="bar2Counter">0 / 180 (0%)</span>',
    dhtml
)
dhtml = re.sub(
    r'<div id="progressBar2" class="([^"]*)\bw-\[4%\]',
    r'<div id="progressBar2" class="\1w-[0%]" style="width: 0%;"',
    dhtml
)

# Reset default KPI cards
dhtml = re.sub(
    r'<div class="text-3xl font-extrabold text-rose-600 mt-2 font-display tracking-tight">36\.8%</div>',
    '<div class="text-3xl font-extrabold text-slate-900 mt-2 font-display tracking-tight" id="kpiAvgAttendance">0.0%</div>',
    dhtml
)
dhtml = re.sub(
    r'<div class="text-3xl font-extrabold text-amber-600 mt-2 font-display tracking-tight">2\.2%</div>',
    '<div class="text-3xl font-extrabold text-slate-900 mt-2 font-display tracking-tight" id="kpiClearanceRate">0.0%</div>',
    dhtml
)
dhtml = re.sub(
    r'<strong class="text-slate-700 font-semibold">4 / 180</strong> students ≥ 75% SBTET line',
    '<strong class="text-slate-700 font-semibold" id="kpiClearanceCount">0 / 180</strong> students ≥ 75% SBTET line',
    dhtml
)

with open(dash_html_path, "w", encoding="utf-8") as f:
    f.write(dhtml)
print("hod-dashboard.html sync counters reset to 0!")

# 2. Update students-info.html table layout and widths
stu_html_path = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\students-info.html"
with open(stu_html_path, "r", encoding="utf-8") as f:
    shtml = f.read()

# Update table min-width to 1180px so all columns have generous breathing room and zero clipping
shtml = shtml.replace('min-w-[1080px]', 'min-w-[1180px]')

# Ensure ACTIONS column header has text-right and pr-4
shtml = re.sub(
    r'<th class="py-3 px-3 w-\[115px\] text-right">ACTIONS</th>',
    '<th class="py-3 pl-2 pr-4 w-[125px] text-right">ACTIONS</th>',
    shtml
)

with open(stu_html_path, "w", encoding="utf-8") as f:
    f.write(shtml)
print("students-info.html table widths updated!")

# 3. Update students-info.js to ensure row-level ACTIONS column has pr-4 and proper layout
stu_js_path = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\students-info.js"
with open(stu_js_path, "r", encoding="utf-8") as f:
    sjs = f.read()

# Update actions cell class in row template
sjs = re.sub(
    r'<!-- 10\. Actions \(Sync & Chat\) -->\s*<td class="py-2\.5 px-3 whitespace-nowrap text-right">',
    '<!-- 10. Actions (Sync & Chat) -->\n        <td class="py-2.5 pl-2 pr-4 whitespace-nowrap text-right">',
    sjs
)

with open(stu_js_path, "w", encoding="utf-8") as f:
    f.write(sjs)
print("students-info.js updated!")
