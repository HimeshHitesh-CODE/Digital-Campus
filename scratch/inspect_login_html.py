with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\01-auth\login.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

print("Total lines in login.html:", len(lines))
for idx, l in enumerate(lines[:100]):
    if any(k in l for k in ['header', 'nav', 'toolbar', '24259', 'VAMSHI', 'student123', 'STD-']):
        print(f"{idx+1}: {l.strip()}")
