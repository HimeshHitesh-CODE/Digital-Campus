import os, re, json

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

combined_colors = {}
combined_fonts = {}
combined_radii = {}
combined_spacing = {}

for f in files:
    p = os.path.join(base, f)
    with open(p, 'r', encoding='utf-8') as fp:
        c = fp.read()
        m = re.search(r'tailwind\.config\s*=\s*({.*?});?\s*</script>', c, re.DOTALL)
        if m:
            # simple python parsing or regex extraction
            cfg_text = m.group(1)
            # extract colors
            cm = re.search(r'colors\s*:\s*{(.*?)}', cfg_text, re.DOTALL)
            if cm:
                for line in cm.group(1).splitlines():
                    kv = re.search(r'["\']?([a-zA-Z0-9_\-]+)["\']?\s*:\s*["\']([^"\']+)["\']', line)
                    if kv:
                        combined_colors[kv.group(1)] = kv.group(2)
            # extract fontFamily
            fm = re.search(r'fontFamily\s*:\s*{(.*?)}', cfg_text, re.DOTALL)
            if fm:
                for line in fm.group(1).splitlines():
                    kv = re.search(r'["\']?([a-zA-Z0-9_\-]+)["\']?\s*:\s*\[(.*?)\]', line)
                    if kv:
                        combined_fonts[kv.group(1)] = [x.strip().strip("'\"") for x in kv.group(2).split(',')]

print("Combined colors count:", len(combined_colors))
print("Combined fonts count:", len(combined_fonts))
for k, v in combined_fonts.items():
    print(f"  fontFamily.{k}: {v}")
print("\nSample colors:")
for k in list(combined_colors.keys())[:15]:
    print(f"  colors.{k}: {combined_colors[k]}")
