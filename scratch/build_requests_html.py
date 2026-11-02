import os, re

with open('C:/Users/HiteshHimesh/.gemini/antigravity/scratch/Digital-Campus/stitch_campus_connect_design_system/campus_connect_certificate_requests/code.html', 'r', encoding='utf-8') as f:
    stitch_html = f.read()

# Extract main content and footer
main_match = re.search(r'<main[^>]*>(.*?)</main>', stitch_html, re.DOTALL | re.IGNORECASE)
footer_match = re.search(r'<footer[^>]*>(.*?)</footer>', stitch_html, re.DOTALL | re.IGNORECASE)

main_content = main_match.group(1) if main_match else ""
footer_content = footer_match.group(0) if footer_match else ""

# Replace href="#" with javascript:void(0)
main_content = main_content.replace('href="#"', 'href="javascript:void(0)"')

# Add IDs to buttons/interactive targets
main_content = main_content.replace('>Copy Token</button>', ' id="btnCopyOtp">Copy Token</button>')
main_content = main_content.replace('>View Preview <span', ' id="btnViewPdfPreview">View Preview <span')

# Add student hooks
main_content = main_content.replace('KARNATI HIMESH (PIN: 24259-CS-025)', '<span id="reqStudentMeta">KARNATI HIMESH (PIN: 24259-CS-025)</span>')

# Wrap the Active Requests list with an ID so we can prepend dynamically
main_content = main_content.replace(
    '<!-- Active Requests Stack -->\n<div class="flex flex-col gap-5">',
    '<!-- Active Requests Stack -->\n<div id="activeRequestsContainer" class="flex flex-col gap-5">'
)

requests_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Certificate & Bonafide Requests — Samskruti College</title>
  
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

<body class="bg-surface font-sans text-emerald-950 min-h-screen flex flex-col antialiased selection:bg-emerald-200 selection:text-emerald-900 bg-dot-pattern"
      style="background-color: #fcfaf6; background-image: radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.12) 0px, transparent 48%), radial-gradient(at 100% 20%, rgba(5, 150, 105, 0.10) 0px, transparent 44%), radial-gradient(at 48% 65%, rgba(52, 211, 153, 0.08) 0px, transparent 52%), radial-gradient(at 95% 90%, rgba(16, 185, 129, 0.09) 0px, transparent 45%), radial-gradient(circle at 1px 1px, rgba(16, 185, 129, 0.06) 1.2px, transparent 0px); background-size: 100% 100%, 100% 100%, 100% 100%, 100% 100%, 28px 28px;">

  <!-- Main Content Viewport Wrapper (Offset below persistent top navigation) -->
  <main class="w-full flex-grow pt-[84px] md:pt-[92px]">
    <div class="max-w-[1240px] mx-auto px-4 sm:px-6 pb-12 flex flex-col gap-6 w-full">
      {main_content}
    </div>
  </main>

  <!-- Shared Samskruti Institutional Footer -->
  {footer_content}

  <!-- PDF Preview Modal -->
  <div id="modalPdfPreview" class="fixed inset-0 z-[20000] hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-emerald-500/20 flex flex-col gap-5">
      <div class="flex items-center justify-between pb-3 border-b border-stone-200">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <span class="material-symbols-outlined text-[24px]">description</span>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-on-surface">SCET-BONAFIDE-24259025.pdf</h3>
            <span class="text-sm text-stone-500">Cryptographically Signed · SHA-256 Validated</span>
          </div>
        </div>
        <button type="button" class="close-modal-btn text-stone-400 hover:text-stone-700 p-1">
          <span class="material-symbols-outlined text-[22px]">close</span>
        </button>
      </div>
      <div class="p-6 rounded-2xl bg-surface-container-low border border-surface-container-highest flex flex-col gap-4 font-mono text-xs text-stone-700">
        <div class="flex justify-between items-center pb-2 border-b border-stone-200">
          <span class="font-bold text-sm text-emerald-950">SAMSKRUTI COLLEGE OF ENGINEERING & TECHNOLOGY</span>
          <span class="text-xs text-emerald-800 font-bold">CODE: 259</span>
        </div>
        <div class="flex flex-col gap-1">
          <div><span class="font-bold">STUDENT:</span> KARNATI HIMESH (PIN: 24259-CS-025)</div>
          <div><span class="font-bold">BRANCH:</span> Computer Science & Engineering (Diploma)</div>
          <div><span class="font-bold">ACADEMIC YEAR:</span> 2024-25 · 4th Semester</div>
          <div><span class="font-bold">PURPOSE:</span> Official Passport verification at RPO Hyderabad</div>
          <div><span class="font-bold">CLEARANCE OTP:</span> 5 8 4 3 8 6 (Counter 2 Academic Section)</div>
          <div><span class="font-bold">SIGN-OFF:</span> Dr. K. Srinivas (HOD) & Controller of Examinations</div>
        </div>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-xs text-stone-500 font-medium">Present your Student ID & OTP to collect stamped physical copy.</span>
        <button type="button" onclick="window.print()" class="px-6 py-2 rounded-full bg-primary hover:bg-emerald-800 text-white font-bold inline-flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]">print</span>
          <span>Print Attestation</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Toast Notification -->
  <div id="toastNotification" class="fixed bottom-6 right-6 z-[30000] hidden px-5 py-3 rounded-2xl bg-emerald-900 text-white font-bold text-base shadow-2xl flex items-center gap-3 border border-emerald-400/40 transform transition-all duration-300">
    <span class="material-symbols-outlined text-emerald-300 text-[20px]" id="toastIcon">check_circle</span>
    <span id="toastMsg">Action completed successfully</span>
  </div>

  <!-- Requests Page Controller Script -->
  <script src="/screens/02-student-portal/document-logistics.js"></script>
</body>
</html>
"""

with open('C:/Users/HiteshHimesh/.gemini/antigravity/scratch/Digital-Campus/frontend/screens/02-student-portal/document-logistics.html', 'w', encoding='utf-8') as f:
    f.write(requests_html)

print("Generated frontend/screens/02-student-portal/document-logistics.html successfully!")
