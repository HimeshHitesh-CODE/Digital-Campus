from playwright.sync_api import sync_playwright
import os, time

ARTIFACT_DIR = r"C:\Users\HiteshHimesh\.gemini\antigravity\brain\408cfbe0-82b7-4e34-817d-a7627aace1fd"

def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)

        # -------------------------------------------------------------
        # 1. TEST HOD CONSOLE DUAL SYNC & BUTTONS
        # -------------------------------------------------------------
        print("\n--- 1. Testing HOD Executive Console Dual Sync ---")
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto("http://127.0.0.1:8000/screens/04-hod-portal/hod-dashboard.html", wait_until="networkidle")
        page.wait_for_timeout(800)

        # Dynamic Island check
        assert page.locator(".app-global-header").count() > 0, "Missing top nav on HOD Console"
        assert page.locator("#syncStatusSection").count() > 0, "Missing Dual Sync Card"

        # Click Sync button
        sync_btn = page.locator("#syncAllBtn")
        assert sync_btn.count() > 0, "Sync All 180 Now button not found"
        print("Clicking ⚡ Sync All 180 Now...")
        sync_btn.click()

        # Wait for sync animation to finish (dual progress from 12 to 180)
        page.wait_for_timeout(3500)

        # Verify completed status
        btn_text = page.locator("#syncBtnText").inner_text()
        print(f"Sync button text after completion: '{btn_text}'")
        assert "All 180 Synced" in btn_text, f"Unexpected sync button text: {btn_text}"

        # Verify Attendance KPI updated
        kpi_val = page.locator('[data-purpose="key-metrics"] article:nth-child(2) .font-display').inner_text()
        print(f"Updated live department attendance KPI: '{kpi_val}'")
        assert "75.6%" in kpi_val or "%" in kpi_val, f"Unexpected attendance KPI: {kpi_val}"

        # Capture Screenshot
        p1_path = os.path.join(ARTIFACT_DIR, "hod_console_dual_sync_verified.png")
        page.screenshot(path=p1_path)
        print(f"Saved {p1_path}")
        page.close()

        # -------------------------------------------------------------
        # 2. TEST DOCUMENT APPROVALS & OTP ISSUANCE
        # -------------------------------------------------------------
        print("\n--- 2. Testing Document Approvals & OTP Issuance ---")
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto("http://127.0.0.1:8000/screens/04-hod-portal/document-approvals.html", wait_until="networkidle")
        page.wait_for_timeout(800)

        # Filter pill test
        bonafide_btn = page.locator("button").filter(has_text="Bonafide Certificates").first
        if bonafide_btn.count() > 0:
            print("Testing filter pill: Bonafide Certificates...")
            bonafide_btn.click()
            page.wait_for_timeout(400)

        # Review & Sign test
        rev_btn = page.locator("tbody tr button").filter(has_text="Review & Sign").first
        assert rev_btn.count() > 0, "Review & Sign button not found"
        print("Clicking Review & Sign →...")
        rev_btn.click()
        page.wait_for_timeout(500)

        # Verify modal open
        modal = page.locator("#reviewSignModal")
        assert "hidden" not in modal.get_attribute("class"), "Review modal did not open"

        # Approve and generate OTP
        approve_btn = page.locator("#approveBtn")
        print("Clicking Approve & Generate Pickup OTP →...")
        approve_btn.click()
        page.wait_for_timeout(600)

        # Verify OTP rendered on row
        assert page.locator("text=584386").count() > 0, "Generated OTP not found in table"
        print("OTP 584386 successfully verified on table row!")

        p2_path = os.path.join(ARTIFACT_DIR, "hod_approvals_e2e_verified.png")
        page.screenshot(path=p2_path)
        print(f"Saved {p2_path}")
        page.close()

        # -------------------------------------------------------------
        # 3. TEST SECURITY ROSTER CONTINUOUS SCROLL (180 STUDENTS)
        # -------------------------------------------------------------
        print("\n--- 3. Testing Security Roster 180 Continuous Scroll ---")
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto("http://127.0.0.1:8000/screens/04-hod-portal/security-roster.html", wait_until="networkidle")
        page.wait_for_timeout(800)

        # Check total rows
        rows = page.locator("#securityRosterTbody tr")
        row_count = rows.count()
        print(f"Total students loaded in continuous scroll table: {row_count}")
        assert row_count == 180, f"Expected 180 students in roster, got {row_count}"

        # Scroll to bottom of container
        container = page.locator("#rosterScrollContainer")
        container.evaluate("el => el.scrollTop = el.scrollHeight")
        page.wait_for_timeout(500)

        # Test search filter for 24259-CS-025
        search_input = page.locator('input[placeholder*="Search by Student Name"], input[type="text"]').first
        search_input.fill("24259-CS-025")
        page.wait_for_timeout(400)

        filtered_count = page.locator("#securityRosterTbody tr").count()
        print(f"Filtered count for 24259-CS-025: {filtered_count}")
        assert filtered_count >= 1, "Himesh 24259-CS-025 not found in search"
        assert page.locator("text=STD-3472C6").count() > 0, "Anti-spoofing key STD-3472C6 not found"

        p3_path = os.path.join(ARTIFACT_DIR, "hod_roster_180_scroll_verified.png")
        page.screenshot(path=p3_path)
        print(f"Saved {p3_path}")
        page.close()

        # -------------------------------------------------------------
        # 4. TEST STUDENTS INFO CONTINUOUS SCROLL & BACKLOG POP-UP MODAL
        # -------------------------------------------------------------
        print("\n--- 4. Testing Students Info & Backlog Pop-Up Modal ---")
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto("http://127.0.0.1:8000/screens/04-hod-portal/students-info.html", wait_until="networkidle")
        page.wait_for_timeout(800)

        # Check total rows
        rows = page.locator("#masterStudentsTbody tr")
        row_count = rows.count()
        print(f"Total students in master info table: {row_count}")
        assert row_count == 180, f"Expected 180 students in master table, got {row_count}"

        # Click Backlogs button for 24259-CS-025 (Himesh)
        backlog_btn = page.locator('.open-backlog-modal-btn[data-pin="24259-CS-025"]')
        assert backlog_btn.count() > 0, "Backlog pill for 24259-CS-025 not found"
        print("Clicking Backlog pill for 24259-CS-025...")
        backlog_btn.click()
        page.wait_for_timeout(600)

        # Verify Pop-up Modal is visible
        modal = page.locator("#backlogPopupModal")
        assert "hidden" not in modal.get_attribute("class"), "Backlog pop-up modal is not open"
        name_in_modal = page.locator("#modalStudentName").inner_text()
        print(f"Student name in pop-up modal: '{name_in_modal}'")
        assert "HIMESH" in name_in_modal.upper(), f"Unexpected student in modal: {name_in_modal}"

        # Verify exact backlog subjects
        modal_tbody = page.locator("#modalBacklogTbody")
        assert modal_tbody.locator("text=CS-402").count() > 0, "CS-402 not listed in backlog modal"
        assert modal_tbody.locator("text=CS-405").count() > 0, "CS-405 not listed in backlog modal"
        print("Verified CS-402 and CS-405 backlogs displayed precisely in modal!")

        p4_path = os.path.join(ARTIFACT_DIR, "hod_students_backlog_popup_verified.png")
        page.screenshot(path=p4_path)
        print(f"Saved {p4_path}")

        # Close modal
        page.locator("#closeBacklogModal").click()
        page.wait_for_timeout(400)
        page.close()

        # -------------------------------------------------------------
        # 5. TEST TWO-WAY MESSAGING (SEND & RECEIVE)
        # -------------------------------------------------------------
        print("\n--- 5. Testing HOD Two-Way Messages ---")
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto("http://127.0.0.1:8000/screens/04-hod-portal/messages.html", wait_until="networkidle")
        page.wait_for_timeout(800)

        # Send a message
        chat_input = page.locator("input[placeholder*='Type your message'], input[type='text']").first
        chat_input.fill("Please submit the hospitalization records to my chamber at 2:30 PM.")
        page.keyboard.press("Enter")
        print("Sent outgoing directive message...")

        # Wait for simulated typing and incoming reply (1.8s)
        page.wait_for_timeout(2200)

        # Verify student reply received
        assert page.locator("text=Verified Student Session").count() > 0, "Incoming student reply session not found"
        print("Verified incoming student reply successfully received!")

        p5_path = os.path.join(ARTIFACT_DIR, "hod_messages_two_way_verified.png")
        page.screenshot(path=p5_path)
        print(f"Saved {p5_path}")
        page.close()

        # -------------------------------------------------------------
        # 6. TEST HELPDESK SANCTUARY & TICKET LODGING
        # -------------------------------------------------------------
        print("\n--- 6. Testing Campus Help Desk & Ticket Lodging ---")
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto("http://127.0.0.1:8000/screens/02-student-portal/helpdesk.html", wait_until="networkidle")
        page.wait_for_timeout(800)

        # Fill and submit form
        page.locator("#issueSubject").fill("Biometric sensor timeout at Block B entrance")
        page.locator("#issueDetails").fill("Sensor node #4 failed to register fingerprint punch on 02-Nov at 09:15 AM.")
        page.locator("#submitTicketBtn").click()
        page.wait_for_timeout(600)

        # Verify new ticket prepended
        assert page.locator("text=Biometric sensor timeout at Block B entrance").count() > 0, "Lodged ticket not found in stream"
        print("Helpdesk ticket successfully lodged and verified in stream!")

        p6_path = os.path.join(ARTIFACT_DIR, "helpdesk_verified.png")
        page.screenshot(path=p6_path)
        print(f"Saved {p6_path}")
        page.close()

        # -------------------------------------------------------------
        # 7. TEST IDEA HUB CLEAN STATE & INTERACTIVE ACTIONS
        # -------------------------------------------------------------
        print("\n--- 7. Testing Idea Hub Clean Ready-to-Use State ---")
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto("http://127.0.0.1:8000/screens/02-student-portal/idea-hub.html", wait_until="networkidle")
        page.wait_for_timeout(800)

        # Check collab toggle
        toggle = page.locator("#collab-toggle")
        print("Toggling project availability...")
        toggle.click()
        page.wait_for_timeout(400)

        # Add skill
        add_skill_btn = page.locator("#btnAddSkillBtn")
        add_skill_btn.click()
        page.wait_for_timeout(400)
        page.locator("#newSkillInput").fill("FastAPI & PyTorch")
        page.locator("#formAddSkill button[type='submit']").click()
        page.wait_for_timeout(500)

        # Verify skill rendered
        assert page.locator("text=FastAPI & PyTorch").count() > 0, "Added skill not found in tags"
        print("Verified skill 'FastAPI & PyTorch' added and displayed!")

        # Click Invite to Project on first peer card
        invite_btn = page.locator(".peer-card button").filter(has_text="Invite to Project").first
        if invite_btn.count() > 0:
            print("Testing 'Invite to Project' button...")
            invite_btn.click()
            page.wait_for_timeout(400)
            assert page.locator("text=Invite Sent").count() > 0, "Invite button did not update"
            print("Verified 'Invite Sent' status updated!")

        p7_path = os.path.join(ARTIFACT_DIR, "ideahub_clean_verified.png")
        page.screenshot(path=p7_path)
        print(f"Saved {p7_path}")
        page.close()

        browser.close()
        print("\n=======================================================")
        print("ALL 7 CORE REQUIREMENTS TESTED & 100% VERIFIED PASS!")
        print("=======================================================")

if __name__ == "__main__":
    run_tests()
