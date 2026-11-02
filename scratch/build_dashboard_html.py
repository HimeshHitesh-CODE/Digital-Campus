import os, re

# Read stitch home HTML
with open('C:/Users/HiteshHimesh/.gemini/antigravity/scratch/Digital-Campus/stitch_campus_connect_design_system/campus_connect_home/code.html', 'r', encoding='utf-8') as f:
    stitch_html = f.read()

# Extract main content and footer
main_match = re.search(r'<main[^>]*>(.*?)</main>', stitch_html, re.DOTALL | re.IGNORECASE)
footer_match = re.search(r'<footer[^>]*>(.*?)</footer>', stitch_html, re.DOTALL | re.IGNORECASE)

main_content = main_match.group(1) if main_match else ""
footer_content = footer_match.group(0) if footer_match else ""

# Replace static href="#" with actual routes in main_content
main_content = main_content.replace('href="#"', 'href="javascript:void(0)"')

# Wire specific buttons/links
main_content = re.sub(
    r'<a\s+class="([^"]*)"\s+href="javascript:void\(0\)"\s*>\s*<span>View Attendance</span>',
    r'<a class="\1" href="./attendance.html" id="btnViewAttendance"><span>View Attendance</span>',
    main_content
)
main_content = re.sub(
    r'<a\s+class="([^"]*)"\s+href="javascript:void\(0\)"\s*>\s*<span>View Result</span>',
    r'<a class="\1" href="./results.html" id="btnViewResult"><span>View Result</span>',
    main_content
)
main_content = re.sub(
    r'<a\s+class="([^"]*)"\s+href="javascript:void\(0\)"\s*>\s*<span class="">Detailed Registry</span>',
    r'<a class="\1" href="./attendance.html" id="btnDetailedRegistry"><span class="">Detailed Registry</span>',
    main_content
)

# Wire 6 module CTAs
main_content = main_content.replace('>Access Tracker <span class="material-symbols-outlined text-[17px]">arrow_forward</span></a>', ' id="ctaAttendance" href="./attendance.html">Access Tracker <span class="material-symbols-outlined text-[17px]">arrow_forward</span></a>')
main_content = main_content.replace('>View Marks <span class="material-symbols-outlined text-[17px]">arrow_forward</span></a>', ' id="ctaMarks" href="./results.html">View Marks <span class="material-symbols-outlined text-[17px]">arrow_forward</span></a>')
main_content = main_content.replace('>Open Requests <span class="material-symbols-outlined text-[17px]">arrow_forward</span></a>', ' id="ctaRequests" href="./document-logistics.html">Open Requests <span class="material-symbols-outlined text-[17px]">arrow_forward</span></a>')
main_content = main_content.replace('>Explore Hub <span class="material-symbols-outlined text-[17px]">arrow_forward</span></a>', ' id="ctaIdeaHub" href="./idea-hub.html">Explore Hub <span class="material-symbols-outlined text-[17px]">arrow_forward</span></a>')
main_content = main_content.replace('>Browse Goods <span class="material-symbols-outlined text-[17px]">arrow_forward</span></a>', ' id="ctaMarketplace" href="./marketplace.html">Browse Goods <span class="material-symbols-outlined text-[17px]">arrow_forward</span></a>')
main_content = main_content.replace('>Branches <span class="material-symbols-outlined text-[17px]">arrow_forward</span></a>', ' id="ctaBranches" href="./academic-disciplines.html">Branches <span class="material-symbols-outlined text-[17px]">arrow_forward</span></a>')

# Add IDs to buttons
main_content = main_content.replace('>Submit Medical Excuse</button>', ' id="btnSubmitMedical">Submit Medical Excuse</button>')
main_content = main_content.replace('>Faculty Advisor Log</button>', ' id="btnFacultyAdvisorLog">Faculty Advisor Log</button>')
main_content = main_content.replace('>Download Schedule PDF</button>', ' id="btnDownloadSchedule">Download Schedule PDF</button>')
main_content = main_content.replace('>View All Institutional Notices</button>', ' id="btnViewAllNotices">View All Institutional Notices</button>')
main_content = main_content.replace('>Schedule Appointment</button>', ' id="btnScheduleAppt">Schedule Appointment</button>')
main_content = main_content.replace('<button aria-label="Call faculty advisor"', '<button id="btnCallAdvisor" aria-label="Call faculty advisor"')

# Add dynamic hook IDs to greeting & telemetry
main_content = main_content.replace('Good morning, Karnati Himesh', '<span id="heroGreeting">Good morning, Karnati Himesh</span>')
main_content = main_content.replace('PIN: 24259-CS-025', '<span id="heroStudentPin">PIN: 24259-CS-025</span>')
main_content = main_content.replace('4th Semester CSE', '<span id="heroStudentSem">4th Semester CSE</span>')
main_content = main_content.replace('Code: 259', '<span id="heroCollegeCode">Code: 259</span>')
main_content = main_content.replace('Updated Today, 08:30 AM', '<span id="heroTimestamp">Updated Today, 08:30 AM</span>')

