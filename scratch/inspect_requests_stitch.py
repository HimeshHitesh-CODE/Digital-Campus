with open('C:/Users/HiteshHimesh/.gemini/antigravity/scratch/Digital-Campus/stitch_campus_connect_design_system/campus_connect_certificate_requests/code.html', 'r', encoding='utf-8') as f:
    c = f.read()

import re
m_header = re.search(r'<header[^>]*>.*?</header>', c, re.DOTALL | re.IGNORECASE)
if m_header:
    print("Found header length:", len(m_header.group(0)))

m_main = re.search(r'<main[^>]*>(.*?)</main>', c, re.DOTALL | re.IGNORECASE)
if m_main:
    print("Found main content length:", len(m_main.group(1)))

m_footer = re.search(r'<footer[^>]*>.*?</footer>', c, re.DOTALL | re.IGNORECASE)
if m_footer:
    print("Found footer length:", len(m_footer.group(0)))

scripts = re.findall(r'<script(?![^>]*src)[^>]*>(.*?)</script>', c, re.DOTALL | re.IGNORECASE)
for idx, s in enumerate(scripts):
    if 'tailwind.config' not in s:
        print("Script length:", len(s))
        print(s[:500])
