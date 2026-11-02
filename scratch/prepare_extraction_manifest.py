import os

root = r'C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus'

# Exclude directories
EXCLUDED_DIRS = {'.git', '__pycache__', 'node_modules', '.pytest_cache'}

def get_text_files(base_dir):
    text_files = []
    binary_files = []
    
    # Extensions considered text source files
    TEXT_EXTS = {
        '.py', '.html', '.css', '.js', '.json', '.md', '.txt', 
        '.env', '.env.example', '.gitignore', '.yaml', '.yml', '.sql'
    }
    
    for dirpath, dirnames, filenames in os.walk(base_dir):
        # Filter out excluded directories in-place
        dirnames[:] = [d for d in dirnames if d not in EXCLUDED_DIRS]
        
        for f in filenames:
            full_path = os.path.join(dirpath, f)
            rel_path = os.path.relpath(full_path, base_dir).replace('\\', '/')
            
            # Skip scratch folder and bak files if they are temp scripts
            # But wait, include all project files and screen bak files if relevant
            ext = os.path.splitext(f)[1].lower()
            name_lower = f.lower()
            
            if name_lower in ['.env', '.gitignore', 'procfile']:
                text_files.append((rel_path, full_path, os.path.getsize(full_path)))
            elif ext in TEXT_EXTS or name_lower.startswith('.env'):
                text_files.append((rel_path, full_path, os.path.getsize(full_path)))
            else:
                binary_files.append((rel_path, full_path, os.path.getsize(full_path)))
                
    return sorted(text_files, key=lambda x: x[0]), sorted(binary_files, key=lambda x: x[0])

text_files, binary_files = get_text_files(root)

print(f"Total Text Source Files to Extract: {len(text_files)}")
print(f"Total Binary / Asset Files: {len(binary_files)}")

# Group text files
by_section = {
    'Root & Config': [],
    'Backend Python & Schemas': [],
    'Frontend Core CSS': [],
    'Frontend Core JS': [],
    'Frontend Screen 01 - Auth': [],
    'Frontend Screen 02 - Student Portal': [],
    'Frontend Screen 03 - Admin Portal': [],
    'Frontend Screen 04 - HOD Portal': [],
    'Design System & Reference Specs': [],
    'Rosters & Data JSON': [],
    'Scratch & Automation Scripts': []
}

for rel, full, sz in text_files:
    if rel.startswith('backend/all_') or rel.endswith('.json'):
        by_section['Rosters & Data JSON'].append((rel, sz))
    elif rel.startswith('backend/'):
        by_section['Backend Python & Schemas'].append((rel, sz))
    elif rel.startswith('frontend/css/'):
        by_section['Frontend Core CSS'].append((rel, sz))
    elif rel.startswith('frontend/js/'):
        by_section['Frontend Core JS'].append((rel, sz))
    elif 'screens/01-auth' in rel:
        by_section['Frontend Screen 01 - Auth'].append((rel, sz))
    elif 'screens/02-student-portal' in rel:
        by_section['Frontend Screen 02 - Student Portal'].append((rel, sz))
    elif 'screens/03-admin' in rel:
        by_section['Frontend Screen 03 - Admin Portal'].append((rel, sz))
    elif 'screens/04-hod' in rel:
        by_section['Frontend Screen 04 - HOD Portal'].append((rel, sz))
    elif rel.startswith('stitch_campus_connect_design_system/'):
        by_section['Design System & Reference Specs'].append((rel, sz))
    elif rel.startswith('scratch/'):
        by_section['Scratch & Automation Scripts'].append((rel, sz))
    else:
        by_section['Root & Config'].append((rel, sz))

for sec, flist in by_section.items():
    print(f"\n--- {sec} ({len(flist)} files) ---")
    for r, sz in flist[:10]:
        print(f"  {r} ({sz:,} bytes)")
    if len(flist) > 10:
        print(f"  ... and {len(flist)-10} more files")
