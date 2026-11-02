from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome', headless=True)
    
    # 1. Test Document Approvals
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    page.goto('http://127.0.0.1:8000/screens/04-hod-portal/document-approvals.html', wait_until='networkidle')
    
    assert page.locator('.app-global-header').count() > 0, 'Missing top nav on Approvals'
    page.screenshot(path=r'C:\Users\HiteshHimesh\.gemini\antigravity\brain\408cfbe0-82b7-4e34-817d-a7627aace1fd\hod_approvals_stitch_verified.png')
    print('HOD Approvals view captured!')
    
    # Click Review & Sign button
    rev_btn = page.locator('button').filter(has_text='Review & Sign').first
    rev_btn.click()
    page.wait_for_timeout(400)
    
    modal = page.locator('#reviewSignModal')
    assert 'hidden' not in modal.get_attribute('class')
    page.screenshot(path=r'C:\Users\HiteshHimesh\.gemini\antigravity\brain\408cfbe0-82b7-4e34-817d-a7627aace1fd\hod_approvals_modal_verified.png')
    print('HOD Approvals modal captured!')
    
    # Click Approve
    page.locator('#approveBtn').click()
    page.wait_for_timeout(400)
    page.close()
    
    # 2. Test Security Keys Roster
    page2 = browser.new_page(viewport={'width': 1440, 'height': 900})
    page2.goto('http://127.0.0.1:8000/screens/04-hod-portal/security-roster.html', wait_until='networkidle')
    
    assert page2.locator('.app-global-header').count() > 0, 'Missing top nav on Roster'
    page2.screenshot(path=r'C:\Users\HiteshHimesh\.gemini\antigravity\brain\408cfbe0-82b7-4e34-817d-a7627aace1fd\hod_roster_stitch_verified.png')
    print('HOD Security Roster view captured!')
    page2.close()
    
    browser.close()
    print('Phase 4 Approvals and Roster Verification Passed!')
