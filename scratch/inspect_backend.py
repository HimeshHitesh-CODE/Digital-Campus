import re

with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\backend\main.py", "r", encoding="utf-8") as f:
    content = f.read()

print("File size:", len(content))

# Look for auth routes
auth_routes = re.findall(r"@app\.(?:post|get)\([\"']([^\"']*auth[^\"']*)[\"']", content)
print("Auth routes:", auth_routes)

# Look for all routes
routes = re.findall(r"@app\.(?:post|get|put|delete)\([\"']([^\"']+)[\"']", content)
print("Total routes:", len(routes))
for r in routes:
    if any(k in r for k in ['login', 'register', 'onboard', 'key', 'hod', 'sync', 'request', 'message', 'invite', 'notice', 'announcement']):
        print("  -", r)

# Search for Ramesh vs Padma
ramesh_matches = re.findall(r".{0,40}Ramesh.{0,40}", content)
print("\nRamesh matches in main.py:", len(ramesh_matches))
for m in ramesh_matches[:5]:
    print("  ", m.strip())

padma_matches = re.findall(r".{0,40}Padma.{0,40}", content)
print("\nPadma matches in main.py:", len(padma_matches))
for m in padma_matches[:5]:
    print("  ", m.strip())
