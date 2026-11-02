with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\students-info.js", "r", encoding="utf-8") as f:
    text = f.read()

print("Length of students-info.js:", len(text))
for line in text.splitlines()[:60]:
    print("  ", line[:100])
