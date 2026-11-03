import os

for root, dirs, files in os.walk(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend"):
    for f in files:
        if f.endswith(".js"):
            p = os.path.join(root, f)
            with open(p, "r", encoding="utf-8", errors="ignore") as fp:
                c = fp.read()
                if "StitchState" in c:
                    print("Found StitchState in", p)
