doc_html_path = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\document-logistics.html"
with open(doc_html_path, "r", encoding="utf-8") as f:
    html = f.read()

import re
# Remove the OTP container in modal or archive
html = re.sub(
    r'<div class="flex items-center gap-1 font-mono[\s\S]*?<span>Copy Token</span>\s*</button>\s*</div>\s*</div>',
    '',
    html
)
html = html.replace('5 8 4 3 8 6', 'SCET-259-AUTH')
html = html.replace('584386', 'SCET-259-AUTH')
html = html.replace('Present your Student ID & OTP', 'Present your Student ID & Attestation Reference')

with open(doc_html_path, "w", encoding="utf-8") as f:
    f.write(html)

print("584386 completely eliminated!")
