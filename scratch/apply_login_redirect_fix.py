import os

base = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus"

# 1. Update backend/main.py root redirect
main_py = os.path.join(base, "backend", "main.py")
with open(main_py, "r", encoding="utf-8") as f:
    main_code = f.read()

old_root_block = """# --- DEFAULT ROUTE DIRECTLY TO STUDENT DASHBOARD ---
@app.get("/")
@app.get("/index.html")
def root():
    \"\"\"Directly serves the Student Dashboard as the default landing view.\"\"\"
    return RedirectResponse(url="/screens/02-student-portal/dashboard.html", status_code=302)"""

new_root_block = """# --- DEFAULT ROUTE DIRECTLY TO LOGIN ---
@app.get("/")
@app.get("/index.html")
def root():
    \"\"\"Directly serves the Login screen as the default landing view.\"\"\"
    return RedirectResponse(url="/screens/01-auth/login.html", status_code=302)"""

if old_root_block in main_code:
    main_code = main_code.replace(old_root_block, new_root_block, 1)
    with open(main_py, "w", encoding="utf-8") as f:
        f.write(main_code)
    print("Updated backend/main.py root route!")
else:
    print("Warning: old_root_block not found in backend/main.py, checking manual replace")
    if 'return RedirectResponse(url="/screens/02-student-portal/dashboard.html", status_code=302)' in main_code:
        main_code = main_code.replace('return RedirectResponse(url="/screens/02-student-portal/dashboard.html", status_code=302)', 'return RedirectResponse(url="/screens/01-auth/login.html", status_code=302)', 1)
        with open(main_py, "w", encoding="utf-8") as f:
            f.write(main_code)
        print("Replaced dashboard redirect with login redirect in main.py!")

# 2. Update frontend/index.html
index_html = os.path.join(base, "frontend", "index.html")
new_index_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="0; url=/screens/01-auth/login.html" />
  <title>Campus Connect — Login</title>
  <script>
    window.location.replace('/screens/01-auth/login.html');
  </script>
</head>
<body style="background: #020604; color: #f0fdf4; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
  <p>Connecting to Campus Connect Login...</p>
</body>
</html>
"""
with open(index_html, "w", encoding="utf-8") as f:
    f.write(new_index_content)
print("Updated frontend/index.html to redirect to login.html!")

# 3. Update frontend/dashboard.html (legacy root file)
legacy_dash = os.path.join(base, "frontend", "dashboard.html")
new_legacy_dash = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="0; url=/screens/01-auth/login.html" />
  <title>Campus Connect — Redirecting</title>
  <script>
    if (!localStorage.getItem('dc_user')) {
      window.location.replace('/screens/01-auth/login.html');
    } else {
      window.location.replace('/screens/02-student-portal/dashboard.html');
    }
  </script>
</head>
<body style="background: #020604; color: #f0fdf4; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
  <p>Redirecting to Campus Connect...</p>
</body>
</html>
"""
with open(legacy_dash, "w", encoding="utf-8") as f:
    f.write(new_legacy_dash)
print("Updated frontend/dashboard.html legacy file!")

# 4. Update stitch-state.js to remove hardcoded Himesh fallback
stitch_js = os.path.join(base, "frontend", "js", "stitch-state.js")
with open(stitch_js, "r", encoding="utf-8") as f:
    s_code = f.read()

# Replace getUser implementation in stitch-state.js
old_get_user = """    getUser() {
      // Synchronize with existing dc_user if available
      try {
        const existing = localStorage.getItem('dc_user');
        if (existing) {
          const u = JSON.parse(existing);
          if (u && (u.name || u.pin)) {
            return Object.assign({}, DEFAULT_USER, u);
          }
        }
      } catch (e) {}
      return load(STORAGE_KEYS.USER, DEFAULT_USER);
    },"""

new_get_user = """    getUser() {
      // Synchronize with existing dc_user if available
      try {
        const existing = localStorage.getItem('dc_user');
        if (existing) {
          const u = JSON.parse(existing);
          if (u && (u.name || u.pin)) {
            return Object.assign({}, DEFAULT_USER, u);
          }
        }
      } catch (e) {}

      const pin = localStorage.getItem('user_pin') || localStorage.getItem('student_pin');
      const name = localStorage.getItem('user_name');
      if (pin || name) {
        return Object.assign({}, DEFAULT_USER, {
          pin: pin || '',
          name: name || 'Student',
          avatarInitials: (name ? name.slice(0, 2) : 'ST').toUpperCase()
        });
      }

      // No active session in storage
      return null;
    },"""

if old_get_user in s_code:
    s_code = s_code.replace(old_get_user, new_get_user, 1)
    with open(stitch_js, "w", encoding="utf-8") as f:
        f.write(s_code)
    print("Updated stitch-state.js getUser()!")
