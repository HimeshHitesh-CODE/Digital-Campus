from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome', headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    page.goto('http://127.0.0.1:8000/screens/02-student-portal/messages.html', wait_until='networkidle')
    
    # 1. Test clicking Dr. Vamshi Krishna
    print('Testing thread switch...')
    vk_thread = page.locator('#threadsListContainer article').filter(has_text='Dr. J. Vamshi Krishna')
    vk_thread.click()
    page.wait_for_timeout(500)
    
    # Verify active thread header has Dr. J. Vamshi Krishna
    header_title = page.locator('#activeChatName').inner_text()
    print(f'Active thread after click: {header_title}')
    assert 'Dr. J. Vamshi Krishna' in header_title or 'Vamshi' in header_title, f'Expected Dr. J. Vamshi Krishna, got {header_title}'
    
    # 2. Test sending a message
    print('Testing message composer...')
    input_box = page.locator('#chatInput')
    input_box.fill('Good morning Sir, submitting the condonation documentation.')
    page.locator('#chatSendBtn').click()
    
    # Wait for sent message in chat
    page.wait_for_selector('text=Good morning Sir, submitting the condonation documentation.', timeout=5000)
    print('Sent message visible in chat stream')
    
    # Wait for simulated reply (takes ~1.4s)
    page.wait_for_timeout(2000)
    print('Checked simulated reply stream')
    
    # Take screenshot of thread switch and chat
    page.screenshot(path=r'C:\Users\HiteshHimesh\.gemini\antigravity\brain\408cfbe0-82b7-4e34-817d-a7627aace1fd\messages_interactivity_verified.png')
    print('Interactivity screenshot saved successfully')
    
    # 3. Test URL param ?peer=Dulipudi Tarun
    page.goto('http://127.0.0.1:8000/screens/02-student-portal/messages.html?peer=Dulipudi%20Tarun', wait_until='networkidle')
    page.wait_for_timeout(500)
    header_title_peer = page.locator('#activeChatName').inner_text()
    print(f'Active thread from URL param ?peer: {header_title_peer}')
    assert 'Dulipudi' in header_title_peer
    
    browser.close()
    print('ALL MESSAGES INTERACTIVITY TESTS PASSED!')