# Telemetry IDs
main_content = main_content.replace('>27.78%</span>', ' id="telemetryOverallRate">27.78%</span>')
main_content = main_content.replace('style="width: 27.78%;', 'id="telemetryRateBar" style="width: 27.78%;')
main_content = main_content.replace('>50<', ' id="telemetryPresent">50<')
main_content = main_content.replace('>180<', ' id="telemetryPool">180<')
main_content = main_content.replace('>65.00%<', ' id="telemetryCutoff">65.00%<')

dashboard_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Samskruti Digital Campus — Student Gateway</title>
  
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

<body class="bg-surface font-sans text-on-surface min-h-screen flex flex-col antialiased selection:bg-emerald-200 selection:text-emerald-900" 
      style="background-color: #fcfaf6; background-image: radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.12) 0px, transparent 48%), radial-gradient(at 100% 20%, rgba(5, 150, 105, 0.10) 0px, transparent 44%), radial-gradient(at 48% 65%, rgba(52, 211, 153, 0.08) 0px, transparent 52%), radial-gradient(at 95% 90%, rgba(16, 185, 129, 0.09) 0px, transparent 45%), radial-gradient(circle at 1px 1px, rgba(16, 185, 129, 0.06) 1.2px, transparent 0px); background-size: 100% 100%, 100% 100%, 100% 100%, 100% 100%, 28px 28px;">

  <!-- Main Content Viewport Wrapper (Offset below persistent top navigation) -->
  <main class="w-full flex-grow pt-[84px] md:pt-[92px]">
    {main_content}
  </main>

  <!-- Shared Samskruti Institutional Footer -->
  {footer_content}

  <!-- Interactive Modals Container -->
  <!-- 1. Medical Excuse Modal -->
  <div id="modalMedicalExcuse" class="fixed inset-0 z-[20000] hidden bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-emerald-500/20 flex flex-col gap-5 transform transition-all">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <span class="material-symbols-outlined text-[24px]">medical_services</span>
          </div>
          <h3 class="text-2xl font-bold text-on-surface">Submit Medical Excuse</h3>
        </div>
        <button type="button" class="close-modal-btn text-stone-400 hover:text-stone-700 p-1">
          <span class="material-symbols-outlined text-[22px]">close</span>
        </button>
      </div>
      <p class="text-base text-on-surface-variant font-medium">
        Medical appeals require verified clinical documentation endorsed by a registered medical practitioner and college physician.
      </p>
      <form id="formMedicalExcuse" class="flex flex-col gap-4">
        <div>
          <label class="block text-sm font-bold text-on-surface mb-1">Reason / Diagnosis</label>
          <input type="text" required placeholder="e.g. Viral Pyrexia / Clinical Hospitalization" class="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-bold text-on-surface mb-1">Absence From</label>
            <input type="date" required class="w-full px-3 py-2 rounded-xl border border-stone-200 text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </div>
          <div>
            <label class="block text-sm font-bold text-on-surface mb-1">Absence To</label>
            <input type="date" required class="w-full px-3 py-2 rounded-xl border border-stone-200 text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-bold text-on-surface mb-1">Attach Medical Certificate (PDF / JPG)</label>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" class="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
        </div>
        <div class="flex items-center justify-end gap-3 mt-2">
          <button type="button" class="close-modal-btn px-5 py-2 rounded-full border border-stone-200 font-bold text-on-surface-variant hover:bg-stone-50">Cancel</button>
          <button type="submit" class="px-6 py-2 rounded-full bg-primary hover:bg-emerald-800 text-white font-bold shadow-md transition-all">Submit to HOD</button>
        </div>
      </form>
    </div>
  </div>

  <!-- 2. Faculty Advisor Log Modal -->
  <div id="modalAdvisorLog" class="fixed inset-0 z-[20000] hidden bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-emerald-500/20 flex flex-col gap-5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <span class="material-symbols-outlined text-[24px]">support_agent</span>
          </div>
          <h3 class="text-2xl font-bold text-on-surface">Faculty Advisor Log</h3>
        </div>
        <button type="button" class="close-modal-btn text-stone-400 hover:text-stone-700 p-1">
          <span class="material-symbols-outlined text-[22px]">close</span>
        </button>
      </div>
      <div class="flex flex-col gap-3 p-4 rounded-2xl bg-surface-container-low border border-surface-container-highest">
        <span class="text-xl font-bold text-primary">Dr. S. K. Murthy, Ph.D.</span>
        <span class="text-base text-on-surface-variant font-medium">Academic Counselor · Computer Science & Engineering</span>
        <div class="flex items-center gap-2 text-sm text-secondary font-semibold">
          <span class="material-symbols-outlined text-[18px]">meeting_room</span> Cabin B-204 (Block-B 2nd Floor)
        </div>
        <div class="flex items-center gap-2 text-sm text-secondary font-semibold">
          <span class="material-symbols-outlined text-[18px]">schedule</span> Consultation: 03:00 PM – 04:30 PM (Mon–Fri)
        </div>
      </div>
      <p class="text-sm text-on-surface-variant">
        Latest Academic Remark: "Student attendance deficit flagged for SBTET Sem-IV. Advised to maintain 100% presence in remaining instructional pool."
      </p>
      <div class="flex items-center justify-end gap-3">
        <button type="button" class="close-modal-btn px-6 py-2 rounded-full bg-primary hover:bg-emerald-800 text-white font-bold">Acknowledge</button>
      </div>
    </div>
  </div>

  <!-- 3. All Notices Modal -->
  <div id="modalAllNotices" class="fixed inset-0 z-[20000] hidden bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 shadow-2xl border border-emerald-500/20 flex flex-col gap-5">
      <div class="flex items-center justify-between pb-3 border-b border-stone-200">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <span class="material-symbols-outlined text-[24px]">campaign</span>
          </div>
          <h3 class="text-2xl font-bold text-on-surface">Official Institutional Notices</h3>
        </div>
        <button type="button" class="close-modal-btn text-stone-400 hover:text-stone-700 p-1">
          <span class="material-symbols-outlined text-[22px]">close</span>
        </button>
      </div>
      <div class="flex flex-col gap-4">
        <div class="p-4 rounded-2xl bg-surface-container-low border border-surface-container-highest flex flex-col gap-1.5">
          <div class="flex items-center justify-between">
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase">Regulatory</span>
            <span class="text-xs text-stone-500">Yesterday</span>
          </div>
          <h4 class="text-xl font-bold text-on-surface">SBTET Diploma Examination Fee Notification & Hall Ticket Criteria</h4>
          <p class="text-base text-on-surface-variant">Candidates with biometric attendance above 75% are permitted to submit the C-20/C-24 examination fee without penalty through the college counter.</p>
        </div>
        <div class="p-4 rounded-2xl bg-surface-container-low border border-surface-container-highest flex flex-col gap-1.5">
          <div class="flex items-center justify-between">
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase">Scholarship</span>
            <span class="text-xs text-stone-500">3 days ago</span>
          </div>
          <h4 class="text-xl font-bold text-on-surface">State ePASS Renewal Biometric Verification Deadline</h4>
          <p class="text-base text-on-surface-variant">All post-matric eligible students must complete their iris/fingerprint auth at the Administration Block Room 104 before the upcoming weekend.</p>
        </div>
        <div class="p-4 rounded-2xl bg-surface-container-low border border-surface-container-highest flex flex-col gap-1.5">
          <div class="flex items-center justify-between">
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase">Academics</span>
            <span class="text-xs text-stone-500">5 days ago</span>
          </div>
          <h4 class="text-xl font-bold text-on-surface">Mid-Term II Examination Schedule Released</h4>
          <p class="text-base text-on-surface-variant">Computer Science & Engineering Department timetable published. Syllabus encompasses Units 3 and 4 across all core engineering subjects.</p>
        </div>
      </div>
      <div class="flex items-center justify-end">
        <a href="./circulars.html" class="px-6 py-2 rounded-full bg-primary hover:bg-emerald-800 text-white font-bold inline-flex items-center gap-2">
          <span>Go to Circulars Archive</span>
          <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
        </a>
      </div>
    </div>
  </div>

  <!-- Toast Notification -->
  <div id="toastNotification" class="fixed bottom-6 right-6 z-[30000] hidden px-5 py-3 rounded-2xl bg-emerald-900 text-white font-bold text-base shadow-2xl flex items-center gap-3 border border-emerald-400/40 transform transition-all duration-300">
    <span class="material-symbols-outlined text-emerald-300 text-[20px]" id="toastIcon">check_circle</span>
    <span id="toastMsg">Action completed successfully</span>
  </div>

  <!-- Dashboard Page Controller Script -->
  <script src="/screens/02-student-portal/dashboard.js"></script>
</body>
</html>
"""

with open('C:/Users/HiteshHimesh/.gemini/antigravity/scratch/Digital-Campus/frontend/screens/02-student-portal/dashboard.html', 'w', encoding='utf-8') as f:
    f.write(dashboard_html)

print("Generated frontend/screens/02-student-portal/dashboard.html successfully!")
