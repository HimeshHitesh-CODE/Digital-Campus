import re, sqlite3

# 1. Update backend/campus.db: reset all roster_keys to is_registered = 0
db_path = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\backend\campus.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()
cur.execute("UPDATE roster_keys SET is_registered = 0;")
conn.commit()
print(f"Reset {cur.rowcount} roster keys to is_registered = 0")
conn.close()

# 2. Update frontend/screens/01-auth/login.html
login_html_path = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\01-auth\login.html"
with open(login_html_path, "r", encoding="utf-8") as f:
    html = f.read()

# A. Completely remove header toolbar
# Pattern from <!-- Minimal Institutional Top Bar --> to </header>
html = re.sub(
    r"<!-- Minimal Institutional Top Bar -->\s*<header[\s\S]*?</header>",
    "<!-- Top Header removed for clean centered glassmorphic card -->",
    html
)

# B. Remove pre-filled values and example strings in Student Form
# pinInput
html = re.sub(
    r'(<input[^>]*id="pinInput"[^>]*)(?:value="[^"]*")([^>]*>)',
    r'\1\2',
    html
)
html = html.replace('placeholder="e.g. 24259-CS-025"', 'placeholder="Enter Student PIN"')
html = html.replace('placeholder="e.g. 24259-CS-025 or 24259-AIML-001"', 'placeholder="Enter Student PIN"')
html = re.sub(r'\(e\.g\.,?\s*24259-CS-025\)', '', html)

# password input
html = re.sub(
    r'(<input[^>]*id="studentPassword"[^>]*)(?:value="[^"]*")([^>]*>)',
    r'\1\2',
    html
)
html = html.replace('placeholder="Enter your secure password"', 'placeholder="Enter Password"')

# C. Update Onboarding Callout & Drawer
# Remove (STD-3472C6) code tag from description
html = re.sub(r'\s*\(<code[^>]*>STD-[^<]*</code>\)', '', html)
html = re.sub(r'\(STD-[^)]*\)', '', html)

# Replace the inner onboardingDrawer with PIN + Key + Password + Confirm Password
old_drawer_pattern = r'<div class="hidden pt-3 border-t border-emerald-900/10 flex flex-col gap-3 transition-all" id="onboardingDrawer">[\s\S]*?</div>\s*</div>\s*</div>\s*</div>'

new_drawer = """<div class="hidden pt-3 border-t border-emerald-900/10 flex flex-col gap-3 transition-all" id="onboardingDrawer">
                <div class="space-y-1">
                  <label class="block font-dg text-sm font-bold text-emerald-950">Student PIN</label>
                  <input class="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-900/20 font-mono text-sm text-emerald-950 uppercase placeholder:text-stone-400 placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500" id="onboardPin" placeholder="Enter Student PIN" type="text" />
                </div>
                <div class="space-y-1">
                  <label class="block font-dg text-sm font-bold text-emerald-950">Anti-Spoofing Security Key</label>
                  <input class="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-900/20 font-mono text-sm text-emerald-950 uppercase placeholder:text-stone-400 placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500" id="onboardKey" placeholder="Enter Unique Security Key" type="text" />
                </div>
                <div class="space-y-1">
                  <label class="block font-dg text-sm font-bold text-emerald-950">Create New Password</label>
                  <input class="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-900/20 font-sans text-sm text-emerald-950 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" id="onboardPass" placeholder="Enter New Password (min 6 chars)" type="password" />
                </div>
                <div class="space-y-1">
                  <label class="block font-dg text-sm font-bold text-emerald-950">Confirm New Password</label>
                  <input class="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-900/20 font-sans text-sm text-emerald-950 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" id="onboardPassConfirm" placeholder="Confirm Password" type="password" />
                </div>
                <button class="w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-emerald-700 to-teal-600 text-white font-dg text-base font-bold shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer" type="button" onclick="handleActivateAccount()">
                  Verify Key &amp; Set Password &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>"""

html = re.sub(old_drawer_pattern, new_drawer, html)

# D. Update HOD Presets & Inputs
# Change presets to PADMA-AIML-HOD and VAMSHI-CS-HOD
presets_old = r'<div class="flex items-center gap-1.5">[\s\S]*?</div>\s*</div>\s*<div class="relative">'
presets_new = """<div class="flex items-center gap-1.5">
                  <button type="button" class="hod-preset-pill px-2.5 py-0.5 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-mono text-[10px] font-bold border border-emerald-300 transition cursor-pointer" data-id="PADMA-AIML-HOD">Prof. Padma (AIML)</button>
                  <button type="button" class="hod-preset-pill px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] font-bold border border-slate-300 transition cursor-pointer" data-id="VAMSHI-CS-HOD">Dr. Vamshi (CSE)</button>
                </div>
              </div>
              <div class="relative">"""
html = re.sub(presets_old, presets_new, html)

# Remove value="AIML-HOD" from hodIdInput
html = re.sub(
    r'(<input[^>]*id="hodIdInput"[^>]*)(?:value="[^"]*")([^>]*>)',
    r'\1\2',
    html
)
html = html.replace('placeholder="e.g. AIML-HOD, HOD-AIML-259, or VAMSHI-CS-HOD"', 'placeholder="Enter Executive / HOD ID"')
html = html.replace('placeholder="e.g. VAMSHI-CS-HOD"', 'placeholder="Enter Executive / HOD ID"')
html = re.sub(r'\(e\.g\.,?\s*VAMSHI-CS-HOD\)', '', html)

# Remove value="hod123" from passwordInput
html = re.sub(
    r'(<input[^>]*id="passwordInput"[^>]*)(?:value="[^"]*")([^>]*>)',
    r'\1\2',
    html
)
html = html.replace('placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"', 'placeholder="Enter Master Password"')

with open(login_html_path, "w", encoding="utf-8") as f:
    f.write(html)

print("login.html updated successfully!")
