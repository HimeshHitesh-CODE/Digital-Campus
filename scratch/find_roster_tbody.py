with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\security-roster.html", "r", encoding="utf-8") as f:
    text = f.read()

import re
matches = re.findall(r'<tbody[^>]*>', text)
print("Found tbodies:", matches)
