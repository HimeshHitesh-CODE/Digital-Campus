import re

path = r'C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\marketplace.html'

with open(path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Fix '+ Sell an Item' to 'Sell an Item'
html = html.replace('<span>+ Sell an Item</span>', '<span>Sell an Item</span>')

# 2. Find the start of the first footer
footer_marker = '<!-- Shared Samskruti Institutional Footer -->'
parts = html.split(footer_marker)

if len(parts) >= 2:
    before_footer = parts[0]
    # Remove any trailing duplicated modal/scripts from before_footer if any
    # Remove inline <script>...</script> from before_footer
    before_footer = re.sub(r'<script>[\s\S]*?</script>', '', before_footer)
    
    # Check if </main> is in before_footer
    if '</main>' not in before_footer:
        before_footer += '\n    </div>\n  </main>\n\n  '

    # The footer itself
    footer_content = """<!-- Shared Samskruti Institutional Footer -->
  <footer class="w-full bg-[#f3efe6]/90 border-t border-emerald-900/10 mt-16 relative z-10">
    <div class="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-emerald-900/10">
        <div class="flex flex-col gap-1 text-center md:text-left">
          <div class="flex items-center justify-center md:justify-start gap-2">
            <span class="font-title-editorial text-2xl text-emerald-950 font-bold">Samskruti College of Engineering &amp; Technology</span>
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-dg text-sm font-bold">Code 259</span>
          </div>
          <p class="font-dg text-base text-stone-600 font-medium">Permanent SBTET &amp; AICTE Affiliation. Autonomous Campus Registry &amp; Academic Management Portal.</p>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-2">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-emerald-900/10 shadow-sm">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="font-dg text-sm text-on-surface font-bold">Biometric Sync Online</span>
          </div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 border border-emerald-900/10 shadow-sm">
            <span class="material-symbols-outlined text-emerald-700 text-[16px]">verified</span>
            <span class="font-dg text-sm text-on-surface font-bold">SBTET Verified Hub</span>
          </div>
        </div>
      </div>
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 text-stone-600">
        <span class="font-dg text-base">© 2025 Samskruti College. PIN 24259-CS-025 Registry. All rights reserved.</span>
        <div class="flex items-center gap-4">
          <a class="font-dg text-base font-semibold hover:text-emerald-800 transition-colors" href="#">Academic Regulations</a>
          <a class="font-dg text-base font-semibold hover:text-emerald-800 transition-colors" href="#">Attendance Mandates</a>
          <a class="font-dg text-base font-semibold hover:text-emerald-800 transition-colors" href="#">Campus Support</a>
        </div>
      </div>
    </div>
  </footer>

  <!-- Toast Notification -->
  <div id="toast" class="fixed bottom-6 right-6 z-[30000] hidden px-5 py-3 rounded-2xl bg-emerald-900 text-white font-bold text-base shadow-2xl flex items-center gap-3 border border-emerald-400/40 transform transition-all duration-300">
    <span class="material-symbols-outlined text-emerald-300 text-[20px]" id="toast-icon">check_circle</span>
    <span id="toast-message">Action completed successfully</span>
  </div>

  <!-- Marketplace Controller Script -->
  <script src="/screens/02-student-portal/marketplace.js"></script>
</body>
</html>"""

    new_html = before_footer + footer_content
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_html)
    print("Marketplace HTML cleanly rebuilt!")
else:
    print("Could not find footer marker!")
