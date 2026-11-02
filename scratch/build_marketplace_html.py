import os, re

with open('C:/Users/HiteshHimesh/.gemini/antigravity/scratch/Digital-Campus/stitch_campus_connect_design_system/campus_connect_marketplace/code.html', 'r', encoding='utf-8') as f:
    stitch_html = f.read()

# Extract main content, modal, and footer
main_match = re.search(r'<main[^>]*>(.*?)</main>', stitch_html, re.DOTALL | re.IGNORECASE)
footer_match = re.search(r'<footer[^>]*>(.*?)</footer>', stitch_html, re.DOTALL | re.IGNORECASE)
modal_match = re.search(r'(<div[^>]*id=["\']sell-modal["\'].*?</div>\s*</div>\s*</div>)', stitch_html, re.DOTALL | re.IGNORECASE)

main_content = main_match.group(1) if main_match else ""
footer_content = footer_match.group(0) if footer_match else ""
modal_content = modal_match.group(1) if modal_match else ""

# Replace href="#" with javascript:void(0)
main_content = main_content.replace('href="#"', 'href="javascript:void(0)"')

# Add student hook
main_content = main_content.replace('KARNATI HIMESH (PIN: 24259-CS-025)', '<span id="mktStudentMeta">KARNATI HIMESH (PIN: 24259-CS-025)</span>')
main_content = main_content.replace('All Surplus (48)', '<span id="allSurplusCount">All Surplus (48)</span>')

marketplace_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Student Marketplace & Exchange — Samskruti College</title>
  
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

<body class="bg-surface font-sans text-on-surface min-h-screen flex flex-col antialiased selection:bg-emerald-200 selection:text-emerald-950 bg-mesh-grid"
      style="background-color: #fcfaf6; background-image: radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.12) 0px, transparent 48%), radial-gradient(at 100% 20%, rgba(5, 150, 105, 0.10) 0px, transparent 44%), radial-gradient(at 48% 65%, rgba(52, 211, 153, 0.08) 0px, transparent 52%), radial-gradient(at 95% 90%, rgba(16, 185, 129, 0.09) 0px, transparent 45%), radial-gradient(circle at 1px 1px, rgba(16, 185, 129, 0.06) 1.2px, transparent 0px); background-size: 100% 100%, 100% 100%, 100% 100%, 100% 100%, 28px 28px;">

  <!-- Main Content Viewport Wrapper (Offset below persistent top navigation) -->
  <main class="w-full flex-grow pt-[84px] md:pt-[92px]">
    <div class="max-w-[1240px] mx-auto px-4 sm:px-6 pb-12 flex flex-col gap-6 w-full">
      {main_content}
    </div>
  </main>

  <!-- Shared Samskruti Institutional Footer -->
  {footer_content}

  <!-- Sell an Item Modal -->
  {modal_content}

  <!-- Toast Notification -->
  <div id="toast" class="fixed bottom-6 right-6 z-[30000] hidden px-5 py-3 rounded-2xl bg-emerald-900 text-white font-bold text-base shadow-2xl flex items-center gap-3 border border-emerald-400/40 transform transition-all duration-300">
    <span class="material-symbols-outlined text-emerald-300 text-[20px]" id="toastIcon">check_circle</span>
    <span id="toast-message">Action completed successfully</span>
  </div>

  <!-- Marketplace Page Controller Script -->
  <script src="/screens/02-student-portal/marketplace.js"></script>
</body>
</html>
"""

with open('C:/Users/HiteshHimesh/.gemini/antigravity/scratch/Digital-Campus/frontend/screens/02-student-portal/marketplace.html', 'w', encoding='utf-8') as f:
    f.write(marketplace_html)

print("Generated frontend/screens/02-student-portal/marketplace.html successfully!")
