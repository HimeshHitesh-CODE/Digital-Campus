with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\01-auth\login.js", "r", encoding="utf-8") as f:
    text = f.read()

for idx, line in enumerate(text.split("\n")):
    if "localStorage" in line or "redirect" in line.lower() or "dc_user" in line:
        print(f"L{idx+1}: {line}")
