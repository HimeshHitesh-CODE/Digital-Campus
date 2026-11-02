import os, re

with open('C:/Users/HiteshHimesh/.gemini/antigravity/scratch/Digital-Campus/stitch_campus_connect_design_system/campus_connect_idea_hub/code.html', 'r', encoding='utf-8') as f:
    stitch_html = f.read()

# Extract main content and footer
main_match = re.search(r'<main[^>]*>(.*?)</main>', stitch_html, re.DOTALL | re.IGNORECASE)
footer_match = re.search(r'<footer[^>]*>(.*?)</footer>', stitch_html, re.DOTALL | re.IGNORECASE)

main_content = main_match.group(1) if main_match else ""
footer_content = footer_match.group(0) if footer_match else ""

# Replace href="#" with javascript:void(0)
main_content = main_content.replace('href="#"', 'href="javascript:void(0)"')

# Add IDs to buttons
main_content = main_content.replace('>Edit My Skills</button>', ' id="btnEditMySkills">Edit My Skills</button>')
main_content = main_content.replace('>Invites <span class="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-200 text-xs">3 Pending</span></button>', ' id="btnPendingInvites">Invites <span id="pendingInvitesBadge" class="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-200 text-xs">3 Pending</span></button>')
main_content = main_content.replace('>Sync GitHub / Portfolio</button>', ' id="btnSyncGithub">Sync GitHub / Portfolio</button>')

# Add skill button ID
main_content = main_content.replace('>+ Add Skill</button>', ' id="btnAddSkillBtn">+ Add Skill</button>')

# Hackathon banner CTAs
main_content = main_content.replace('>Register Team</button>', ' id="btnRegisterHackathon">Register Team</button>')
main_content = main_content.replace('>Guidelines PDF</button>', ' id="btnHackathonGuidelines">Guidelines PDF</button>')

# Student Profile IDs
main_content = main_content.replace('Karnati Himesh', '<span id="hubStudentName">Karnati Himesh</span>')
main_content = main_content.replace('PIN: 24259-CS-025', '<span id="hubStudentPin">PIN: 24259-CS-025</span>')
main_content = main_content.replace('>Available for Projects</span>', ' id="collabStatusText">Available for Projects</span>')

# Wrap skills tags container with an ID
main_content = main_content.replace(
    '<div class="flex flex-wrap items-center gap-2 mt-4 text-xs font-mono">',
    '<div id="skillsTagsContainer" class="flex flex-wrap items-center gap-2 mt-4 text-xs font-mono">'
)

ideahub_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Idea Hub & Peer Directory — Samskruti College</title>
  
  <!-- Material Symbols & Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Darker+Grotesque:wght@400;500;600;700;800;900&family=Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..700&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
  
  <!-- Tailwind CSS & Master Config -->
  <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
  <script src="/js/stitch-tailwind-config.js"></script>

  <!-- Stitch Design System & Nav Dock Styles -->
  <link rel="stylesheet" href="/css/stitch-design-system.css" />
  <link rel="stylesheet" href="/css/top-nav.css" />

  <!-- Lucide Icons & Shared State -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <script src="/js/stitch-state.js"></script>
  <script src="/js/dc-dynamic-island.js" defer></script>
</head>

