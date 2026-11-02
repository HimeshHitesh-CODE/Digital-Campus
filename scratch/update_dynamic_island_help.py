with open(r'frontend/js/dc-dynamic-island.js', 'r', encoding='utf-8') as f:
    text = f.read()

target = """                <a href="${isHod ? '/screens/04-hod-portal/hod-dashboard.html' : '/screens/02-student-portal/profile.html'}" 
                   class="dropdown-menu-item" role="menuitem">
                  <i data-lucide="${isHod ? 'shield-check' : 'user'}"></i>
                  <span>${isHod ? 'HOD Executive Console' : 'My Profile'}</span>
                </a>"""

replacement = """                <a href="${isHod ? '/screens/04-hod-portal/hod-dashboard.html' : '/screens/02-student-portal/profile.html'}" 
                   class="dropdown-menu-item" role="menuitem">
                  <i data-lucide="${isHod ? 'shield-check' : 'user'}"></i>
                  <span>${isHod ? 'HOD Executive Console' : 'My Profile'}</span>
                </a>

                <a href="/screens/02-student-portal/helpdesk.html" 
                   class="dropdown-menu-item" role="menuitem">
                  <i data-lucide="help-circle"></i>
                  <span>Campus Help Desk</span>
                </a>"""

# Also add global click listener for help links across all pages
help_listener = """
    // Global Help Desk click handler
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a, button');
      if (!target) return;
      const href = target.getAttribute('href') || '';
      const txt = (target.textContent || '').toLowerCase();
      if (href === '#help' || href === 'help' || (txt.includes('help desk') && !window.location.pathname.includes('helpdesk.html'))) {
        e.preventDefault();
        window.location.href = '/screens/02-student-portal/helpdesk.html';
      }
    });
"""

if target in text:
    text = text.replace(target, replacement)
elif target.replace('\r\n', '\n') in text.replace('\r\n', '\n'):
    text = text.replace('\r\n', '\n').replace(target.replace('\r\n', '\n'), replacement.replace('\r\n', '\n'))

# Add the help_listener inside initDynamicIsland
if 'Global Help Desk click handler' not in text:
    text = text.replace('function initDynamicIsland() {', 'function initDynamicIsland() {' + help_listener)

with open(r'frontend/js/dc-dynamic-island.js', 'w', encoding='utf-8') as f:
    f.write(text)

print("dc-dynamic-island.js successfully updated with Help Desk link and global handler!")
