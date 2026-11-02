import re

path = r'C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\document-approvals.html'

with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Remove onclick="alert(...)"
c = re.sub(r'onclick="alert\([^"]*\)"', '', c)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Removed onclick alert from document-approvals.html")
