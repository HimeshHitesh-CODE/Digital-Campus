import os, re

with open('C:/Users/HiteshHimesh/.gemini/antigravity/scratch/Digital-Campus/stitch_campus_connect_design_system/campus_connect_marks_results/code.html', 'r', encoding='utf-8') as f:
    stitch_html = f.read()

# Extract main content and footer
main_match = re.search(r'<main[^>]*>(.*?)</main>', stitch_html, re.DOTALL | re.IGNORECASE)
footer_match = re.search(r'<footer[^>]*>(.*?)</footer>', stitch_html, re.DOTALL | re.IGNORECASE)

main_content = main_match.group(1) if main_match else ""
footer_content = footer_match.group(0) if footer_match else ""

# Replace href="#" with javascript:void(0)
main_content = main_content.replace('href="#"', 'href="javascript:void(0)"')

# Add IDs to buttons
main_content = main_content.replace('>Download Consolidated Memo</button>', ' id="btnDownloadMemo">Download Consolidated Memo</button>')
main_content = main_content.replace('>Print Memo</button>', ' id="btnPrintMemo">Print Memo</button>')
main_content = main_content.replace('>Apply for Recounting <span', ' id="btnApplyRecounting">Apply for Recounting <span')

# Add hooks to student summary banner
main_content = main_content.replace('Karnati Himesh', '<span id="marksStudentName">Karnati Himesh</span>')
main_content = main_content.replace('PIN: 24259-CS-025', '<span id="marksStudentPin">PIN: 24259-CS-025</span>')
main_content = main_content.replace('Branch: CS (Diploma Engg.)', '<span id="marksStudentBranch">Branch: CS (Diploma Engg.)</span>')
main_content = main_content.replace('>9.11<', ' id="marksCgpa">9.11<')
main_content = main_content.replace('>80.0<', ' id="marksCredits">80.0<')
main_content = main_content.replace('>0<', ' id="marksBacklogs">0<')

# Semester Tab buttons with data-sem attributes
main_content = main_content.replace('1st Sem (C-24)\n</button>', '1st Sem (C-24)\n</button>', 1)
main_content = re.sub(
    r'<button\s+class="([^"]*)"\s+type="button">\s*1st Sem \(C-24\)\s*</button>',
    r'<button class="sem-tab-btn \1" data-sem="1" type="button">1st Sem (C-24)</button>',
    main_content
)
main_content = re.sub(
    r'<button\s+class="([^"]*)"\s+type="button">\s*2nd Sem \(C-24\)\s*</button>',
    r'<button class="sem-tab-btn \1" data-sem="2" type="button">2nd Sem (C-24)</button>',
    main_content
)
main_content = re.sub(
    r'<button\s+class="([^"]*)"\s+type="button">\s*3rd Sem \(C-24\)\s*</button>',
    r'<button class="sem-tab-btn \1" data-sem="3" type="button">3rd Sem (C-24)</button>',
    main_content
)
main_content = re.sub(
    r'<button\s+class="([^"]*)"\s+type="button">\s*4th Sem \(Active Memo\)\s*</button>',
    r'<button class="sem-tab-btn active-tab \1" data-sem="4" type="button">4th Sem (Active Memo)</button>',
    main_content
)

# Table body ID
main_content = main_content.replace(
    '<tbody class="divide-y divide-emerald-900/5 text-neutral-800 text-base md:text-lg font-medium">',
    '<tbody id="marksTableBody" class="divide-y divide-emerald-900/5 text-neutral-800 text-base md:text-lg font-medium">'
)

# SGPA / Summary stats IDs
main_content = main_content.replace('>Sem 4 SGPA</span>\n<span class="text-lg md:text-xl font-black text-emerald-900">9.35</span>', '>Sem SGPA</span>\n<span id="tabSgpaVal" class="text-lg md:text-xl font-black text-emerald-900">9.35</span>')
main_content = main_content.replace('>22.5 Earned<', ' id="tabCreditsVal">22.5 Earned<')
main_content = main_content.replace('>851 / 1000<', ' id="tabTotalMarksVal">851 / 1000<')
main_content = main_content.replace('>85.10%<', ' id="tabAggregateVal">85.10%<')

results_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SBTET Examination Results & Transcripts — Samskruti College</title>
  
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

