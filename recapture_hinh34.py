import os
import time
from playwright.sync_api import sync_playwright

OUTPUT_DIR = r"C:\Users\trinh\.gemini\antigravity\brain\120a925a-357a-4801-8615-0fed004fed45\images"
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

def recapture_display():
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=CHROME_PATH, headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        print("Navigating to Queue Display Board with active queue...")
        page.goto("http://localhost:5173/queue-display?roomId=1")
        page.wait_for_load_state("networkidle")
        time.sleep(3) # Wait for state & API data to render
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.4_Queue_Display_Board.png"))
        browser.close()
        print("Recapture of Hinh_3.4 completed successfully!")

if __name__ == "__main__":
    recapture_display()
