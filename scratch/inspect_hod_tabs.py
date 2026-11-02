import os, re

base = r'C:/Users/HiteshHimesh/.gemini/antigravity/scratch/Digital-Campus/stitch_campus_connect_design_system'

def inspect_file(rel):
    path = os.path.join(base, rel)
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()
    
    print(f"\n==================== {rel} ====================")
    # Check headers
    headers = re.findall(r'<h[1-4][^>]*>([\s\S]*?)</h[1-4]>', html)
    print("Headings:", [re.sub(r'<[^>]*>', '', h).strip() for h in headers[:8]])
    
    # Check buttons
    btns = re.findall(r'<button[^>]*>([\s\S]*?)</button>', html)
    print("Buttons:", [re.sub(r'<[^>]*>', '', b).strip() for b in btns if b.strip()][:10])
    
    # Check tables or major cards
    tables = re.findall(r'<table[^>]*>', html)
    print("Table count:", len(tables))

inspect_file('campus_connect_hod_console_dashboard/code.html')
inspect_file('campus_connect_document_approvals_sign_offs/code.html')
inspect_file('campus_connect_anti_spoofing_security_keys_roster/code.html')
inspect_file('campus_connect_cs_department_master_students_info_dossier/code.html')
inspect_file('campus_connect_campus_messages_peer_threads/code.html')
