import os, re

# Read stitch attendance HTML
with open('C:/Users/HiteshHimesh/.gemini/antigravity/scratch/Digital-Campus/stitch_campus_connect_design_system/campus_connect_attendance/code.html', 'r', encoding='utf-8') as f:
    stitch_html = f.read()

# Extract main content and footer
main_match = re.search(r'<main[^>]*>(.*?)</main>', stitch_html, re.DOTALL | re.IGNORECASE)
footer_match = re.search(r'<footer[^>]*>(.*?)</footer>', stitch_html, re.DOTALL | re.IGNORECASE)

main_content = main_match.group(1) if main_match else ""
footer_content = footer_match.group(0) if footer_match else ""

# Replace href="#" with javascript:void(0)
main_content = main_content.replace('href="#"', 'href="javascript:void(0)"')

# Add IDs and dynamic hooks
main_content = main_content.replace('>Download Official Statement</button>', ' id="btnDownloadStatement">Download Official Statement</button>')
main_content = main_content.replace('>File Medical Appeal</button>', ' id="btnFileMedicalAppeal">File Medical Appeal</button>')
main_content = main_content.replace('>Contact Academic Warden</button>', ' id="btnContactWarden">Contact Academic Warden</button>')
main_content = main_content.replace('>Grievance Portal <span', ' id="btnGrievancePortal">Grievance Portal <span')

# Add student profile hooks
main_content = main_content.replace('Karnati Himesh', '<span id="attStudentName">Karnati Himesh</span>')
main_content = main_content.replace('PIN: 24259-CS-025', '<span id="attStudentPin">PIN: 24259-CS-025</span>')
main_content = main_content.replace('Sem IV (2024-25)', '<span id="attStudentSem">Sem IV (2024-25)</span>')
main_content = main_content.replace('Last Biometric Punch: Today, 09:12 AM (Device #Bio-CSE-04)', '<span id="attLastPunch">Last Biometric Punch: Today, 09:12 AM (Device #Bio-CSE-04)</span>')

# KPI gauge hooks
main_content = main_content.replace('>27.78%<', ' id="kpiGaugeRate">27.78%<')
main_content = main_content.replace('>50 / 180 Sess<', ' id="kpiGaugePresent">50 / 180 Sess<')
main_content = main_content.replace('>-47.22%<', ' id="kpiGaugeDeficit">-47.22%<')
main_content = main_content.replace('>INELIGIBLE<', ' id="kpiGaugeBadge">INELIGIBLE<')

# KPI 2 prescription hooks
main_content = main_content.replace('>180<', ' id="kpiPrescriptionTotal">180<')
main_content = main_content.replace('>50<', ' id="kpiPrescriptionPresent">50<')
main_content = main_content.replace('>130<', ' id="kpiPrescriptionAbsent">130<')
main_content = main_content.replace('>08<', ' id="kpiPrescriptionRemaining">08<')
main_content = main_content.replace('33 consecutive sessions', '<span id="kpiConsecutiveNeeded">33 consecutive sessions</span>')

# SVG gauge path ID
main_content = re.sub(
    r'<circle\s+class="([^"]*)"\s+cx="60"\s+cy="60"\s+r="48"\s+stroke="url\(#gaugeGradient\)"\s+stroke-dasharray="301\.59"\s+stroke-dashoffset="([^"]*)"',
    r'<circle class="\1 transition-all duration-1000 ease-out" id="svgGaugeCircle" cx="60" cy="60" r="48" stroke="url(#gaugeGradient)" stroke-dasharray="301.59" stroke-dashoffset="\2"',
    main_content
)

attendance_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Biometric Attendance & Academic Eligibility — Samskruti College</title>
  
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

<body class="bg-surface font-sans text-on-surface min-h-screen flex flex-col antialiased selection:bg-emerald-200 selection:text-emerald-900 bg-mesh-pattern">

  <!-- Main Content Viewport Wrapper (Offset below persistent top navigation) -->
  <main class="w-full flex-grow pt-[84px] md:pt-[92px]">
    <div class="max-w-[1240px] mx-auto px-4 sm:px-6 pb-12 flex flex-col gap-6 w-full">
      {main_content}
    </div>
  </main>

  <!-- Shared Samskruti Institutional Footer -->
  {footer_content}

  <!-- Medical Appeal Modal -->
  <div id="modalMedicalAppeal" class="fixed inset-0 z-[20000] hidden bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-emerald-500/20 flex flex-col gap-5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <span class="material-symbols-outlined text-[24px]">medical_services</span>
          </div>
          <h3 class="text-2xl font-bold text-on-surface">File Medical Condonation Appeal</h3>
        </div>
        <button type="button" class="close-modal-btn text-stone-400 hover:text-stone-700 p-1">
          <span class="material-symbols-outlined text-[22px]">close</span>
        </button>
      </div>
      <p class="text-base text-on-surface-variant font-medium">
        Submit clinical certificate and hospital records for statutory SBTET condonation slab approval (65% – 74.9%).
      </p>
      <form id="formMedicalAppeal" class="flex flex-col gap-4">
        <div>
          <label class="block text-sm font-bold text-on-surface mb-1">Medical Diagnosis / Hospitalization Reason</label>
          <input type="text" required placeholder="e.g. Acute Dengue / Clinical Bedrest" class="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-bold text-on-surface mb-1">Period From</label>
            <input type="date" required class="w-full px-3 py-2 rounded-xl border border-stone-200 text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </div>
          <div>
            <label class="block text-sm font-bold text-on-surface mb-1">Period To</label>
            <input type="date" required class="w-full px-3 py-2 rounded-xl border border-stone-200 text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-bold text-on-surface mb-1">Attach Signed Medical Certificate (PDF / Image)</label>
          <input type="file" required accept=".pdf,.jpg,.jpeg,.png" class="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
        </div>
        <div class="flex items-center justify-end gap-3 mt-2">
          <button type="button" class="close-modal-btn px-5 py-2 rounded-full border border-stone-200 font-bold text-on-surface-variant hover:bg-stone-50">Cancel</button>
          <button type="submit" class="px-6 py-2 rounded-full bg-primary hover:bg-emerald-800 text-white font-bold shadow-md transition-all">Submit for HOD Endorsement</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Toast Notification -->
  <div id="toastNotification" class="fixed bottom-6 right-6 z-[30000] hidden px-5 py-3 rounded-2xl bg-emerald-900 text-white font-bold text-base shadow-2xl flex items-center gap-3 border border-emerald-400/40 transform transition-all duration-300">
    <span class="material-symbols-outlined text-emerald-300 text-[20px]" id="toastIcon">check_circle</span>
    <span id="toastMsg">Action completed successfully</span>
  </div>

  <!-- Attendance Page Controller Script -->
  <script src="/screens/02-student-portal/attendance.js"></script>
</body>
</html>
"""

with open('C:/Users/HiteshHimesh/.gemini/antigravity/scratch/Digital-Campus/frontend/screens/02-student-portal/attendance.html', 'w', encoding='utf-8') as f:
    f.write(attendance_html)

print("Generated frontend/screens/02-student-portal/attendance.html successfully!")
