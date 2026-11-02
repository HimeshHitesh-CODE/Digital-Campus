import asyncio
from playwright.async_api import async_playwright

screens = [
    ('attendance', 'campus_connect_attendance/code.html'),
    ('marks_results', 'campus_connect_marks_results/code.html'),
    ('marketplace', 'campus_connect_marketplace/code.html'),
    ('idea_hub', 'campus_connect_idea_hub/code.html'),
    ('certificate_requests', 'campus_connect_certificate_requests/code.html'),
    ('messages', 'campus_connect_messages/code.html'),
]

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(channel='chrome', headless=True)
        page = await browser.new_page(viewport={'width': 1280, 'height': 850})
        base = 'file:///C:/Users/HiteshHimesh/.gemini/antigravity/scratch/Digital-Campus/stitch_campus_connect_design_system/'
        for name, rel in screens:
            url = base + rel
            await page.goto(url)
            await page.wait_for_timeout(800)
            out = f'C:/Users/HiteshHimesh/.gemini/antigravity/brain/408cfbe0-82b7-4e34-817d-a7627aace1fd/stitch_{name}_raw.png'
            await page.screenshot(path=out, full_page=True)
            print(f'Captured {out}')
        await browser.close()

asyncio.run(run())
