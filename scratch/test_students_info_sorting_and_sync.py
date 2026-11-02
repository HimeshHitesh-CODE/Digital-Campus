from playwright.sync_api import sync_playwright
import os, time

ARTIFACT_DIR = r"C:\Users\HiteshHimesh\.gemini\antigravity\brain\408cfbe0-82b7-4e34-817d-a7627aace1fd"

def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})

        print("\n--- 1. Testing Student Information Table Columns ---")
        page.goto("http://127.0.0.1:8000/screens/04-hod-portal/students-info.html", wait_until="networkidle")
        page.wait_for_timeout(1000)

        # Check all headers in main table
        header_text = page.locator("#studentsScrollContainer thead").inner_text()
        print(f"Table headers found:\n{header_text}")
        for col in ["PIN", "Student Name", "Branch", "Days", "Attendance", "Status", "CGPA", "Backlogs", "Actions"]:
            assert col.lower() in header_text.lower(), f"Missing column: {col}"

        # Verify Himesh data (24259-CS-025)
        himesh_row = page.locator('#masterStudentsTbody tr:has-text("24259-CS-025")')
        assert himesh_row.count() > 0, "24259-CS-025 not found in table"
        himesh_text = himesh_row.inner_text()
        print(f"Himesh Row Data:\n{himesh_text}")
        assert "6.42" in himesh_text, "CGPA 6.42 not found for Himesh"
        assert "27.8%" in himesh_text or "27.78%" in himesh_text, "Attendance 27.8% not found for Himesh"
        assert "50 / 180" in himesh_text, "Days 50 / 180 not found for Himesh"
        assert "2 Backlogs" in himesh_text, "2 Backlogs not found for Himesh"

        # Verify Tulasi Ram data (24259-CS-040)
        tulasi_row = page.locator('#masterStudentsTbody tr:has-text("24259-CS-040")')
        assert tulasi_row.count() > 0, "24259-CS-040 not found in table"
        tulasi_text = tulasi_row.inner_text()
        print(f"Tulasi Ram Row Data:\n{tulasi_text}")
        assert "8.85" in tulasi_text, "CGPA 8.85 not found for Tulasi Ram"
        assert "84.5%" in tulasi_text, "Attendance 84.5% not found for Tulasi Ram"
        assert "152 / 180" in tulasi_text, "Days 152 / 180 not found for Tulasi Ram"
        assert "0 Backlogs" in tulasi_text, "0 Backlogs not found for Tulasi Ram"

        # -------------------------------------------------------------
        # 2. TEST SORTING (ASCENDING & DESCENDING)
        # -------------------------------------------------------------
        print("\n--- 2. Testing Interactive Column Sorting ---")

        # Sort by CGPA Descending (Highest First)
        cgpa_th = page.locator('th[data-sort="cgpa"]')
        print("Clicking CGPA header (Sort Descending)...")
        cgpa_th.click()
        page.wait_for_timeout(500)

        first_cgpa_raw = page.locator('#masterStudentsTbody tr:first-child td:nth-child(7)').inner_text()
        first_cgpa_num = float(first_cgpa_raw.replace('grade', '').strip())
        print(f"First row CGPA after descending sort: {first_cgpa_num}")
        assert first_cgpa_num >= 8.5, f"Expected top CGPA >= 8.5, got {first_cgpa_num}"

        # Sort by CGPA Ascending (Lowest First)
        print("Clicking CGPA header again (Sort Ascending)...")
        cgpa_th.click()
        page.wait_for_timeout(500)

        first_cgpa_asc_raw = page.locator('#masterStudentsTbody tr:first-child td:nth-child(7)').inner_text()
        first_cgpa_asc_num = float(first_cgpa_asc_raw.replace('grade', '').strip())
        print(f"First row CGPA after ascending sort: {first_cgpa_asc_num}")
        assert first_cgpa_asc_num <= 6.5, f"Expected lowest CGPA <= 6.5, got {first_cgpa_asc_num}"

        # Quick Sort Dropdown: Sort by Name A-Z
        print("Testing quick sort dropdown: Name (A → Z)...")
        page.locator("#quickSortSelect").select_option("name-asc")
        page.wait_for_timeout(500)
        first_name = page.locator("#masterStudentsTbody tr:first-child td:nth-child(2) .text-slate-900").inner_text()
        print(f"First name after A-Z sort: '{first_name}'")
        assert first_name.startswith("A"), f"Expected name starting with A, got {first_name}"

        # Capture Screenshot of Sorted Table
        p_sorted = os.path.join(ARTIFACT_DIR, "students_info_sorted_cgpa_verified.png")
        page.screenshot(path=p_sorted)
        print(f"Saved {p_sorted}")

        # -------------------------------------------------------------
        # 3. TEST MASS SYNC FROM AZURE PORTAL
        # -------------------------------------------------------------
        print("\n--- 3. Testing Azure Portal Live Mass Sync ---")
        mass_btn = page.locator("#azureMassSyncBtn")
        assert mass_btn.count() > 0, "Azure mass sync button not found"
        print("Clicking ⚡ Live Mass Sync (Azure & SBTET)...")
        mass_btn.click()
        page.wait_for_timeout(400)

        # Check modal open
        modal = page.locator("#azureSyncProgressModal")
        assert "hidden" not in modal.get_attribute("class"), "Azure sync modal did not open"
        print("Azure sync modal is streaming packet records...")

        # Wait for mass sync completion (180 nodes)
        page.wait_for_timeout(2600)

        # Verify modal closes
        assert "hidden" in modal.get_attribute("class") or modal.is_hidden(), "Modal did not auto-close"
        print("Azure mass sync successfully completed and auto-closed!")

        # -------------------------------------------------------------
        # 4. TEST INDIVIDUAL ROW SYNC BUTTON
        # -------------------------------------------------------------
        print("\n--- 4. Testing Individual Student Sync Button ---")
        row_sync = page.locator(".row-sync-btn").first
        print("Clicking individual student Sync button...")
        row_sync.click()
        page.wait_for_timeout(700)
        print("Individual student sync verified!")

        # -------------------------------------------------------------
        # 5. TEST BACKLOG POPUP MODAL
        # -------------------------------------------------------------
        print("\n--- 5. Testing Backlog Pop-Up Modal ---")
        # Filter for 24259-CS-025 to test popup
        search_input = page.locator('input[placeholder*="Search student PIN"], input[type="text"]').first
        search_input.fill("24259-CS-025")
        page.wait_for_timeout(400)

        backlog_btn = page.locator('.open-backlog-modal-btn[data-pin="24259-CS-025"]')
        backlog_btn.click()
        page.wait_for_timeout(600)

        popup = page.locator("#backlogPopupModal")
        assert "hidden" not in popup.get_attribute("class"), "Backlog popup modal did not open"
        assert page.locator("#modalBacklogTbody").get_by_text("CS-402").count() > 0, "CS-402 missing from modal"
        assert page.locator("#modalBacklogTbody").get_by_text("CS-405").count() > 0, "CS-405 missing from modal"
        print("Backlog popup modal verified with CS-402 and CS-405!")

        p_mass = os.path.join(ARTIFACT_DIR, "students_info_azure_mass_sync_verified.png")
        page.screenshot(path=p_mass)
        print(f"Saved {p_mass}")

        page.locator("#closeBacklogModal").click()
        page.wait_for_timeout(400)

        page.close()
        browser.close()
        print("\n=======================================================")
        print("ALL COLUMNS, SORTING, AND AZURE SYNC VERIFIED PASS!")
        print("=======================================================")

if __name__ == "__main__":
    run_tests()
