import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        )
        page = await ctx.new_page()
        print("Navigating to Avito...")
        url = "https://www.avito.ma/casablanca/voitures-de-occasion/dacia-logan/?o=price_asc&year_min=2022"
        await page.goto(url, wait_until="domcontentloaded", timeout=30000)
        
        print("Waiting for content to settle...")
        await asyncio.sleep(8)
        
        content = await page.content()
        with open("debug_page.html", "w", encoding="utf-8") as f:
            f.write(content)
        
        print("Page saved to debug_page.html")
        
        # Check for listing cards in content
        if "sc-1jge648-0" in content:
            print("Found sc-1jge648-0 in source!")
        else:
            print("sc-1jge648-0 NOT found in source.")
            
        # List first 1000 chars of body
        # print(content[:1000])
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
