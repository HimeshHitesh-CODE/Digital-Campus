with open('C:/Users/HiteshHimesh/.gemini/antigravity/scratch/Digital-Campus/stitch_campus_connect_design_system/campus_connect_attendance/code.html', 'r', encoding='utf-8') as f:
    c = f.read()

import re
scripts = re.findall(r'<script(?![^>]*src)[^>]*>(.*?)</script>', c, re.DOTALL | re.IGNORECASE)
for idx, s in enumerate(scripts):
    if 'tailwind.config' not in s:
        print("Script length:", len(s))
        print(s)
