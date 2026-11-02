import os, re

base = r'C:/Users/HiteshHimesh/.gemini/antigravity/scratch/Digital-Campus/stitch_campus_connect_design_system'

files = [
    'campus_connect_student_login_onboarding/code.html',
    'campus_connect_hod_executive_login/code.html',
    'campus_connect_student_profile_records/code.html',
    'campus_connect_hod_console_dashboard/code.html',
    'campus_connect_document_approvals_sign_offs/code.html',
    'campus_connect_anti_spoofing_security_keys_roster/code.html',
    'campus_connect_cs_department_master_students_info_dossier/code.html',
    'campus_connect_campus_messages_peer_threads/code.html'
]

for name in files:
    path = os.path.join(base, name)
    if not os.path.exists(path):
        print(f"MISSING: {name}")
        continue
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()
    
    header_m = re.search(r'<header[^>]*>[\s\S]*?</header>', html)
    header_info = f"Found <header> ({len(header_m.group(0))} chars)" if header_m else "NO <header>"
    
    main_m = re.search(r'<main[^>]*>', html)
    main_info = f"Found <main>: {main_m.group(0)}" if main_m else "NO <main>"
    
    # check for blue colors
    blues = re.findall(r'blue-[0-9]{3}', html)
    
    print(f"{name:65} | {header_info:25} | {main_info:45} | Blue classes: {len(blues)}")
