with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\01-auth\login.html", "r", encoding="utf-8") as f:
    c = f.read()

print("Contains <header:", "<header" in c)
print("Contains value=\"24259:", 'value="24259' in c)
print("Contains value=\"student123:", 'value="student123' in c)
print("Contains value=\"AIML-HOD:", 'value="AIML-HOD' in c)
print("Contains value=\"hod123:", 'value="hod123' in c)
print("Contains e.g.:", "e.g." in c)
print("Contains onboardPin:", "onboardPin" in c)
print("Contains onboardPassConfirm:", "onboardPassConfirm" in c)
