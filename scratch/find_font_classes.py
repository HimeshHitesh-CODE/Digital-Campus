import os, re

files = [
    'campus_connect_home/code.html',
    'campus_connect_attendance/code.html',
    'campus_connect_marks_results/code.html',
    'campus_connect_marketplace/code.html',
    'campus_connect_idea_hub/code.html',
    'campus_connect_certificate_requests/code.html',
    'campus_connect_messages/code.html'
]

base = 'C:/Users/HiteshHimesh/.gemini/antigravity/scratch/Digital-Campus/stitch_campus_connect_design_system'

fonts_found = set()
for f in files:
    p = os.path.join(base, f)
    with open(p, 'r', encoding='utf-8') as fp:
        c = fp.read()
        classes = re.findall(r'class=["\']([^"\']+)["\']', c)
        for cls_str in classes:
            for cls in cls_str.split():
                if cls.startswith('font-') and not re.match(r'font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)', cls):
                    fonts_found.add(cls)

print("Font classes used in Stitch HTML:")
for fc in sorted(fonts_found):
    print(" ", fc)
