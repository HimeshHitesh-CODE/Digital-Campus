with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\document-approvals.js", "r", encoding="utf-8") as f:
    text = f.read()

print("Length of document-approvals.js:", len(text))
for line in text.splitlines()[:50]:
    print("  ", line[:100])
