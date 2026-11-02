# Fix security-roster.html
with open('frontend/screens/04-hod-portal/security-roster.html', 'r', encoding='utf-8') as f:
    text = f.read()

target1 = '<div class="overflow-x-auto rounded-[24px] border border-stone-200/70 bg-white">'
repl1 = '<div class="overflow-x-auto max-h-[640px] overflow-y-auto rounded-[24px] border border-stone-200/70 bg-white shadow-inner" id="rosterScrollContainer">'

if target1 in text:
    text = text.replace(target1, repl1)
    with open('frontend/screens/04-hod-portal/security-roster.html', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Fixed security-roster.html scroll container!")

# Fix students-info.html
with open('frontend/screens/04-hod-portal/students-info.html', 'r', encoding='utf-8') as f:
    text2 = f.read()

target2 = '<div class="overflow-x-auto rounded-[22px] border border-slate-200/80 bg-white">'
repl2 = '<div class="overflow-x-auto max-h-[640px] overflow-y-auto rounded-[22px] border border-slate-200/80 bg-white shadow-inner" id="studentsScrollContainer">'

if target2 in text2:
    text2 = text2.replace(target2, repl2)
    with open('frontend/screens/04-hod-portal/students-info.html', 'w', encoding='utf-8') as f:
        f.write(text2)
    print("Fixed students-info.html scroll container!")
