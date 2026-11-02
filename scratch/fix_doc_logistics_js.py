path = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\document-logistics.js"

with open(path, "r", encoding="utf-8") as f:
    code = f.read()

# Fix 1: Backticks in countBadge
old_line = "countBadge.textContent = reqs.length === 1 ? '1 Active Request' : ${reqs.length} Active Requests;"
new_line = "countBadge.textContent = reqs.length === 1 ? '1 Active Request' : `${reqs.length} Active Requests`;"
assert old_line in code, "old_line not found"
code = code.replace(old_line, new_line, 1)

# Fix 2: bindFormSubmission button and form listeners
old_bind = """function bindFormSubmission() {
  window.triggerSubmit = async function () {"""

new_bind = """function bindFormSubmission() {
  const btn = document.getElementById('submitRequestBtn');
  const form = btn ? btn.closest('form') : null;
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.triggerSubmit();
    });
  }
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      window.triggerSubmit();
    });
  }

  window.triggerSubmit = async function () {"""

assert old_bind in code, "old_bind not found"
code = code.replace(old_bind, new_bind, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(code)

print("Successfully updated document-logistics.js!")
