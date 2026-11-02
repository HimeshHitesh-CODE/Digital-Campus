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
for f in files:
    p = os.path.join(base, f)
    with open(p, 'r', encoding='utf-8') as fp:
        c = fp.read()
        m = re.search(r'(<footer.*?</footer>)', c, re.DOTALL | re.IGNORECASE)
        if m:
            print('='*50)
            print(f, 'FOUND FOOTER:')
            lines = m.group(1).splitlines()
            for l in lines[:20]:
                print(' ', l)
            if len(lines) > 20:
                print('  ... (total lines in footer:', len(lines), ')')
