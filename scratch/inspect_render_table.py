with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\students-info.js", "r", encoding="utf-8") as f:
    text = f.read()

import re
m = re.search(r"function renderStudentsTable[^{]+\{(?:[^{}]|\{[^{}]*\})*\}", text)
if m:
    print(m.group(0)[:1500])
else:
    # print lines around renderStudentsTable
    for idx, l in enumerate(text.splitlines()):
        if 'renderStudentsTable' in l:
            for j in range(idx, min(idx+60, len(text.splitlines()))):
                print(f"  {text.splitlines()[j]}")
            break
