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
        scripts = re.findall(r'<script(?![^>]*src)[^>]*>(.*?)</script>', c, re.DOTALL | re.IGNORECASE)
        print('='*50)
        print(f, f"({len(scripts)} scripts)")
        for idx, s in enumerate(scripts):
            s_clean = s.strip()
            if 'tailwind.config' in s_clean[:50]:
                print(f"  Script {idx}: [Tailwind Config - {len(s_clean)} chars]")
            else:
                print(f"  Script {idx}: [Interactive Logic - {len(s_clean)} chars]")
                print("  --- Preview (first 10 lines) ---")
                for line in s_clean.splitlines()[:10]:
                    print("   ", line)
