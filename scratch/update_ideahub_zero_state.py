with open(r'frontend/screens/02-student-portal/idea-hub.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Update pending invites badge to 0
html = html.replace('2 Pending</span>', '0 Pending</span>')
html = html.replace('2 Pending Invites', '0 Pending Invites')

# Update skills tags container to start clean with + Add Skill
import re
skills_container_pattern = r'<div id="skillsTagsContainer"[\s\S]*?</div>'
new_skills_container = """<div id="skillsTagsContainer" class="flex flex-wrap items-center gap-2">
  <button id="btnAddSkillBtn" type="button" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-200 text-sm font-semibold border border-emerald-400/40 transition-all cursor-pointer">
    <span class="material-symbols-outlined text-[16px]">add</span>
    <span>Add Skill</span>
  </button>
</div>"""

html = re.sub(skills_container_pattern, new_skills_container, html)

# Update invites modal content to start clean
invites_pattern = r'<div class="space-y-3" id="invitesList">[\s\S]*?</div>\s*</div>\s*</div>\s*</div>'
clean_invites = """<div class="space-y-3" id="invitesList">
        <div class="text-center py-8 text-stone-500 font-dg text-lg">
          <span class="material-symbols-outlined text-4xl text-stone-400 block mb-2">mark_email_unread</span>
          No pending invites. Ready to receive peer collaboration requests in real-time!
        </div>
      </div>
    </div>
  </div>
</div>"""

html = re.sub(invites_pattern, clean_invites, html)

with open(r'frontend/screens/02-student-portal/idea-hub.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Updated idea-hub.html to clean initial zero state!")
