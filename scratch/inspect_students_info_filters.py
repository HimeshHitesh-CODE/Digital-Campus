with open('frontend/screens/04-hod-portal/students-info.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
thead = re.search(r'<thead[\s\S]*?</thead>', text)
print("Thead found:\n", thead.group(0) if thead else "None")

search_bar = re.search(r'<div class="flex flex-col[\s\S]*?Search student PIN[\s\S]*?</div>\s*</div>\s*</div>', text)
print("\nSearch bar area:\n", search_bar.group(0)[:800] if search_bar else "None")
