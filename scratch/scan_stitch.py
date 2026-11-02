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
        headers = re.findall(r'<header[^>]*>', c, re.IGNORECASE)
        scripts = re.findall(r'<script(?![^>]*src)[^>]*>(.*?)</script>', c, re.DOTALL | re.IGNORECASE)
        ids = re.findall(r'id=["\']([a-zA-Z0-9_\-]+)["\']', c)
        print(f"{f}: {len(c)} bytes, {len(c.splitlines())} lines | headers: {len(headers)} | inline scripts: {len(scripts)} | sample IDs: {ids[:8]}")
