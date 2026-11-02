with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\dashboard.html", "r", encoding="utf-8") as f:
    c = f.read()

print("Contains Block-B Engineering Wing in hero:", "Block-B Engineering Wing" in c)
print("Contains Central Campus Grounds in hero:", "Central Campus Grounds" in c)
print("Contains samskruti-campus-hero.png:", "samskruti-campus-hero.png" in c)
print("Contains ContactUs link:", "https://www.sbtet.telangana.gov.in/index.html#!/index/ContactUs" in c)
