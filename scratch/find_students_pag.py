with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\students-info.html", "r", encoding="utf-8") as f:
    text = f.read()

import re
pag = re.findall(r"(?:pagination|page|paginate)[\w-]*", text, re.IGNORECASE)
print("Pagination matches in students-info.html:", set(pag))

# Check table scroll container
m = re.search(r'<div class="[^"]*max-h-[^"]*"', text)
if m:
    print("Table scroll container:", m.group(0))
