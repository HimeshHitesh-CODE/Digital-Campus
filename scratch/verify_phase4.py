with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\attendance.html", "r", encoding="utf-8") as f:
    att = f.read()

with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\results.html", "r", encoding="utf-8") as f:
    res = f.read()

print("attendance.html:")
print("  Contains 'File Medical Appeal':", "File Medical Appeal" in att)
print("  Contains 'Subject-Wise Biometric Audit':", "Subject-Wise Biometric Audit" in att)
print("  Contains 'Discrepancy Rectification Desk':", "Discrepancy Rectification Desk" in att)

print("\nresults.html:")
print("  Contains 'DiplomaStudentServices':", "DiplomaStudentServices" in res)
print("  Contains 'printableMemoCard':", "printableMemoCard" in res)
