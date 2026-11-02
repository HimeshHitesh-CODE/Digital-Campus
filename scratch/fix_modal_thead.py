with open(r'frontend/screens/04-hod-portal/students-info.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Find the second thead inside backlog modal
modal_idx = text.find('id="backlogModalCard"')
if modal_idx != -1:
    before_modal = text[:modal_idx]
    in_modal = text[modal_idx:]
    
    # Restore the proper thead inside modal
    import re
    modal_thead_correct = """<thead class="bg-stone-100 text-stone-700 font-bold uppercase tracking-wider border-b border-stone-200">
              <tr>
                <th class="px-4 py-3">Subject Code &amp; Title</th>
                <th class="px-3 py-3">Internals (Deficit)</th>
                <th class="px-3 py-3">End Exam</th>
                <th class="px-3 py-3">Min Passing</th>
                <th class="px-4 py-3">Remedial Allocation</th>
              </tr>
            </thead>"""

    in_modal_fixed = re.sub(r'<thead[\s\S]*?</thead>', modal_thead_correct, in_modal, count=1)
    
    with open(r'frontend/screens/04-hod-portal/students-info.html', 'w', encoding='utf-8') as f:
        f.write(before_modal + in_modal_fixed)
    print("Fixed modal thead in students-info.html!")
else:
    print("backlogModalCard not found!")
