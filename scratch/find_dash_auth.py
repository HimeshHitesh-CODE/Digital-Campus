with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\dashboard.js", "r", encoding="utf-8") as f:
    text = f.read()

for idx, line in enumerate(text.split("\n")[:100]):
    if "user" in line.lower() or "login" in line.lower() or "auth" in line.lower() or "pin" in line.lower():
        print(f"L{idx+1}: {line}")
