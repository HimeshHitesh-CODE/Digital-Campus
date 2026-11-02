with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\js\dc-dynamic-island.js", "r", encoding="utf-8") as f:
    text = f.read()

for idx, l in enumerate(text.splitlines()):
    if 'detectRole' in l or 'helpdesk' in l or 'Help Desk' in l:
        print(f"L{idx+1}: {repr(l)}")
