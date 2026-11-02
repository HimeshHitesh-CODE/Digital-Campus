import os, re

files = [
    'campus_connect_attendance/code.html',
    'campus_connect_marketplace/code.html',
    'campus_connect_certificate_requests/code.html'
]

base = 'C:/Users/HiteshHimesh/.gemini/antigravity/scratch/Digital-Campus/stitch_campus_connect_design_system'
for f in files:
    p = os.path.join(base, f)
    with open(p, 'r', encoding='utf-8') as fp:
        c = fp.read()
        m = re.search(r'(<header.*?</header>)', c, re.DOTALL | re.IGNORECASE)
        if m:
            print('='*50)
            print(f, 'FOUND HEADER:')
            lines = m.group(1).splitlines()
            for l in lines[:15]:
                print(' ', l)
            if len(lines) > 15:
                print('  ... (total lines in header:', len(lines), ')')
