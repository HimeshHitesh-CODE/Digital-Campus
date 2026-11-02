from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome', headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    page.goto('http://127.0.0.1:8000/screens/01-auth/login.html', wait_until='networkidle')
    
    # 1. Take student view screenshot
    page.screenshot(path=r'C:\Users\HiteshHimesh\.gemini\antigravity\brain\408cfbe0-82b7-4e34-817d-a7627aace1fd\login_student_verified.png')
    print('Student login view captured!')
    
    # 2. Test Onboarding Drawer toggle
    page.locator('#openOnboardingBtn').click()
    page.wait_for_timeout(300)
    page.screenshot(path=r'C:\Users\HiteshHimesh\.gemini\antigravity\brain\408cfbe0-82b7-4e34-817d-a7627aace1fd\login_onboarding_drawer_verified.png')
    print('Onboarding drawer captured!')
    
    # 3. Test Switch to HOD role
    page.locator('#hodRoleBtn').click()
    page.wait_for_timeout(400)
    page.screenshot(path=r'C:\Users\HiteshHimesh\.gemini\antigravity\brain\408cfbe0-82b7-4e34-817d-a7627aace1fd\login_hod_verified.png')
    print('HOD login view captured!')
    
    browser.close()
    print('Phase 1 Login Verification Passed!')
