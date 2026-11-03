import os

base = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus"
targets = [os.path.join(base, "backend"), os.path.join(base, "frontend")]
found = []

for target in targets:
    for root, dirs, files in os.walk(target):
        for f in files:
            if f.endswith((".py", ".js", ".html")):
                p = os.path.join(root, f)
                with open(p, "r", encoding="utf-8", errors="ignore") as fp:
                    for line_no, line in enumerate(fp, 1):
                        if "dashboard.html" in line:
                            found.append((p, line_no, line.strip()))

for p, l, text in found:
    rel = os.path.relpath(p, base)
    print(f"{rel}:{l} -> {text[:100]}")