<body class="bg-surface font-sans text-neutral-900 min-h-screen flex flex-col antialiased selection:bg-emerald-200 selection:text-emerald-950" 
      style="background-color: #fcfaf6; background-image: radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.12) 0px, transparent 48%), radial-gradient(at 100% 20%, rgba(5, 150, 105, 0.10) 0px, transparent 44%), radial-gradient(at 48% 65%, rgba(52, 211, 153, 0.08) 0px, transparent 52%), radial-gradient(at 95% 90%, rgba(16, 185, 129, 0.09) 0px, transparent 45%), radial-gradient(circle at 1px 1px, rgba(16, 185, 129, 0.06) 1.2px, transparent 0px); background-size: 100% 100%, 100% 100%, 100% 100%, 100% 100%, 28px 28px;">

  <!-- Main Content Viewport Wrapper (Offset below persistent top navigation) -->
  <main class="w-full flex-grow pt-[84px] md:pt-[92px]">
    <div class="max-w-[1240px] mx-auto px-4 sm:px-6 pb-12 flex flex-col gap-6 w-full">
      {main_content}
    </div>
  </main>

  <!-- Shared Samskruti Institutional Footer -->
  {footer_content}

  <!-- Recounting Request Modal -->
  <div id="modalRecounting" class="fixed inset-0 z-[20000] hidden bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-emerald-500/20 flex flex-col gap-5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <span class="material-symbols-outlined text-[24px]">fact_check</span>
          </div>
          <h3 class="text-2xl font-bold text-on-surface">Apply for SBTET Recounting</h3>
        </div>
        <button type="button" class="close-modal-btn text-stone-400 hover:text-stone-700 p-1">
          <span class="material-symbols-outlined text-[22px]">close</span>
        </button>
      </div>
      <p class="text-base text-on-surface-variant font-medium">
        Prescribed SBTET fee is ₹400 per theory paper for clerical recount and marks retabulation.
      </p>
      <form id="formRecounting" class="flex flex-col gap-4">
        <div>
          <label class="block text-sm font-bold text-on-surface mb-1">Select Subject</label>
          <select required class="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none">
            <option value="SC-401">SC-401 — Advanced Engineering Mathematics (Marks: 65)</option>
            <option value="CS-402">CS-402 — Java Programming & OOP Concepts (Marks: 79)</option>
            <option value="CS-403">CS-403 — Python for Data Analysis (Marks: 81)</option>
            <option value="CS-404">CS-404 — Relational Database Management Systems (Marks: 72)</option>
            <option value="CS-405">CS-405 — Applied Cryptography & Network Security (Marks: 68)</option>
            <option value="CS-406">CS-406 — Operating Systems Internals (Marks: 81)</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-bold text-on-surface mb-1">Reason for Recounting Challenge</label>
          <textarea required rows="2" placeholder="e.g. Expected 80+ in Part-B theory valuation..." class="w-full px-4 py-2 rounded-xl border border-stone-200 text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"></textarea>
        </div>
        <div class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-sm text-emerald-900 font-semibold flex items-center justify-between">
          <span>Examination Fee (Pre-cleared via Challan)</span>
          <span class="font-bold text-base">₹400.00</span>
        </div>
        <div class="flex items-center justify-end gap-3 mt-1">
          <button type="button" class="close-modal-btn px-5 py-2 rounded-full border border-stone-200 font-bold text-on-surface-variant hover:bg-stone-50">Cancel</button>
          <button type="submit" class="px-6 py-2 rounded-full bg-primary hover:bg-emerald-800 text-white font-bold shadow-md transition-all">Submit Recounting Application</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Toast Notification -->
  <div id="toastNotification" class="fixed bottom-6 right-6 z-[30000] hidden px-5 py-3 rounded-2xl bg-emerald-900 text-white font-bold text-base shadow-2xl flex items-center gap-3 border border-emerald-400/40 transform transition-all duration-300">
    <span class="material-symbols-outlined text-emerald-300 text-[20px]" id="toastIcon">check_circle</span>
    <span id="toastMsg">Action completed successfully</span>
  </div>

  <!-- Results Page Controller Script -->
  <script src="/screens/02-student-portal/results.js"></script>
</body>
</html>
"""

with open('C:/Users/HiteshHimesh/.gemini/antigravity/scratch/Digital-Campus/frontend/screens/02-student-portal/results.html', 'w', encoding='utf-8') as f:
    f.write(results_html)

print("Generated frontend/screens/02-student-portal/results.html successfully!")
