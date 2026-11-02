results_path = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\results.html"
with open(results_path, "r", encoding="utf-8") as f:
    res_html = f.read()

# 1. Add id="printableMemoCard" to the subject table section
res_html = res_html.replace(
    '<section class="glass-card rounded-[30px] p-6 md:p-8 flex flex-col gap-6">',
    '<section class="glass-card rounded-[30px] p-6 md:p-8 flex flex-col gap-6" id="printableMemoCard">'
)

# 2. Add print styles
print_css = """
  <style>
    @media print {
      body * {
        visibility: hidden !important;
      }
      #printableMemoCard, #printableMemoCard * {
        visibility: visible !important;
      }
      #printableMemoCard {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        background: #ffffff !important;
        color: #000000 !important;
        border: 2px solid #047857 !important;
        box-shadow: none !important;
        padding: 24px !important;
      }
      .app-global-header, .dc-floating-island-wrapper, footer, button {
        display: none !important;
      }
    }
  </style>
"""
res_html = res_html.replace("</head>", print_css + "\n</head>")

# 3. Wire Apply for Recounting link
old_recount = '<a class="inline-flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-700 to-teal-600 text-white font-bold text-lg shadow-md hover:brightness-105 transition-all" href="javascript:void(0)">\n<span>Apply for Recounting</span>\n<span class="material-symbols-outlined text-[18px]">arrow_forward</span>\n</a>'

new_recount = '<a class="inline-flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-700 to-teal-600 text-white font-bold text-lg shadow-md hover:brightness-105 transition-all cursor-pointer" href="https://www.sbtet.telangana.gov.in/index.html#!/index/DiplomaStudentServices" target="_blank" rel="noopener noreferrer">\n<span>Apply for SBTET Re-evaluation / Recounting &rarr;</span>\n<span class="material-symbols-outlined text-[18px]">open_in_new</span>\n</a>'

if old_recount in res_html:
    res_html = res_html.replace(old_recount, new_recount)
    print("Replaced old_recount!")
else:
    import re
    res_html = re.sub(
        r'<a[^>]*href="javascript:void\(0\)"[^>]*>\s*<span>Apply for Recounting</span>[\s\S]*?</a>',
        new_recount,
        res_html
    )
    print("Replaced recount via regex!")

with open(results_path, "w", encoding="utf-8") as f:
    f.write(res_html)

print("results.html updated successfully!")
