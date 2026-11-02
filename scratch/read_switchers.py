with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\security-roster.html", "r", encoding="utf-8") as f:
    lines = f.readlines()
print("--- security-roster.html ---")
for idx, l in enumerate(lines[120:155]):
    print(f"{idx+121}: {l.rstrip()}")

with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\students-info.html", "r", encoding="utf-8") as f:
    lines = f.readlines()
print("\n--- students-info.html ---")
for idx, l in enumerate(lines[55:90]):
    print(f"{idx+56}: {l.rstrip()}")
