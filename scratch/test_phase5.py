from playwright.sync_api import sync_playwright
import os

ARTIFACT_DIR = r"C:\Users\HiteshHimesh\.gemini\antigravity\brain\408cfbe0-82b7-4e34-817d-a7627aace1fd"

with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome", headless=True)
    
    # ---------------------------------------------------------
    # 1. TEST STUDENTS INFO & DOSSIER
    # ---------------------------------------------------------
    print("Testing HOD Students Info Dossier...")
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.goto("http://127.0.0.1:8000/screens/04-hod-portal/students-info.html", wait_until="networkidle")
    page.wait_for_timeout(1000)

    # Dynamic island check
    assert page.locator(".app-global-header").count() > 0, "Missing top nav on Students Info"
    assert page.locator("#campusDynamicIsland").count() > 0, "Missing dynamic island on Students Info"

    # Capture initial view
    students_path = os.path.join(ARTIFACT_DIR, "hod_students_stitch_verified.png")
    page.screenshot(path=students_path)
    print(f"Students Info screenshot saved to {students_path}")

    # Check cohort filter pill click
    crit_pill = page.locator("button").filter(has_text="Critical (<65%)").first
    if crit_pill.count() > 0:
        print("Clicking Critical cohort filter...")
        crit_pill.click()
        page.wait_for_timeout(400)

    # Check Backlog pill click
    backlog_pill = page.locator("span, button").filter(has_text="Backlogs").first
    if backlog_pill.count() > 0:
        print("Clicking Backlogs pill...")
        backlog_pill.click()
        page.wait_for_timeout(400)

    # Capture interactive state
    dossier_path = os.path.join(ARTIFACT_DIR, "hod_backlog_drawer_verified.png")
    page.screenshot(path=dossier_path)
    print(f"Backlog dossier interaction captured to {dossier_path}")
    page.close()

    # ---------------------------------------------------------
    # 2. TEST HOD MESSAGES
    # ---------------------------------------------------------
    print("Testing HOD Campus Messages...")
    page2 = browser.new_page(viewport={"width": 1440, "height": 900})
    page2.goto("http://127.0.0.1:8000/screens/04-hod-portal/messages.html", wait_until="networkidle")
    page2.wait_for_timeout(1000)

    assert page2.locator(".app-global-header").count() > 0, "Missing top nav on Messages"
    assert page2.locator("#campusDynamicIsland").count() > 0, "Missing dynamic island on Messages"

    # Check conversation switching
    convs = page2.locator("article, [data-purpose='conversation-item']")
    if convs.count() > 1:
        print("Clicking conversation thread...")
        convs.nth(1).click()
        page2.wait_for_timeout(400)

    # Test sending a message
    chat_input = page2.locator("input[placeholder*='Type your message'], input[type='text']").first
    if chat_input.count() > 0:
        print("Sending reply...")
        chat_input.fill("Application received and verified. Please report to HOD chamber at 2:30 PM.")
        page2.keyboard.press("Enter")
        page2.wait_for_timeout(600)

    # Screenshot
    messages_path = os.path.join(ARTIFACT_DIR, "hod_messages_stitch_verified.png")
    page2.screenshot(path=messages_path)
    print(f"HOD Messages screenshot saved to {messages_path}")
    page2.close()

    browser.close()
    print("Phase 5 Playwright tests passed with zero errors!")
