import re

# 1. Update security-roster.html
roster_html_path = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\security-roster.html"
with open(roster_html_path, "r", encoding="utf-8") as f:
    rhtml = f.read()

# Replace HOD Ramesh in header text if present
rhtml = rhtml.replace("PROF. RAMESH", "PROF. PADMA")
rhtml = rhtml.replace("Prof. Ramesh", "Prof. Padma")
rhtml = rhtml.replace("Ramesh", "Padma")

# Replace department switcher buttons with a static department badge
switcher_pattern = r'<div class="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">\s*<button id="filterAimlKeys"[\s\S]*?</button>\s*<button id="filterCsKeys"[\s\S]*?</button>\s*<button id="filterAllKeys"[\s\S]*?</button>\s*</div>'
static_badge = """<div class="flex items-center gap-2">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/90 text-emerald-950 font-dg text-xs font-black uppercase tracking-wider border border-emerald-300 shadow-2xs" id="rosterDeptBadge">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
              <span id="rosterDeptBadgeText">DEPARTMENT SECURITY ROSTER</span>
            </div>
          </div>"""

rhtml = re.sub(switcher_pattern, static_badge, rhtml)

with open(roster_html_path, "w", encoding="utf-8") as f:
    f.write(rhtml)
print("security-roster.html updated!")

# 2. Update security-roster.js
roster_js_path = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\security-roster.js"
with open(roster_js_path, "r", encoding="utf-8") as f:
    rjs = f.read()

# Ensure Ramesh -> Padma
rjs = rjs.replace("PROF. RAMESH", "PROF. PADMA")
rjs = rjs.replace("Prof. Ramesh", "Prof. Padma")

# Strict department getter
old_dept_func = """function getActiveDepartment() {
  const stored = localStorage.getItem('hod_active_dept');
  if (stored === 'CS' || stored === 'AIML') return stored;
  try {
    const userStr = localStorage.getItem('dc_user');
    if (userStr) {
      const u = JSON.parse(userStr);
      if (u.branch === 'CS' || (u.pin && u.pin.includes('CS'))) return 'CS';
    }
  } catch (_) {}
  return 'AIML';
}"""

new_dept_func = """function getActiveDepartment() {
  try {
    const userStr = localStorage.getItem('dc_user');
    if (userStr) {
      const u = JSON.parse(userStr);
      if (u.branch === 'CS' || (u.pin && u.pin.includes('CS'))) return 'CS';
      if (u.branch === 'AIML' || (u.pin && u.pin.includes('AIML'))) return 'AIML';
    }
  } catch (_) {}
  const stored = localStorage.getItem('hod_active_dept');
  if (stored === 'CS' || stored === 'AIML') return stored;
  return 'AIML';
}"""

if old_dept_func in rjs:
    rjs = rjs.replace(old_dept_func, new_dept_func)

with open(roster_js_path, "w", encoding="utf-8") as f:
    f.write(rjs)
print("security-roster.js updated!")

# 3. Update students-info.html
stu_html_path = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\students-info.html"
with open(stu_html_path, "r", encoding="utf-8") as f:
    shtml = f.read()

# Replace department switcher buttons with a static department badge
switcher_pattern_stu = r'<div class="inline-flex p-1 rounded-full bg-white border border-\[#003519\]/10 shadow-xs gap-1">\s*<button id="deptAimlBtn"[\s\S]*?</button>\s*<button id="deptCsBtn"[\s\S]*?</button>\s*</div>'
static_badge_stu = """<div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-emerald-900/15 shadow-2xs">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
          <span class="font-dg text-xs font-black uppercase tracking-wider text-emerald-950" id="currentDeptDisplayTitle">DEPARTMENT LEDGER</span>
        </div>"""

shtml = re.sub(switcher_pattern_stu, static_badge_stu, shtml)

with open(stu_html_path, "w", encoding="utf-8") as f:
    f.write(shtml)
print("students-info.html updated!")

# 4. Update students-info.js
stu_js_path = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\students-info.js"
with open(stu_js_path, "r", encoding="utf-8") as f:
    sjs = f.read()

# Update getActiveDepartment
if old_dept_func in sjs:
    sjs = sjs.replace(old_dept_func, new_dept_func)

# Replace all occurrences of Ramesh with Padma
sjs = sjs.replace("Prof. Ramesh", "Prof. Padma")
sjs = sjs.replace("PROF. RAMESH", "PROF. PADMA")

with open(stu_js_path, "w", encoding="utf-8") as f:
    f.write(sjs)
print("students-info.js updated!")

# 5. Update hod-dashboard.html & hod-dashboard.js
dash_html_path = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\hod-dashboard.html"
with open(dash_html_path, "r", encoding="utf-8") as f:
    dhtml = f.read()

dhtml = dhtml.replace("Prof. Ramesh", "Prof. Padma")
dhtml = dhtml.replace("PROF. RAMESH", "PROF. PADMA")

with open(dash_html_path, "w", encoding="utf-8") as f:
    f.write(dhtml)
print("hod-dashboard.html updated!")

dash_js_path = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\hod-dashboard.js"
with open(dash_js_path, "r", encoding="utf-8") as f:
    djs = f.read()

djs = djs.replace("Prof. Ramesh", "Prof. Padma")
djs = djs.replace("PROF. RAMESH", "PROF. PADMA")

with open(dash_js_path, "w", encoding="utf-8") as f:
    f.write(djs)
print("hod-dashboard.js updated!")

# 6. Update messages.js in HOD portal
msg_js_path = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\messages.js"
with open(msg_js_path, "r", encoding="utf-8") as f:
    mjs = f.read()

mjs = mjs.replace("Prof. Ramesh", "Prof. Padma")
mjs = mjs.replace("PROF. RAMESH", "PROF. PADMA")
mjs = mjs.replace("Respected Prof. Ramesh Sir", "Respected Prof. Padma Ma'am")
mjs = mjs.replace("Prof. Ramesh (HOD)", "Prof. Padma (HOD)")
mjs = mjs.replace("You will receive the 6-digit pickup token shortly", "Your request is registered for HOD endorsement")

with open(msg_js_path, "w", encoding="utf-8") as f:
    f.write(mjs)
print("HOD messages.js updated!")
