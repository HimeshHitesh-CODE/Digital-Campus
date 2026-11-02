with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\idea-hub.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, l in enumerate(lines):
    if any(k in l for k in ['Invite', 'invite', 'ALL_PEERS', 'renderPeers']):
        print(f"L{idx+1}: {l.strip()[:100]}")
