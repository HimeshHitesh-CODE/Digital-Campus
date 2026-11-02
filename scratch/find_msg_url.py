with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\messages.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, l in enumerate(lines):
    if 'checkUrlParams' in l or 'Marketplace' in l:
        print(f"L{idx+1}: {l.strip()[:100]}")
