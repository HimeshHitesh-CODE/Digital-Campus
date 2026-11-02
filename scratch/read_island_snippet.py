with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\js\dc-dynamic-island.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

print("Lines 55-65:")
for idx, l in enumerate(lines[54:65]):
    print(f"L{idx+55}: {repr(l)}")

print("\nLines 164-172:")
for idx, l in enumerate(lines[163:173]):
    print(f"L{idx+164}: {repr(l)}")
