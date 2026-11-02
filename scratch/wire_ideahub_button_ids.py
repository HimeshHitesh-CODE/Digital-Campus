with open(r'frontend/screens/02-student-portal/idea-hub.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Edit My Skills button id
text = text.replace(
    '<button class="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 hover:bg-emerald-50 text-stone-800 border border-emerald-900/15 shadow-sm hover:shadow transition-all duration-200" type="button">',
    '<button id="btnEditMySkills" class="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 hover:bg-emerald-50 text-stone-800 border border-emerald-900/15 shadow-sm hover:shadow transition-all duration-200 cursor-pointer" type="button">'
)

# 2. Invites button id
text = text.replace(
    '<button class="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/80 hover:bg-emerald-200/80 text-emerald-950 border border-emerald-300/80 shadow-sm transition-all duration-200" type="button">',
    '<button id="btnPendingInvites" class="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/80 hover:bg-emerald-200/80 text-emerald-950 border border-emerald-300/80 shadow-sm transition-all duration-200 cursor-pointer" type="button">'
)

# 3. Add id to skills container and add id="btnAddSkillBtn"
old_lower_row = '<div class="pt-4 border-t border-white/15 flex flex-wrap items-center gap-2">'
new_lower_row = '<div id="skillsTagsContainer" class="pt-4 border-t border-white/15 flex flex-wrap items-center gap-2">'
text = text.replace(old_lower_row, new_lower_row)

# Add button inside skillsTagsContainer
text = text.replace(
    '<button class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-emerald-900 hover:bg-emerald-100 font-grotesque text-base font-bold transition-all shadow-md ml-1" type="button">',
    '<button id="btnAddSkillBtn" class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-emerald-900 hover:bg-emerald-100 font-grotesque text-base font-bold transition-all shadow-md ml-1 cursor-pointer" type="button">'
)

with open(r'frontend/screens/02-student-portal/idea-hub.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("Added IDs to idea-hub.html for Edit My Skills, Invites, and Add Skill buttons!")
