import re

# 1. Update attendance.html
att_path = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\attendance.html"
with open(att_path, "r", encoding="utf-8") as f:
    att_html = f.read()

# Remove File Medical Appeal button
att_html = re.sub(
    r'<button[^>]*class="[^"]*rounded-full bg-emerald-50[^"]*"[^>]*>[\s\S]*?File Medical Appeal[\s\S]*?</button>',
    '',
    att_html
)

# Remove Subject-Wise Biometric Audit table & Discrepancy Rectification Desk banner
# From <!-- Bottom Section: Subject-Wise Biometric Audit Table --> down to <script>
att_html = re.sub(
    r'<!-- Bottom Section: Subject-Wise Biometric Audit Table -->[\s\S]*?(?=<script>)',
    '',
    att_html
)

# Remove Medical Appeal Modal
att_html = re.sub(
    r'<!-- Medical Appeal Modal -->[\s\S]*?</div>\s*</div>\s*(?=</body>|</html>|$)',
    '',
    att_html
)

# Add SVG gauge animation styles in <style>
gauge_animation_css = """
    /* Phase 4: Gauge & Trajectory Line Chart Animations */
    .gauge-circle-track {
      transition: stroke-dashoffset 1.8s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .trajectory-line-path {
      stroke-dasharray: 1000;
      stroke-dashoffset: 1000;
      animation: drawLine 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
    @keyframes drawLine {
      to { stroke-dashoffset: 0; }
    }
"""
if "gauge-circle-track" not in att_html:
    att_html = att_html.replace("</style>", gauge_animation_css + "\n  </style>")

with open(att_path, "w", encoding="utf-8") as f:
    f.write(att_html)
print("attendance.html updated!")

# 2. Update results.html
results_path = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\results.html"
with open(results_path, "r", encoding="utf-8") as f:
    res_html = f.read()

# Add Isolated Memo Print styles in <style>
isolated_print_css = """
    /* Phase 4: Isolated Consolidated Marks Memo Print Styles */
    @media print {
      body {
        background: #ffffff !important;
        color: #000000 !important;
      }
      .app-global-header,
      .dc-floating-island-wrapper,
      footer,
      nav,
      .no-print,
      #modalRecounting,
      button,
      .fixed {
        display: none !important;
      }
      /* Only display the consolidated memo card */
      #printableMemoCard {
        display: block !important;
        position: static !important;
        width: 100% !important;
        max-width: 100% !important;
        box-shadow: none !important;
        border: 2px solid #064e3b !important;
        padding: 32px !important;
        margin: 0 auto !important;
      }
    }
"""

if "printableMemoCard" not in res_html:
    res_html = res_html.replace("</style>", isolated_print_css + "\n  </style>")

# Wire Apply for Recounting / Re-evaluation button to official SBTET portal
res_html = re.sub(
    r'<button[^>]*class="[^"]*rounded-full bg-emerald-50[^"]*"[^>]*>[\s\S]*?Apply for Recounting[\s\S]*?</button>',
    r'<a href="https://www.sbtet.telangana.gov.in/index.html#!/index/DiplomaStudentServices" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-primary border border-emerald-500/25 font-bold text-sm transition-all inline-flex items-center gap-1.5 shadow-sm active:scale-95"><span class="material-symbols-outlined text-[17px] text-emerald-700">open_in_new</span><span>Apply for SBTET Re-evaluation &rarr;</span></a>',
    res_html
)

# Mark the main results section with id="printableMemoCard"
if 'id="printableMemoCard"' not in res_html:
    res_html = res_html.replace(
        '<!-- Main Results Container Card -->',
        '<!-- Main Results Container Card -->\n      <div id="printableMemoCard">'
    )
    # close it before the next section
    res_html = res_html.replace(
        '<!-- Bottom Row: Semester Progression & Discrepancy Reporting -->',
        '</div>\n      <!-- Bottom Row: Semester Progression & Discrepancy Reporting -->'
    )

with open(results_path, "w", encoding="utf-8") as f:
    f.write(res_html)
print("results.html updated!")
