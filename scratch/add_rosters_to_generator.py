import os

script_path = r'C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\scratch\generate_master_documentation.py'

with open(script_path, 'r', encoding='utf-8') as f:
    text = f.read()

old_sec = '''    ("8.8 Design System Reference Specifications (`stitch_campus_connect_design_system`)", [
        "stitch_campus_connect_design_system/academic_heritage_sanctuary/DESIGN.md",
        "stitch_campus_connect_design_system/campus_connect_home/code.html",
        "stitch_campus_connect_design_system/campus_connect_attendance/code.html",
        "stitch_campus_connect_design_system/campus_connect_marks_results/code.html",
        "stitch_campus_connect_design_system/campus_connect_certificate_requests/code.html",
        "stitch_campus_connect_design_system/campus_connect_marketplace/code.html",
        "stitch_campus_connect_design_system/campus_connect_idea_hub/code.html",
        "stitch_campus_connect_design_system/campus_connect_messages/code.html"
    ])'''

new_sec = '''    ("8.8 Design System Reference Specifications (`stitch_campus_connect_design_system`)", [
        "stitch_campus_connect_design_system/academic_heritage_sanctuary/DESIGN.md",
        "stitch_campus_connect_design_system/campus_connect_home/code.html",
        "stitch_campus_connect_design_system/campus_connect_attendance/code.html",
        "stitch_campus_connect_design_system/campus_connect_marks_results/code.html",
        "stitch_campus_connect_design_system/campus_connect_certificate_requests/code.html",
        "stitch_campus_connect_design_system/campus_connect_marketplace/code.html",
        "stitch_campus_connect_design_system/campus_connect_idea_hub/code.html",
        "stitch_campus_connect_design_system/campus_connect_messages/code.html"
    ]),
    ("8.9 Department Rosters, Manifests and Seed Data JSON", [
        "backend/package.json",
        "backend/all_120_aiml_student_names.json",
        "backend/all_180_student_names.json"
    ])'''

if old_sec in text:
    text = text.replace(old_sec, new_sec)
    with open(script_path, 'w', encoding='utf-8') as f:
        f.write(text)
    print("Added Section 8.9 to generate_master_documentation.py")
else:
    print("Could not find old_sec target")
