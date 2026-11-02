target_file = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\document-logistics.html"

with open(target_file, "r", encoding="utf-8") as f:
    content = f.read()

# Check what needs to be replaced
start_marker = '<span class="px-3 py-1 rounded-full text-[13px] font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-200">2 Processing Units</span>\n</div>'
end_marker = '<!-- Collapsible Accordion: Archived Logs -->'

if start_marker in content and end_marker in content:
    replacement = '''<span class="px-3 py-1 rounded-full text-[13px] font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-200" id="requestsCountBadge">Live Queue</span>
</div>

<!-- Dynamic Real-Time Request Container -->
<div id="activeRequestsContainer" class="space-y-4">
  <!-- Dynamic cards loaded via document-logistics.js -->
</div>

'''
    pre = content[:content.find(start_marker)]
    post = content[content.find(end_marker):]
    new_content = pre + replacement + post
    with open(target_file, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Successfully replaced hardcoded requests with #activeRequestsContainer!")
else:
    print("Markers not found! start_marker in content?", start_marker in content, "end_marker in content?", end_marker in content)
