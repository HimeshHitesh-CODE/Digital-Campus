with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\backend\main.py", "r", encoding="utf-8") as f:
    text = f.read()

for idx, line in enumerate(text.split("\n")):
    if '@app.get("/")' in line or '@app.get("/api")' in line or "RedirectResponse" in line or "login.html" in line:
        print(f"L{idx+1}: {line}")
