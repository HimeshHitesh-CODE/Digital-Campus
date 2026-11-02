import os

with open('C:/Users/HiteshHimesh/.gemini/antigravity/scratch/Digital-Campus/stitch_campus_connect_design_system/campus_connect_home/code.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Let's inspect the main content between <main> and </main>
import re
m = re.search(r'<main[^>]*>(.*?)</main>', html, re.DOTALL | re.IGNORECASE)
if m:
    main_html = m.group(1)
    print("Found main content, length:", len(main_html), "chars")
    print("Has footer:", '<footer' in html)
