with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\css\top-nav.css", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, l in enumerate(lines):
    if any(k in l for k in ['is-active', 'dock-nav-link', 'active-pill', 'pulse']):
        print(f"L{idx+1}: {l.strip()[:100]}")
