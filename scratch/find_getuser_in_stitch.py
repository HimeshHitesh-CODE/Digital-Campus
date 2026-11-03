with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\js\stitch-state.js", "r", encoding="utf-8") as f:
    text = f.read()

idx = text.find("getUser")
while idx != -1:
    print(text[max(0, idx-50):idx+250])
    print("---")
    idx = text.find("getUser", idx+1)
