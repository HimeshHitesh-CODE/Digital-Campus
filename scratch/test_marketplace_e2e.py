from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome', headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    page.goto('http://127.0.0.1:8000/screens/02-student-portal/marketplace.html', wait_until='networkidle')
    
    # 1. Filter test
    print('Testing category filter...')
    notes_pill = page.locator('button.category-pill').filter(has_text='Textbooks & Notes')
    notes_pill.click()
    page.wait_for_timeout(300)
    visible_cards = page.locator('#marketplace-cards article:visible').count()
    print(f'Visible cards after filter: {visible_cards}')
    assert visible_cards > 0
    
    # Click All Surplus
    all_pill = page.locator('button.category-pill').filter(has_text='All Surplus')
    all_pill.click()
    page.wait_for_timeout(300)
    
    # 2. Search test
    print('Testing search...')
    search_input = page.locator('#market-search')
    search_input.fill('Drafter')
    page.wait_for_timeout(300)
    drafter_cards = page.locator('#marketplace-cards article:visible').count()
    print(f'Visible cards for Drafter: {drafter_cards}')
    assert drafter_cards >= 1
    
    # Clear search
    page.locator('#clear-search').click()
    page.wait_for_timeout(300)
    
    # 3. Sell Modal test
    print('Testing sell modal...')
    page.locator('#open-sell-modal').click()
    page.wait_for_timeout(400)
    
    # Modal should be visible
    modal = page.locator('#sell-modal')
    assert 'opacity-0' not in modal.get_attribute('class')
    
    # Fill form
    page.locator('#sell-form input[placeholder*="Drafter"]').fill('Scientific Calculator FX-991CW')
    page.locator('#sell-form select').select_option('Calculators')
    page.locator('#sell-form input[type="number"]').fill('850')
    page.locator('#sell-form input[placeholder*="Like New"]').fill('Mint condition with hard case and warranty card')
    
    # Submit
    page.locator('#sell-form button[type="submit"]').click()
    page.wait_for_timeout(600)
    
    # Verify new card exists
    page.wait_for_selector('text=Scientific Calculator FX-991CW', timeout=4000)
    print('New listing prepended to marketplace grid successfully!')
    
    # Take screenshot
    page.screenshot(path=r'C:\Users\HiteshHimesh\.gemini\antigravity\brain\408cfbe0-82b7-4e34-817d-a7627aace1fd\marketplace_interactive_verified.png')
    print('Marketplace screenshot saved!')
    
    browser.close()
    print('ALL MARKETPLACE E2E TESTS PASSED!')
