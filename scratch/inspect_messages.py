import re

for path in [
    r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\messages.html",
    r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\messages.js",
    r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\messages.html",
    r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\messages.js"
]:
    with open(path, "r", encoding="utf-8") as f:
        c = f.read()
    print(f"File {path.split('\\\\')[-2:]}: length={len(c)}")
    redirs = re.findall(r"(?:window\.location|location\.href)[^;]+", c)
    print("  Redirects:", redirs)
