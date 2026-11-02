with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\js\dc-dynamic-island.js", "r", encoding="utf-8") as f:
    text = f.read()

for idx, l in enumerate(text.splitlines()):
    if 'detectRole' in l:
        for j in range(idx, min(idx+20, len(text.splitlines()))):
            print(f"  {text.splitlines()[j]}")
        break
