import re

with open('frontend/screens/04-hod-portal/document-approvals.html', encoding='utf-8') as f:
    text = f.read()

footer_match = re.findall(r'<div[^>]*Showing[\s\S]*?</div>', text)
print("Footer/pagination matches:", footer_match)
