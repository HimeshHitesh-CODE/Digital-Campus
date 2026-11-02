from playwright.sync_api import sync_playwright

PAGES = [
    ('dashboard', 'http://127.0.0.1:8000/screens/02-student-portal/dashboard.html'),
    ('attendance', 'http://127.0.0.1:8000/screens/02-student-portal/attendance.html'),
    ('results', 'http://127.0.0.1:8000/screens/02-student-portal/results.html'),
    ('requests', 'http://127.0.0.1:8000/screens/02-student-portal/document-logistics.html'),
    ('marketplace', 'http://127.0.0.1:8000/screens/02-student-portal/marketplace.html'),
    ('ideahub', 'http://127.0.0.1:8000/screens/02-student-portal/idea-hub.html'),
    ('messages', 'http://127.0.0.1:8000/screens/02-student-portal/messages.html')
]

VIEWPORTS = [
    ('desktop_1440', 1440, 900),
    ('tablet_768', 768, 1024),
    ('mobile_390', 390, 844)
]

output_dir = r'C:\Users\HiteshHimesh\.gemini\antigravity\brain\408cfbe0-82b7-4e34-817d-a7627aace1fd'

with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome', headless=True)
    
    for page_name, url in PAGES:
        for vp_name, w, h in VIEWPORTS:
            page = browser.new_page(viewport={'width': w, 'height': h})
            try:
                page.goto(url, wait_until='networkidle')
                # Check top nav exists
                header = page.locator('.app-global-header')
                assert header.count() > 0, f'Missing global header on {page_name}'
                
                # Check dock exists
                dock = page.locator('#campusDynamicIsland')
                assert dock.count() > 0, f'Missing dock on {page_name}'
                
                shot_path = f'{output_dir}\\resp_{page_name}_{vp_name}.png'
                page.screenshot(path=shot_path, full_page=False)
                print(f'Verified & captured {page_name} @ {vp_name}')
            except Exception as e:
                print(f'Error verifying {page_name} @ {vp_name}: {e}')
            finally:
                page.close()
                
    browser.close()
    print('ALL RESPONSIVE AUDIT CHECKS COMPLETED!')
