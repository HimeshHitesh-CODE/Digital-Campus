with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\css\top-nav.css", "r", encoding="utf-8") as f:
    css = f.read()

import re
print("Length of top-nav.css:", len(css))
for match in re.finditer(r"\.dc-dynamic-island-shell[^{]*\{[^}]*\}", css):
    print("Shell:", match.group(0))

for match in re.finditer(r"\.dock-nav-link\.is-active[^{]*\{[^}]*\}", css):
    print("Active:", match.group(0))
