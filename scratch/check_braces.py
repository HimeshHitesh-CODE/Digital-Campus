with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\dashboard.js", "r", encoding="utf-8") as f:
    text = f.read()

opens = []
for i, ch in enumerate(text):
    if ch in "{[(":
        opens.append((ch, i, text.count("\n", 0, i) + 1))
    elif ch in "}])":
        if not opens:
            print(f"Unmatched closing {ch} at line {text.count(chr(10), 0, i) + 1}")
        else:
            match = {"}": "{", "]": "[", ")": "("}[ch]
            if opens[-1][0] == match:
                opens.pop()
            else:
                print(f"Mismatched {ch} at line {text.count(chr(10), 0, i) + 1}, expected {opens[-1]}")

if opens:
    print("Unclosed delimiters:")
    for o in opens:
        print(o)
else:
    print("All delimiters match!")
