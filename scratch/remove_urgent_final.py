doc_html_path = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\document-logistics.html"
with open(doc_html_path, "r", encoding="utf-8") as f:
    html = f.read()

import re
html = re.sub(
    r'<label class="relative inline-flex items-center cursor-pointer">\s*<input class="sr-only peer" id="urgentToggle"[^>]*>[\s\S]*?</label>\s*</div>',
    '',
    html
)

with open(doc_html_path, "w", encoding="utf-8") as f:
    f.write(html)

print("urgentToggle removed successfully!")
