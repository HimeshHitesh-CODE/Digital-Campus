with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\backend\main.py", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, l in enumerate(lines):
    if any(k in l for k in ['/requests', 'DigitalRequestDB', 'digital_requests']):
        print(f"L{idx+1}: {l.strip()[:100]}")
