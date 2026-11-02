import glob, os, re

base = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal"
files = glob.glob(os.path.join(base, "*.html"))

for f in files:
    with open(f, "r", encoding="utf-8") as fh:
        lines = fh.readlines()
    print("FILE:", os.path.basename(f))
    for idx, l in enumerate(lines):
        if any(k in l for k in ['dept-switch', 'switchDept', 'CS Dept', 'AIML Dept', 'Computer Science (180)', 'Artificial Intelligence (120)']):
            print(f"  {idx+1}: {l.strip()}")
