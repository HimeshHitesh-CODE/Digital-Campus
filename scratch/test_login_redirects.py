import asyncio
from playwright.async_api import async_playwright

async def run_verification():
    async with async_playwright() as p:
        browser = await p.chromium.launch(channel="chrome", headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        print("\n--- TEST 1: Visiting root '/' must redirect to login.html ---")
        await page.goto("http://127.0.0.1:8000/")
        await page.wait_for_timeout(1000)
        current_url = page.url
        print(f"Landed on: {current_url}")
        assert "login.html" in current_url, f"Expected login.html, got {current_url}"

        print("\n--- TEST 2: Visiting '/index.html' must redirect to login.html ---")
        await page.goto("http://127.0.0.1:8000/index.html")
        await page.wait_for_timeout(1000)
        current_url = page.url
        print(f"Landed on: {current_url}")
        assert "login.html" in current_url, f"Expected login.html, got {current_url}"

        print("\n--- TEST 3: Unauthenticated access to dashboard.html must redirect to login.html ---")
        await context.clear_cookies()
        await page.evaluate("() => localStorage.clear()")
        await page.goto("http://127.0.0.1:8000/screens/02-student-portal/dashboard.html")
        await page.wait_for_timeout(1000)
        current_url = page.url
        print(f"Landed on: {current_url}")
        assert "login.html" in current_url, f"Expected redirect to login.html, got {current_url}"

        print("\n--- TEST 4: Unauthenticated access to HOD portal must redirect to login.html ---")
        await context.clear_cookies()
        await page.evaluate("() => localStorage.clear()")
        await page.goto("http://127.0.0.1:8000/screens/04-hod-portal/hod-dashboard.html")
        await page.wait_for_timeout(1000)
        current_url = page.url
        print(f"Landed on: {current_url}")
        assert "login.html" in current_url, f"Expected redirect to login.html, got {current_url}"

        print("\n--- TEST 5: Login Page inputs must be blank (no auto-fill of Himesh) ---")
        await page.goto("http://127.0.0.1:8000/screens/01-auth/login.html")
        await page.wait_for_load_state("domcontentloaded")
        await page.wait_for_timeout(800)

        pin_val = await page.locator("#studentPin").input_value()
        pass_val = await page.locator("#password").input_value()
        print(f"Student PIN value: '{pin_val}', Password value: '{pass_val}'")
        assert pin_val == "" and pass_val == "", "Login page inputs must be completely blank"

        print("\nALL LOGIN REDIRECT & AUTH GUARD TESTS PASSED SUCCESSFULLY!")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run_verification())
