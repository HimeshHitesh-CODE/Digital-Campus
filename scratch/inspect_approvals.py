import re

with open('frontend/screens/04-hod-portal/document-approvals.html', encoding='utf-8') as f:
    text = f.read()

buttons = re.findall(r'<button[^>]*>([\s\S]*?)</button>', text)
print("Approvals Buttons found:")
for b in buttons:
    clean = re.sub(r'<[^>]+>', ' ', b).strip()
    print(" -", clean)
