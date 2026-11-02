dash_html_path = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\dashboard.html"
with open(dash_html_path, "r", encoding="utf-8") as f:
    html = f.read()

target = '<a class="flex-1 text-center py-2 rounded-full bg-primary text-white text-lg font-bold hover:bg-emerald-800 transition-colors shadow-sm" href="javascript:void(0)">\n              Schedule Appointment\n            </a>'

replacement = '<a class="flex-1 text-center py-2 rounded-full bg-primary text-white text-lg font-bold hover:bg-emerald-800 transition-colors shadow-sm" href="https://www.sbtet.telangana.gov.in/index.html#!/index/ContactUs" target="_blank" rel="noopener noreferrer" id="btnScheduleAppt">\n              Schedule Appointment\n            </a>'

if target in html:
    html = html.replace(target, replacement)
    print("Replaced Schedule Appointment link with official SBTET ContactUs URL!")
else:
    # Try flexible regex
    import re
    html = re.sub(
        r'<a[^>]*href="javascript:void\(0\)"[^>]*>\s*Schedule Appointment\s*</a>',
        replacement,
        html
    )
    print("Replaced via regex!")

with open(dash_html_path, "w", encoding="utf-8") as f:
    f.write(html)
