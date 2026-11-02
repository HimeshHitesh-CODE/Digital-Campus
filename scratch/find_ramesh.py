import os, re

base = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus"
matches = []

for root, dirs, files in os.walk(base):
    if any(x in root for x in ['.git', 'node_modules', '.venv', '__pycache__']):
        continue
    for f in files:
        if f.endswith(('.py', '.js', '.html', '.css', '.json', '.md')):
            p = os.path.join(root, f)
            try:
                with open(p, 'r', encoding='utf-8') as fh:
                    lines = fh.readlines()
                    for idx, line in enumerate(lines):
                        if re.search(r'ramesh', line, re.IGNORECASE):
                            matches.append((os.path.relpath(p, base), idx+1, line.strip()))
            except Exception:
                pass

print(f"Total 'ramesh' matches: {len(matches)}")
for m in matches:
    print(f"{m[0]}:{m[1]}: {m[2][:120]}")
