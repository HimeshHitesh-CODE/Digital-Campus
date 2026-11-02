from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome', headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    page.goto('http://127.0.0.1:8000/screens/02-student-portal/profile.html', wait_until='networkidle')
    
    # Check top nav
    assert page.locator('.app-global-header').count() > 0, 'Missing top nav on profile'
    
    # 1. Take profile screenshot
    page.screenshot(path=r'C:\Users\HiteshHimesh\.gemini\antigravity\brain\408cfbe0-82b7-4e34-817d-a7627aace1fd\profile_stitch_verified.png')
    print('Profile view captured!')
    
    # 2. Test Edit Contact modal
    edit_btn = page.locator('button').filter(has_text='Edit Contact Info').first
    edit_btn.click()
    page.wait_for_timeout(400)
    
    modal = page.locator('#editContactModal')
    assert 'hidden' not in modal.get_attribute('class')
    page.screenshot(path=r'C:\Users\HiteshHimesh\.gemini\antigravity\brain\408cfbe0-82b7-4e34-817d-a7627aace1fd\profile_modal_verified.png')
    print('Profile modal captured!')
    
    browser.close()
    print('Phase 2 Profile Verification Passed!')
