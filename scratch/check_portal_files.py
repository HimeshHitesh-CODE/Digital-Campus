import os

folder = 'C:/Users/HiteshHimesh/.gemini/antigravity/scratch/Digital-Campus/frontend/screens/02-student-portal'
files = [
    'dashboard.html',
    'attendance.html',
    'results.html',
    'marketplace.html',
    'idea-hub.html',
    'document-logistics.html',
    'messages.html'
]

for f in files:
    p = os.path.join(folder, f)
    if os.path.exists(p):
        print(f"{f}: exists ({os.path.getsize(p)} bytes)")
    else:
        print(f"{f}: DOES NOT EXIST")
