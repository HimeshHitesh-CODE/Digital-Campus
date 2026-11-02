with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\hod-dashboard.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, l in enumerate(lines):
    if any(k in l for k in ['syncAllBtn', 'progressBar1', 'startLiveSync', 'triggerSync', 'Processed']):
        print(f"L{idx+1}: {l.strip()[:100]}")
