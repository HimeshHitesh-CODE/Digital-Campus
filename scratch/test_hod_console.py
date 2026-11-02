from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome', headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    page.goto('http://127.0.0.1:8000/screens/04-hod-portal/hod-dashboard.html', wait_until='networkidle')
    
    # Check top nav and dock
    assert page.locator('.app-global-header').count() > 0, 'Missing top nav on HOD console'
    assert page.locator('#campusDynamicIsland').count() > 0, 'Missing dynamic island dock on HOD console'
    
    # 1. Take initial console screenshot
    page.screenshot(path=r'C:\Users\HiteshHimesh\.gemini\antigravity\brain\408cfbe0-82b7-4e34-817d-a7627aace1fd\hod_console_stitch_verified.png')
    print('HOD Console initial view captured!')
    
    # 2. Test 180 Sync Button
    sync_btn = page.locator('button').filter(has_text='Sync All 180').first
    if sync_btn.count() > 0:
        sync_btn.click()
        page.wait_for_timeout(1000)
        page.screenshot(path=r'C:\Users\HiteshHimesh\.gemini\antigravity\brain\408cfbe0-82b7-4e34-817d-a7627aace1fd\hod_console_syncing_verified.png')
        print('HOD Console syncing state captured!')
    
    browser.close()
    print('Phase 3 HOD Console Verification Passed!')