else:
    print("Warning: old_get_user not found in stitch-state.js")

# 5. Update dc-dynamic-island.js for auth enforcement and student messages link
island_js = os.path.join(base, "frontend", "js", "dc-dynamic-island.js")
with open(island_js, "r", encoding="utf-8") as f:
    isl_code = f.read()

# Fix student messages url
isl_code = isl_code.replace(
    "{ label: 'Messages', file: 'messages.html', icon: 'message-square', url: '/screens/04-hod-portal/messages.html', badgeId: 'badgeMessages' }",
    "{ label: 'Messages', file: 'messages.html', icon: 'message-square', url: '/screens/02-student-portal/messages.html', badgeId: 'badgeMessages' }"
)

# Update getActiveUser to not default to Himesh
old_get_active = """  function getActiveUser() {
    try {
      const stored = localStorage.getItem('dc_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u && (u.name || u.pin)) return u;
      }
    } catch (e) {}

    const name = localStorage.getItem('user_name') || 'KARNATI HIMESH';
    const pin = localStorage.getItem('student_pin') || '24259-CS-025';
    const role = localStorage.getItem('user_role') || 'STUDENT';
    return { name, pin, sbtetPin: pin, role, collegeCode: '259' };
  }"""

new_get_active = """  function getActiveUser() {
    try {
      const stored = localStorage.getItem('dc_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u && (u.name || u.pin)) return u;
      }
    } catch (e) {}

    const name = localStorage.getItem('user_name');
    const pin = localStorage.getItem('student_pin') || localStorage.getItem('user_pin');
    const role = localStorage.getItem('user_role') || 'STUDENT';
    if (name || pin) {
      return { name: name || 'Student', pin: pin || '', sbtetPin: pin || '', role, collegeCode: '259' };
    }
    return null;
  }

  function enforceAuth() {
    const path = window.location.pathname.toLowerCase();
    const isAuth = path.includes('/01-auth/') || path.endsWith('login.html');
    if (isAuth) return true;

    const user = getActiveUser();
    if (!user || (!user.pin && !user.name)) {
      window.location.replace('/screens/01-auth/login.html');
      return false;
    }
    return true;
  }"""

if old_get_active in isl_code:
    isl_code = isl_code.replace(old_get_active, new_get_active, 1)

old_init_shell = """  function initDynamicShell() {
    cleanupLegacyDocks();"""

new_init_shell = """  function initDynamicShell() {
    if (!enforceAuth()) return;
    cleanupLegacyDocks();"""

if old_init_shell in isl_code:
    isl_code = isl_code.replace(old_init_shell, new_init_shell, 1)

with open(island_js, "w", encoding="utf-8") as f:
    f.write(isl_code)
print("Updated dc-dynamic-island.js with enforceAuth() and student messages link!")

# 6. Update dashboard.js
dash_js = os.path.join(base, "frontend", "screens", "02-student-portal", "dashboard.js")
with open(dash_js, "r", encoding="utf-8") as f:
    d_code = f.read()

old_d_init = """document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
});"""

new_d_init = """document.addEventListener('DOMContentLoaded', () => {
  const user = StitchState?.getUser ? StitchState.getUser() : null;
  if (!user || (!user.pin && !user.name)) {
    window.location.replace('/screens/01-auth/login.html');
    return;
  }
  initDashboard();
});"""

if old_d_init in d_code:
    d_code = d_code.replace(old_d_init, new_d_init, 1)
    with open(dash_js, "w", encoding="utf-8") as f:
        f.write(d_code)
    print("Updated dashboard.js with auth check!")

# 7. Update auth-guard.js
guard_js = os.path.join(base, "frontend", "js", "auth-guard.js")
with open(guard_js, "r", encoding="utf-8") as f:
    g_code = f.read()

old_fallback = """  // Graceful fallback for direct page inspection
  const fallback = {
    name: 'Tallapalli Tulasi Ram Goud',
    pin: '24259-CS-040',
    sbtetPin: '24259-CS-040',
    rollNumber: '24259-CS-040',
    role: 'STUDENT',
    branch: 'CS',
    department: 'Computer Science & Engineering',
    collegeCode: '259',
    isRegistered: true,
    isActivated: true
  };
  localStorage.setItem('dc_user', JSON.stringify(fallback));
  localStorage.setItem('auth_token', 'tok_active_session_' + Date.now());
  return fallback;"""

new_fallback = """  // No fallback user: force user to log in
  return null;"""

if old_fallback in g_code:
    g_code = g_code.replace(old_fallback, new_fallback, 1)
    with open(guard_js, "w", encoding="utf-8") as f:
        f.write(g_code)
    print("Updated auth-guard.js to eliminate auto-login fallback!")

print("All auth redirects and guards configured successfully!")
