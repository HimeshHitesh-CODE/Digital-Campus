import asyncio
from playwright.async_api import async_playwright

async def inspect():
    async with async_playwright() as p:
        b = await p.chromium.launch(channel="chrome", headless=True)
        page = await b.new_page()
        page.on("pageerror", lambda err: print("PAGE ERROR DETAILS:", repr(err), err))
        await page.goto("http://127.0.0.1:8000/screens/02-student-portal/document-logistics.html")
        await page.wait_for_timeout(1000)
        await b.close()

if __name__ == "__main__":
    asyncio.run(inspect())
