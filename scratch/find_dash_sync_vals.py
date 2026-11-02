with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\hod-dashboard.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, l in enumerate(lines):
    if any(k in l for k in ['6%', '12 /', '24259-CS-012', '36.8%', '2.2%', '4 / 180', 'syncProgress', 'sync-progress']):
        print(f"L{idx+1}: {l.strip()[:100]}")
