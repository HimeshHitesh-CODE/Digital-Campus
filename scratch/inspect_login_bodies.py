import os, re

base = r'C:/Users/HiteshHimesh/.gemini/antigravity/scratch/Digital-Campus/stitch_campus_connect_design_system'

def print_body(name):
    with open(os.path.join(base, name), 'r', encoding='utf-8') as f:
        html = f.read()
    # Find from <body to </body>
    body_m = re.search(r'<body[^>]*>([\s\S]*?)</body>', html)
    if body_m:
        content = body_m.group(1)
        print(f"=== BODY of {name} ({len(content)} chars) ===")
        # Remove header
        content_no_header = re.sub(r'<header[^>]*>[\s\S]*?</header>', '<!-- HEADER STRIPPED -->', content)
        print(content_no_header[:1500])
        print("\n...[middle truncated]...\n")
        print(content_no_header[-1500:])

print_body('campus_connect_student_login_onboarding/code.html')
print_body('campus_connect_hod_executive_login/code.html')
