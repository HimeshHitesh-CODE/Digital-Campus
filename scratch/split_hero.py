with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\dashboard.html", "r", encoding="utf-8") as f:
    text = f.read()

import re
m = re.search(r'<div class="relative z-10 p-6 md:p-10 lg:p-12 flex flex-col lg:flex-row gap-8 items-stretch justify-between">([\s\S]*?)</section>', text)
if m:
    inner = m.group(1)
    parts = inner.split('<div class="w-full lg:w-[410px] shrink-0 flex flex-col justify-end">')
    print("Parts count:", len(parts))
    if len(parts) == 2:
        print("Left part end:", parts[0][-300:])
        print("Right part end:", parts[1][-300:])
