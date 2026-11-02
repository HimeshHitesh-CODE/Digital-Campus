import os

root = r'C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus'

def scan_dir(base):
    file_list = []
    for dirpath, dirnames, filenames in os.walk(base):
        if '.git' in dirpath or '__pycache__' in dirpath:
            continue
        for f in filenames:
            full_path = os.path.join(dirpath, f)
            rel = os.path.relpath(full_path, base)
            file_list.append((rel, os.path.getsize(full_path)))
    return file_list

files = scan_dir(root)
print(f"Total non-git files: {len(files)}")
exts = {}
categories = {
    'backend': [],
    'frontend_html': [],
    'frontend_css': [],
    'frontend_js': [],
    'config': [],
    'assets': [],
    'stitch': [],
    'scratch': [],
    'docs': []
}

for rel, size in files:
    ext = os.path.splitext(rel)[1].lower()
    exts[ext] = exts.get(ext, 0) + 1
    
    norm = rel.replace('\\', '/')
    if norm.startswith('backend/'):
        categories['backend'].append((norm, size))
    elif norm.startswith('frontend/css/'):
        categories['frontend_css'].append((norm, size))
    elif norm.startswith('frontend/js/'):
        categories['frontend_js'].append((norm, size))
    elif norm.startswith('frontend/screens/') and norm.endswith('.html'):
        categories['frontend_html'].append((norm, size))
    elif norm.startswith('frontend/screens/') and norm.endswith('.js'):
        categories['frontend_js'].append((norm, size))
    elif norm.startswith('assets/'):
        categories['assets'].append((norm, size))
    elif norm.startswith('stitch_campus_connect_design_system/'):
        categories['stitch'].append((norm, size))
    elif norm.startswith('scratch/'):
        categories['scratch'].append((norm, size))
    else:
        categories['config'].append((norm, size))

print("File count by category:")
for cat, fl in categories.items():
    print(f"  {cat:15}: {len(fl)} files")

print("\nBackend files:")
for f, s in sorted(categories['backend']):
    print(f"  {f} ({s:,} bytes)")

print("\nFrontend HTML files:")
for f, s in sorted(categories['frontend_html']):
    print(f"  {f} ({s:,} bytes)")

print("\nFrontend CSS files:")
for f, s in sorted(categories['frontend_css']):
    print(f"  {f} ({s:,} bytes)")

print("\nFrontend JS files:")
for f, s in sorted(categories['frontend_js']):
    print(f"  {f} ({s:,} bytes)")

print("\nConfig & Root files:")
for f, s in sorted(categories['config']):
    print(f"  {f} ({s:,} bytes)")
