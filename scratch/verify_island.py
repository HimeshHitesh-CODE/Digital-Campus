with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\js\dc-dynamic-island.js", "r", encoding="utf-8") as f:
    c = f.read()

print("Contains helpdesk in dropdown:", "Campus Help Desk" in c)
print("Contains Ramesh:", "Ramesh" in c)
print("Contains Padma:", "Padma" in c)
print("Contains strict /04-hod-portal/ check:", "window.location.pathname.includes('/04-hod-portal/')" in c)
print("Contains strict /02-student-portal/ check:", "window.location.pathname.includes('/02-student-portal/')" in c)