<body class="bg-surface font-sans text-on-surface min-h-screen flex flex-col antialiased selection:bg-emerald-200 selection:text-emerald-950" 
      style="background-color: #FAF7F0; background-image: radial-gradient(circle at 10% 8%, rgba(16, 185, 129, 0.14) 0%, transparent 45%), radial-gradient(circle at 90% 12%, rgba(52, 211, 153, 0.12) 0%, transparent 42%), radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.05) 0%, transparent 60%), radial-gradient(circle at 80% 85%, rgba(5, 150, 105, 0.12) 0%, transparent 50%), radial-gradient(rgba(16, 185, 129, 0.08) 1px, transparent 1px); background-size: 100% 100%, 100% 100%, 100% 100%, 100% 100%, 28px 28px; background-attachment: fixed;">

  <!-- Main Content Viewport Wrapper (Offset below persistent top navigation) -->
  <main class="w-full flex-grow pt-[84px] md:pt-[92px]">
    <div class="max-w-[1240px] mx-auto px-4 sm:px-6 pb-12 flex flex-col gap-6 w-full">
      {main_content}
    </div>
  </main>

  <!-- Shared Samskruti Institutional Footer -->
  {footer_content}

  <!-- Add Skill Modal -->
  <div id="modalAddSkill" class="fixed inset-0 z-[20000] hidden bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-emerald-500/20 flex flex-col gap-5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <span class="material-symbols-outlined text-[24px]">add_circle</span>
          </div>
          <h3 class="text-2xl font-bold text-on-surface">Add Technical Skill</h3>
        </div>
        <button type="button" class="close-modal-btn text-stone-400 hover:text-stone-700 p-1">
          <span class="material-symbols-outlined text-[22px]">close</span>
        </button>
      </div>
      <form id="formAddSkill" class="flex flex-col gap-4">
        <div>
          <label class="block text-sm font-bold text-on-surface mb-1">Skill Name</label>
          <input type="text" id="newSkillInput" required placeholder="e.g. Docker / Flutter / IoT Telemetry" class="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
        </div>
        <div class="flex items-center justify-end gap-3 mt-2">
          <button type="button" class="close-modal-btn px-5 py-2 rounded-full border border-stone-200 font-bold text-on-surface-variant hover:bg-stone-50">Cancel</button>
          <button type="submit" class="px-6 py-2 rounded-full bg-primary hover:bg-emerald-800 text-white font-bold shadow-md transition-all">Add Skill</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Pending Invites Modal -->
  <div id="modalInvites" class="fixed inset-0 z-[20000] hidden bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-emerald-500/20 flex flex-col gap-5">
      <div class="flex items-center justify-between pb-3 border-b border-stone-200">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <span class="material-symbols-outlined text-[24px]">mark_email_unread</span>
          </div>
          <h3 class="text-2xl font-bold text-on-surface">Project Collaboration Invites</h3>
        </div>
        <button type="button" class="close-modal-btn text-stone-400 hover:text-stone-700 p-1">
          <span class="material-symbols-outlined text-[22px]">close</span>
        </button>
      </div>
      <div class="flex flex-col gap-3">
        <div class="p-4 rounded-2xl bg-surface-container-low border border-surface-container-highest flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center justify-center">GL</div>
            <div class="flex flex-col">
              <span class="font-bold text-base text-on-surface">Gona Laxmi Narasimha</span>
              <span class="text-xs text-stone-500">Project: State Hackathon 2025</span>
            </div>
          </div>
          <div class="flex gap-2">
            <button type="button" onclick="window.acceptInvite(this)" class="px-3 py-1 rounded-full bg-primary text-white text-xs font-bold hover:bg-emerald-800">Accept</button>
            <button type="button" onclick="this.closest('.p-4').remove()" class="px-3 py-1 rounded-full border border-stone-200 text-stone-600 text-xs font-bold hover:bg-stone-50">Decline</button>
          </div>
        </div>
        <div class="p-4 rounded-2xl bg-surface-container-low border border-surface-container-highest flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center justify-center">DT</div>
            <div class="flex flex-col">
              <span class="font-bold text-base text-on-surface">Dulipudi Tarun</span>
              <span class="text-xs text-stone-500">Project: Campus Smart Canteen</span>
            </div>
          </div>
          <div class="flex gap-2">
            <button type="button" onclick="window.acceptInvite(this)" class="px-3 py-1 rounded-full bg-primary text-white text-xs font-bold hover:bg-emerald-800">Accept</button>
            <button type="button" onclick="this.closest('.p-4').remove()" class="px-3 py-1 rounded-full border border-stone-200 text-stone-600 text-xs font-bold hover:bg-stone-50">Decline</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Toast Notification -->
  <div id="toastNotification" class="fixed bottom-6 right-6 z-[30000] hidden px-5 py-3 rounded-2xl bg-emerald-900 text-white font-bold text-base shadow-2xl flex items-center gap-3 border border-emerald-400/40 transform transition-all duration-300">
    <span class="material-symbols-outlined text-emerald-300 text-[20px]" id="toastIcon">check_circle</span>
    <span id="toastMsg">Action completed successfully</span>
  </div>

  <!-- Idea Hub Page Controller Script -->
  <script src="/screens/02-student-portal/idea-hub.js"></script>
</body>
</html>
"""

with open('C:/Users/HiteshHimesh/.gemini/antigravity/scratch/Digital-Campus/frontend/screens/02-student-portal/idea-hub.html', 'w', encoding='utf-8') as f:
    f.write(ideahub_html)

print("Generated frontend/screens/02-student-portal/idea-hub.html successfully!")
