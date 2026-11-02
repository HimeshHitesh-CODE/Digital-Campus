with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\01-auth\login.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, l in enumerate(lines[189:]):
    print(f"{idx+190}: {l.rstrip()}")
