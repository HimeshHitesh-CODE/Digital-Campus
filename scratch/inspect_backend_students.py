with open('backend/database.py', 'r', encoding='utf-8') as f:
    text = f.read()

import re
print("Length of database.py:", len(text))

# Search for any student data or schemas
for line in text.splitlines():
    if any(k in line.lower() for k in ['24259', 'student', 'attendance', 'cgpa', 'backlog']):
        print(line[:120])
