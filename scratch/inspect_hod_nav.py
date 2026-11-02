import os, re

dc_path = r'C:/Users/HiteshHimesh/.gemini/antigravity/scratch/Digital-Campus/frontend/js/dc-dynamic-island.js'
with open(dc_path, 'r', encoding='utf-8') as f:
    js = f.read()

print("Searching HOD in dc-dynamic-island.js:")
for line in js.splitlines():
    if 'hod' in line.lower() or 'roster' in line.lower() or 'console' in line.lower() or 'approval' in line.lower():
        print(" ", line[:100])
