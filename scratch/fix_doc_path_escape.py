script_path = r'C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\scratch\generate_master_documentation.py'

with open(script_path, 'r', encoding='utf-8') as f:
    c = f.read()

# Replace unescaped path in part5
c = c.replace(
    r"`C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\COMPLETE_WEBSITE_MASTER_DOCUMENTATION.md`",
    r"`C:\\Users\\HiteshHimesh\\.gemini\\antigravity\\scratch\\Digital-Campus\\COMPLETE_WEBSITE_MASTER_DOCUMENTATION.md`"
)

with open(script_path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Path escaped in generate_master_documentation.py")
