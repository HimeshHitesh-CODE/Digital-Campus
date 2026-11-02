with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\js\dc-dynamic-island.js", "r", encoding="utf-8") as f:
    text = f.read()

print("Length of dc-dynamic-island.js:", len(text))
# Check role detection
for line in text.splitlines():
    if any(k in line for k in ['role', 'Ramesh', 'Padma', 'Helpdesk', 'isHod', 'student', 'HOD']):
        print("  ", line.strip()[:100])
