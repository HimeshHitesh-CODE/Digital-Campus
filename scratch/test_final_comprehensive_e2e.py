import asyncio, os, sqlite3
from playwright.async_api import async_playwright

# Reset 24259-CS-025 to 0 in DB
db_path = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\backend\campus.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()
cur.execute("UPDATE roster_keys SET is_registered = 0 WHERE pin = '24259-CS-025';")
conn.commit()
conn.close()

SCREENSHOT_DIR = r"C:\Users\HiteshHimesh\.gemini\antigravity\brain\408cfbe0-82b7-4e34-817d-a7627aace1fd"

async def run_tests():
    async with async_playwright() as p:
        browser = await p.chromium.launch(channel="chrome", headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        print("\n=== TEST 1: Login Page UI & Mandatory Onboarding ===")
        await page.goto("http://127.0.0.1:8000/screens/01-auth/login.html")
        await page.wait_for_load_state("domcontentloaded")
        await page.wait_for_timeout(1000)

        # Check header is gone
        headers = await page.locator("header").count()
        print(f"Top header count on login page: {headers} (Expected 0)")
        assert headers == 0, "Top header should not be present on login page"

        # Check prefilled values are empty
        pin_val = await page.locator("#studentPin").input_value()
        pass_val = await page.locator("#password").input_value()
        print(f"Student PIN value: '{pin_val}', Password value: '{pass_val}' (Expected empty)")
        assert pin_val == "" and pass_val == "", "Login inputs should be completely blank"

        # Try logging in with unactivated PIN
        await page.fill("#studentPin", "24259-CS-025")
        await page.fill("#password", "student123")
        await page.click("#studentLoginBtn")
        await page.wait_for_timeout(1000)

        # Onboarding drawer should open
        drawer_visible = await page.locator("#onboardingDrawer").is_visible()
        print(f"Onboarding drawer auto-opened on unactivated login attempt: {drawer_visible}")
        assert drawer_visible, "Onboarding drawer should open when unactivated student logs in"

        # Complete mandatory first-time onboarding
        await page.fill("#onboardPin", "24259-CS-025")
        await page.fill("#onboardKey", "STD-XAz10F")
        await page.fill("#onboardPass", "student123")
        await page.fill("#onboardPassConfirm", "student123")
        await page.click("button:has-text('Verify Key & Set Password')")
        await page.wait_for_timeout(1200)

        await page.screenshot(path=os.path.join(SCREENSHOT_DIR, "phase1_login_onboarding_verified.png"))
        print("Captured phase1_login_onboarding_verified.png")

        # Now submit login with activated account
        await page.click("#studentLoginBtn")
        await page.wait_for_url("**/dashboard.html", timeout=6000)
        print("Successfully navigated to Student Dashboard after activation!")

        print("\n=== TEST 2: Student Dashboard Hero & Helpdesk ===")
        await page.wait_for_load_state("domcontentloaded")
        await page.wait_for_timeout(1000)

        # Verify no right photo card in hero
        hero_imgs = await page.locator("section:has(#heroGreeting) img").count()
        print(f"Hero photo images: {hero_imgs} (Expected 0)")
        assert hero_imgs == 0, "Hero right photo card should be removed"

        # Verify Schedule Appointment link
        appt_href = await page.locator("#btnScheduleAppt").get_attribute("href")
        print(f"Schedule Appointment URL: {appt_href}")
        assert "sbtet.telangana.gov.in" in appt_href, "Schedule Appointment must link to SBTET ContactUs"

        await page.screenshot(path=os.path.join(SCREENSHOT_DIR, "phase3_student_dashboard_verified.png"))
        print("Captured phase3_student_dashboard_verified.png")

        print("\n=== TEST 3: Student Attendance Portal ===")
        await page.goto("http://127.0.0.1:8000/screens/02-student-portal/attendance.html")
        await page.wait_for_load_state("domcontentloaded")
        await page.wait_for_timeout(1000)

        # Check Medical Appeal button is removed
        med_appeal = await page.locator("text=File Medical Appeal").count()
        subj_table = await page.locator("text=Subject-Wise Biometric Audit").count()
        disc_desk = await page.locator("text=Discrepancy Rectification Desk").count()
        print(f"Medical Appeal count: {med_appeal}, Subject Audit count: {subj_table}, Discrepancy Desk count: {disc_desk}")
        assert med_appeal == 0 and subj_table == 0 and disc_desk == 0, "Removed sections should not exist in attendance"

        await page.screenshot(path=os.path.join(SCREENSHOT_DIR, "phase4_student_attendance_verified.png"))
        print("Captured phase4_student_attendance_verified.png")

        print("\n=== TEST 4: Student Marks & Results Portal ===")
        await page.goto("http://127.0.0.1:8000/screens/02-student-portal/results.html")
        await page.wait_for_load_state("domcontentloaded")
        await page.wait_for_timeout(1000)

        # Verify printable memo card exists
        printable_memo = await page.locator("#printableMemoCard").count()
        print(f"Printable Memo Card count: {printable_memo}")
        assert printable_memo == 1, "Printable memo card container must exist"

        # Verify re-evaluation link
        reval_link = await page.locator("a[href*='DiplomaStudentServices']").count()
        print(f"Re-evaluation official SBTET link count: {reval_link}")
        assert reval_link >= 1, "Re-evaluation link must point to SBTET DiplomaStudentServices"

        await page.screenshot(path=os.path.join(SCREENSHOT_DIR, "phase4_student_results_verified.png"))
        print("Captured phase4_student_results_verified.png")

        print("\n=== TEST 5: Student Document Requests Portal ===")
        await page.goto("http://127.0.0.1:8000/screens/02-student-portal/document-logistics.html")
        await page.wait_for_load_state("domcontentloaded")
        await page.wait_for_timeout(1000)

        # Check required fields exist
        has_address = await page.locator("#reqAddress").count()
        has_parent = await page.locator("#reqParentContact").count()
        has_urgent = await page.locator("#urgentToggle").count()
        print(f"Address field: {has_address}, Parent Contact: {has_parent}, Urgent toggle: {has_urgent}")
        assert has_address == 1 and has_parent == 1 and has_urgent == 0, "Address and Parent fields required; Urgent toggle must be removed"

        # Check OTP box is gone
        has_otp = await page.locator("text=5 8 4 3 8 6").count()
        print(f"Old OTP 584386 count: {has_otp} (Expected 0)")
        assert has_otp == 0, "Old OTP box must be removed"

        # Submit a new request
        await page.fill("#purposeText", "Applying for State Level Technical Symposium clearance")
        await page.fill("#reqAddress", "H.No 12-4, Samskruti Campus Road, Ghatkesar, PIN 501301")
        await page.fill("#reqParentContact", "+91 9848012345")
        await page.click("#submitRequestBtn")
        await page.wait_for_timeout(1500)

        # Check withdrawal button exists
        withdraw_btn = await page.locator("button:has-text('Remove / Withdraw Request')").count()
        print(f"Withdraw request buttons count: {withdraw_btn}")
        assert withdraw_btn >= 1, "Withdraw request button must be present on request cards"

        await page.screenshot(path=os.path.join(SCREENSHOT_DIR, "phase5_student_requests_verified.png"))
        print("Captured phase5_student_requests_verified.png")

        print("\n=== TEST 6: Student Idea Hub & Marketplace ===")
        await page.goto("http://127.0.0.1:8000/screens/02-student-portal/idea-hub.html")
        await page.wait_for_load_state("domcontentloaded")
        await page.wait_for_timeout(1000)

        # Verify unwanted buttons/tiles removed
        sync_gh = await page.locator("text=Sync GitHub / Portfolio").count()
        squads_tile = await page.locator("text=34 Squads").count()
        hackathon_banner = await page.locator("text=Flagship Collegiate Challenge").count()
        print(f"Sync GitHub count: {sync_gh}, 34 Squads count: {squads_tile}, Hackathon Banner: {hackathon_banner}")
        assert sync_gh == 0 and squads_tile == 0 and hackathon_banner == 0, "Removed Idea Hub sections must not exist"

        await page.screenshot(path=os.path.join(SCREENSHOT_DIR, "phase6_student_ideahub_verified.png"))
        print("Captured phase6_student_ideahub_verified.png")

        await page.goto("http://127.0.0.1:8000/screens/02-student-portal/marketplace.html")
        await page.wait_for_load_state("domcontentloaded")
        await page.wait_for_timeout(1000)

        # Verify Campus Verifier On badge is removed
        verifier_badge = await page.locator("text=Campus Verifier On").count()
        print(f"Campus Verifier On count: {verifier_badge} (Expected 0)")
        assert verifier_badge == 0, "Campus Verifier On badge must be removed"

        await page.screenshot(path=os.path.join(SCREENSHOT_DIR, "phase6_student_marketplace_verified.png"))
        print("Captured phase6_student_marketplace_verified.png")

        print("\n=== TEST 7: CS HOD Console (Dr. J. Vamshi Krishna) ===")
        await page.goto("http://127.0.0.1:8000/screens/01-auth/login.html?role=hod")
        await page.wait_for_load_state("domcontentloaded")
        await page.wait_for_timeout(500)

        await page.fill("#hodIdInput", "VAMSHI-CS-HOD")
        await page.fill("#passwordInput", "Password123")
        await page.click("#hodLoginBtn")
        await page.wait_for_url("**/hod-dashboard.html", timeout=6000)
        await page.wait_for_load_state("domcontentloaded")
        await page.wait_for_timeout(1000)

        # Check HOD Identity
        profile_chip = await page.locator("#globalNamePreview").text_content()
        avatar_initials = await page.locator("#globalAvatarInitials").text_content()
        print(f"CS HOD Profile Chip: '{profile_chip}', Initials: '{avatar_initials}'")
        assert profile_chip == "VAMSHI" and avatar_initials == "VK", "CS HOD must be VAMSHI / VK"

        # Check initial sync counters are 0
        sync_summary = await page.locator("#syncSummaryText").text_content()
        print(f"Sync summary initial state: '{sync_summary}'")
        assert "0 / 180" in sync_summary, "CS HOD initial sync counter must be 0 / 180"

        await page.screenshot(path=os.path.join(SCREENSHOT_DIR, "phase7_cs_hod_console_verified.png"))
        print("Captured phase7_cs_hod_console_verified.png")

        # Check CS Students Table continuous scroll
        await page.goto("http://127.0.0.1:8000/screens/04-hod-portal/students-info.html")
        await page.wait_for_load_state("domcontentloaded")
        await page.wait_for_timeout(1500)

        # Table rows count
        cs_rows = await page.locator("#masterStudentsTbody tr").count()
        print(f"CS Students rendered in continuous scroll: {cs_rows} (Expected 180)")
        assert cs_rows >= 180, "CS HOD must render all 180 CS students"

        await page.screenshot(path=os.path.join(SCREENSHOT_DIR, "phase7_cs_students_info_verified.png"))
        print("Captured phase7_cs_students_info_verified.png")

        print("\n=== TEST 8: AIML HOD Console (Prof. Padma) ===")
        await page.goto("http://127.0.0.1:8000/screens/01-auth/login.html?role=hod")
        await page.wait_for_load_state("domcontentloaded")
        await page.wait_for_timeout(500)

        await page.fill("#hodIdInput", "PADMA-AIML-HOD")
        await page.fill("#passwordInput", "Password123")
        await page.click("#hodLoginBtn")
        await page.wait_for_url("**/hod-dashboard.html", timeout=6000)
        await page.wait_for_load_state("domcontentloaded")
        await page.wait_for_timeout(1000)

        # Check AIML HOD Identity
        aiml_chip = await page.locator("#globalNamePreview").text_content()
        aiml_initials = await page.locator("#globalAvatarInitials").text_content()
        print(f"AIML HOD Profile Chip: '{aiml_chip}', Initials: '{aiml_initials}'")
        assert aiml_chip == "PADMA" and aiml_initials == "PA", "AIML HOD must be PADMA / PA (Prof. Padma)"

        # Check initial sync counters are 0 / 120
        aiml_sync_summary = await page.locator("#syncSummaryText").text_content()
        print(f"AIML Sync summary initial state: '{aiml_sync_summary}'")
        assert "0 / 120" in aiml_sync_summary, "AIML HOD initial sync counter must be 0 / 120"

        await page.screenshot(path=os.path.join(SCREENSHOT_DIR, "phase7_aiml_hod_console_verified.png"))
        print("Captured phase7_aiml_hod_console_verified.png")

        # Check AIML Students Table
        await page.goto("http://127.0.0.1:8000/screens/04-hod-portal/students-info.html")
        await page.wait_for_load_state("domcontentloaded")
        await page.wait_for_timeout(1500)

        aiml_rows = await page.locator("#masterStudentsTbody tr").count()
        print(f"AIML Students rendered in continuous scroll: {aiml_rows} (Expected 120)")
        assert aiml_rows == 120, "AIML HOD must render strictly 120 AIML students"

        # Check Anti-Spoofing Security Roster
        await page.goto("http://127.0.0.1:8000/screens/04-hod-portal/security-roster.html")
        await page.wait_for_load_state("domcontentloaded")
        await page.wait_for_timeout(1500)

        roster_rows = await page.locator("#securityRosterTbody tr, #rosterTableBody tr").count()
        print(f"AIML Security Roster rows rendered: {roster_rows} (Expected 120)")
        assert roster_rows == 120, "AIML HOD must render strictly 120 AIML security keys"

        await page.screenshot(path=os.path.join(SCREENSHOT_DIR, "phase7_aiml_security_roster_verified.png"))
        print("Captured phase7_aiml_security_roster_verified.png")

        print("\nALL 8 PHASES END-TO-END TESTS PASSED WITH 100% SUCCESS!")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run_tests())
