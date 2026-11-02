from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome', headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    page.goto('http://127.0.0.1:8000/screens/02-student-portal/dashboard.html', wait_until='networkidle')
    
    # Check theme button
    theme_btn = page.locator('#headerThemeBtn')
    print(f'Found #headerThemeBtn count: {theme_btn.count()}')
    if theme_btn.count() > 0:
        theme_btn.click()
        page.wait_for_timeout(600)
        theme_attr = page.evaluate('() => document.documentElement.getAttribute("data-theme")')
        print(f'Current data-theme: {theme_attr}')
        page.screenshot(path=r'C:\Users\HiteshHimesh\.gemini\antigravity\brain\408cfbe0-82b7-4e34-817d-a7627aace1fd\dashboard_dark_toggled.png')
        print('Dark theme screenshot saved!')
    else:
        # Check dropdown toggle
        profile_btn = page.locator('#headerProfileBtn')
        if profile_btn.count() > 0:
            profile_btn.click()
            page.wait_for_timeout(300)
            dropdown_toggle = page.locator('#dropdownThemeToggle')
            dropdown_toggle.click()
            page.wait_for_timeout(600)
            theme_attr = page.evaluate('() => document.documentElement.getAttribute("data-theme")')
            print(f'Current data-theme via dropdown: {theme_attr}')
            page.screenshot(path=r'C:\Users\HiteshHimesh\.gemini\antigravity\brain\408cfbe0-82b7-4e34-817d-a7627aace1fd\dashboard_dark_toggled.png')
            
    browser.close()
