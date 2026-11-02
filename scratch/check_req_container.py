with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\document-logistics.html", "r", encoding="utf-8") as f:
    text = f.read()

print("activeRequestsContainer in html:", "activeRequestsContainer" in text)
# find lines around activeRequestsContainer
for idx, l in enumerate(text.splitlines()):
    if "activeRequestsContainer" in l:
        for j in range(max(0, idx-5), min(len(text.splitlines()), idx+15)):
            print(f"  {j+1}: {text.splitlines()[j]}")
