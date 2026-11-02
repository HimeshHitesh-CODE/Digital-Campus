marketplace_js_path = r'C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\marketplace.js'
marketplace_html_path = r'C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\marketplace.html'

with open(marketplace_js_path, 'r', encoding='utf-8') as f:
    js = f.read()

# Update openModal and closeModal
old_open_close = """  function openModal() {
    if (!modal) return;
    modal.classList.remove('hidden');
    setTimeout(() => {
      if (modalBackdrop) modalBackdrop.classList.remove('opacity-0');
      if (modalContent) {
        modalContent.classList.remove('opacity-0', 'scale-95');
        modalContent.classList.add('opacity-100', 'scale-100');
      }
    }, 20);
  }

  function closeModal() {
    if (!modal) return;
    if (modalBackdrop) modalBackdrop.classList.add('opacity-0');
    if (modalContent) {
      modalContent.classList.remove('opacity-100', 'scale-100');
      modalContent.classList.add('opacity-0', 'scale-95');
    }
    setTimeout(() => {
      modal.classList.add('hidden');
      if (form) form.reset();
    }, 200);
  }"""

new_open_close = """  function openModal() {
    if (!modal) return;
    modal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
    if (modalBackdrop) modalBackdrop.classList.remove('opacity-0', 'pointer-events-none');
    if (modalContent) {
      modalContent.classList.remove('opacity-0', 'scale-95');
      modalContent.classList.add('opacity-100', 'scale-100');
    }
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.add('opacity-0', 'pointer-events-none');
    if (modalBackdrop) modalBackdrop.classList.add('opacity-0', 'pointer-events-none');
    if (modalContent) {
      modalContent.classList.remove('opacity-100', 'scale-100');
      modalContent.classList.add('opacity-0', 'scale-95');
    }
    setTimeout(() => {
      modal.classList.add('hidden');
      if (form) form.reset();
    }, 200);
  }"""

js = js.replace(old_open_close, new_open_close)

# Also update form extraction fallbacks
old_form_extract = """      const title = document.getElementById('item-title')?.value || 'Listed Campus Item';
      const cat = document.getElementById('item-category')?.value || 'textbooks';
      const price = document.getElementById('item-price')?.value || '150';
      const cond = document.getElementById('item-condition')?.value || 'Good';
      const desc = document.getElementById('item-desc')?.value || '';"""

new_form_extract = """      const title = document.getElementById('item-title')?.value || form.querySelector('input[placeholder*="Drafter"]')?.value || 'Listed Campus Item';
      const cat = document.getElementById('item-category')?.value || form.querySelector('select')?.value || 'textbooks';
      const price = document.getElementById('item-price')?.value || form.querySelector('input[type="number"]')?.value || '150';
      const cond = document.getElementById('item-condition')?.value || form.querySelector('input[placeholder*="Like New"]')?.value || 'Good';
      const desc = document.getElementById('item-desc')?.value || '';"""

js = js.replace(old_form_extract, new_form_extract)

with open(marketplace_js_path, 'w', encoding='utf-8') as f:
    f.write(js)

with open(marketplace_html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Add IDs to form fields if missing
html = html.replace('placeholder="e.g. Drafter with Steel Arms / Chemistry Record"', 'id="item-title" placeholder="e.g. Drafter with Steel Arms / Chemistry Record"')
html = html.replace('<select class="w-full bg-surface-container-low px-3 py-2.5 rounded-xl font-darker font-semibold text-lg focus:outline-none border border-emerald-900/10 text-on-surface cursor-pointer">', '<select id="item-category" class="w-full bg-surface-container-low px-3 py-2.5 rounded-xl font-darker font-semibold text-lg focus:outline-none border border-emerald-900/10 text-on-surface cursor-pointer">')
html = html.replace('placeholder="₹ Amount"', 'id="item-price" placeholder="₹ Amount"')
html = html.replace('placeholder="e.g. Like New, ClassWiz series, barely used"', 'id="item-condition" placeholder="e.g. Like New, ClassWiz series, barely used"')

# Ensure All Surplus button has id="allSurplusCount"
html = html.replace('>All Surplus (48)<', ' id="allSurplusCount">All Surplus (48)<')

with open(marketplace_html_path, 'w', encoding='utf-8') as f:
    f.write(html)

print("Marketplace JS and HTML updated successfully!")
