with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\js\dc-dynamic-island.js", "r", encoding="utf-8") as f:
    text = f.read()

for idx, line in enumerate(text.split("\n")[:100]):
    print(f"L{idx+1}: {line}")
