with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\dashboard.html", "r", encoding="utf-8") as f:
    text = f.read()

import re
# Find the hero section
hero = re.search(r'(<section[^>]*style="background: linear-gradient\(135deg, #064e3b[\s\S]*?</section>)', text)
if hero:
    print("Found hero section! Length:", len(hero.group(1)))
    # print first 500 chars and last 500 chars
    print("START:", hero.group(1)[:400])
    print("END:", hero.group(1)[-500:])
