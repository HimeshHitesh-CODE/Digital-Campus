import re

with open('stitch_campus_connect_design_system/campus_connect_hod_console_dashboard/code.html', encoding='utf-8') as f:
    text = f.read()

purposes = re.findall(r'data-purpose="([^"]+)"', text)
print("Data purposes:", purposes)

buttons = re.findall(r'<button[^>]*>([\s\S]*?)</button>', text)
print("\nButtons found:")
for b in buttons:
    clean = re.sub(r'<[^>]+>', ' ', b).strip()
    print(" -", clean)

sections = re.findall(r'<!-- (?:BEGIN|END): ([^>]+) -->', text)
print("\nSections:", set(sections))
