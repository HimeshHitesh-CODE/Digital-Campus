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
all_styles = {}
for f in files:
    p = os.path.join(base, f)
    with open(p, 'r', encoding='utf-8') as fp:
        c = fp.read()
        styles = re.findall(r'<style[^>]*>(.*?)</style>', c, re.DOTALL | re.IGNORECASE)
        all_styles[f] = styles

print(f"Extracted styles from {len(all_styles)} files")
for f, s_list in all_styles.items():
    print(f"File {f}: {len(s_list)} style tags")
    for idx, s in enumerate(s_list):
        print(f"  Tag {idx} length: {len(s)}")
        for line in s.strip().splitlines()[:15]:
            print("   ", line)
