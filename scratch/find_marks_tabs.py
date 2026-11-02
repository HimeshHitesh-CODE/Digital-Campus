with open('C:/Users/HiteshHimesh/.gemini/antigravity/scratch/Digital-Campus/stitch_campus_connect_design_system/campus_connect_marks_results/code.html', 'r', encoding='utf-8') as f:
    c = f.read()

import re
m = re.search(r'(<div[^>]*class="[^"]*flex[^"]*items-center[^"]*justify-between[^"]*">\s*<div[^>]*class="[^"]*flex[^"]*flex-wrap[^"]*gap-2.*?</div>\s*</div>)', c, re.DOTALL)
if m:
    print(m.group(1))
else:
    for line in c.splitlines():
        if '1st Sem' in line or 'Active Memo' in line:
            print(line.strip())
