# 1. Update dc-dynamic-island.js
island_js_path = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\js\dc-dynamic-island.js"
with open(island_js_path, "r", encoding="utf-8") as f:
    text = f.read()

# Fix detectRole()
old_detect = """    function detectRole() {
      const user = getActiveUser();
      if (user.role === 'HOD' || window.location.pathname.includes('/04-hod-portal/')) {
        return 'HOD';
      }
      return 'STUDENT';
    }"""

new_detect = """    function detectRole() {
      if (window.location.pathname.includes('/04-hod-portal/')) {
        return 'HOD';
      }
      if (window.location.pathname.includes('/02-student-portal/')) {
        return 'STUDENT';
      }
      const user = getActiveUser();
      if (user && user.role === 'HOD') {
        return 'HOD';
      }
      return 'STUDENT';
    }"""

if old_detect in text:
    text = text.replace(old_detect, new_detect)
    print("Updated detectRole!")
else:
    print("Warning: old_detect not found verbatim")

# Remove Campus Help Desk from profile dropdown menu
old_helpdesk_item = """                <a href="/screens/02-student-portal/helpdesk.html"
                   class="dropdown-menu-item" role="menuitem">
                  <i data-lucide="help-circle"></i>
                  <span>Campus Help Desk</span>
                </a>"""

if old_helpdesk_item in text:
    text = text.replace(old_helpdesk_item, "")
    print("Removed Campus Help Desk from profile dropdown!")
else:
    print("Warning: old_helpdesk_item not found verbatim")

# Fix HOD identity in setupGlobalHeader
text = text.replace("Prof. Ramesh", "Prof. Padma")
text = text.replace("'RAMESH'", "'PADMA'")
text = text.replace("'PR'", "'PA'")
text = text.replace("isAiml ? 'PR' :", "isAiml ? 'PA' :")
text = text.replace("isAiml ? 'RAMESH' :", "isAiml ? 'PADMA' :")
text = text.replace("user.pin.includes('AIML')) ? 'AIML' : 'AIML'", "user.pin.includes('AIML')) ? 'AIML' : 'CS'")

# Ensure CS HOD defaults to Dr. J. Vamshi Krishna and AIML HOD defaults to Prof. Padma
old_hod_meta = """    const activeDept = localStorage.getItem('hod_active_dept') || (user && user.branch === 'AIML' ? 'AIML' : ((user && user.pin && user.pin.includes('AIML')) ? 'AIML' : 'CS'));
    const isAiml = isHod && (activeDept === 'AIML' || (user && user.branch === 'AIML') || (user && user.pin && user.pin.includes('AIML')));
    const displayName = user.name || (isAiml ? 'Prof. Padma' : (isHod ? 'Dr. J. Vamshi Krishna' : 'KARNATI HIMESH'));
    const displayPin = user.pin || user.sbtetPin || (isAiml ? 'AIML-HOD' : (isHod ? 'HOD CSE' : '24259-CS-025'));
    const avatarInitials = isAiml ? 'PA' : (isHod ? 'VK' : getInitials(displayName));
    const lastName = isAiml ? 'PADMA' : (isHod ? 'VAMSHI' : getLastName(displayName));
    const deptTitle = isHod ? (isAiml ? 'HOD Artificial Intelligence & Machine Learning' : 'HOD Computer Science') : 'Student';"""

with open(island_js_path, "w", encoding="utf-8") as f:
    f.write(text)

print("Updated dc-dynamic-island.js successfully!")

# 2. Update top-nav.css
css_path = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\css\top-nav.css"
with open(css_path, "r", encoding="utf-8") as f:
    css = f.read()

# Update root colors to Luminous Emerald & Warm Parchment theme
css = re.sub(
    r':root\s*\{[^}]*\}',
    """:root {
  --dock-h: 56px;
  --dock-collapsed-w: 72px;
  --dock-bg: rgba(255, 255, 255, 0.90);
  --dock-border: rgba(16, 185, 129, 0.24);
  --dock-border-hover: rgba(16, 185, 129, 0.45);
  --dock-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.15), 0 8px 10px -6px rgba(16, 185, 129, 0.1);
  --dock-shadow-hover: 0 20px 35px -5px rgba(16, 185, 129, 0.25), 0 10px 10px -5px rgba(16, 185, 129, 0.15);
  --dock-active-bg: linear-gradient(135deg, #003519 0%, #047857 100%);
  --dock-active-text: #ffffff;
  --dock-item-text: #064e3b;
  --dock-item-hover: #065f46;
  --dock-divider: rgba(16, 185, 129, 0.18);
  --dock-badge-bg: #9E2B25;
  --dock-badge-text: #ffffff;
}""",
    css
)

# Update hover background
css = re.sub(
    r'\.dock-nav-link:hover,\s*\.dock-item-btn:hover\s*\{[^}]*\}',
    """.dock-nav-link:hover,
.dock-item-btn:hover {
  color: #065f46;
  background: #ecfdf5;
  border-radius: 9999px;
}""",
    css
)

# Update active state
css = re.sub(
    r'\.dock-nav-link\.active,\s*\.dock-item-btn\.active\s*\{[^}]*\}',
    """.dock-nav-link.active,
.dock-item-btn.active {
  background: linear-gradient(135deg, #003519 0%, #047857 100%) !important;
  color: #ffffff !important;
  font-weight: 800;
  border-radius: 9999px;
  box-shadow: 0 4px 16px rgba(4, 120, 87, 0.35);
}""",
    css
)

# Update active dot to pulsing mint dot
css = re.sub(
    r'\.active-dot\s*\{[^}]*\}',
    """.active-dot {
  position: absolute;
  bottom: 3px;
  left: 50%;
  transform: translateX(-50%);
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 6px #34d399;
  animation: mintPulse 1.8s infinite;
}

@keyframes mintPulse {
  0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
  50% { opacity: 0.45; transform: translateX(-50%) scale(0.75); }
}""",
    css
)

with open(css_path, "w", encoding="utf-8") as f:
    f.write(css)

print("Updated top-nav.css successfully!")
