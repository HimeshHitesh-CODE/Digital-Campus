login_html_path = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\01-auth\login.html"
with open(login_html_path, "r", encoding="utf-8") as f:
    html = f.read()

html = html.replace('value="24259-CS-025"', '')
html = html.replace('value="student123"', '')
html = html.replace('placeholder="Enter Master Password"', 'placeholder="Enter Password"')

with open(login_html_path, "w", encoding="utf-8") as f:
    f.write(html)

print("Cleaned studentPin and password inputs!")
