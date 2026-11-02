with open('C:/Users/HiteshHimesh/.gemini/antigravity/scratch/Digital-Campus/stitch_campus_connect_design_system/campus_connect_marks_results/code.html', 'r', encoding='utf-8') as f:
    c = f.read()

import re
# find semester tabs
m_tabs = re.search(r'(<!--\s*SEMESTER TABS.*?-->.*?</div>\s*</div>)', c, re.DOTALL | re.IGNORECASE)
if m_tabs:
    print(m_tabs.group(1)[:600])

# find table body
m_tbody = re.search(r'<tbody[^>]*>(.*?)</tbody>', c, re.DOTALL | re.IGNORECASE)
if m_tbody:
    print("\nTable body lines:", len(m_tbody.group(1).splitlines()))
