with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\js\dc-dynamic-island.js", "r", encoding="utf-8") as f:
    text = f.read()

idx = text.lower().find("logout")
while idx != -1:
    print(text[max(0, idx-50):idx+200])
    print("---")
    idx = text.lower().find("logout", idx+1)
