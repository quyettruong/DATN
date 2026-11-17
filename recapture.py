import os
import time
from playwright.sync_api import sync_playwright

OUTPUT_DIR = r"C:\Users\trinh\.gemini\antigravity\brain\120a925a-357a-4801-8615-0fed004fed45\images"
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

def recapture():
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=CHROME_PATH, headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # 4. Queue Display Board (Route is /queue-display)
        print("Capturing 4. Queue Display Board (/queue-display)...")
        page.goto("http://localhost:5173/queue-display")
        page.wait_for_load_state("networkidle")
        time.sleep(2)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.4_Queue_Display_Board.png"))

        # Login as Doctor for Doctor Prescriptions
        print("Logging in as Doctor...")
        page.goto("http://localhost:5173/login")
        page.wait_for_load_state("networkidle")
        page.fill('input[type="text"]', "doctor1")
        page.fill('input[type="password"]', "123456")
        page.click('button[type="submit"]')
        page.wait_for_url("**/doctor**", timeout=10000)
        page.wait_for_load_state("networkidle")
        time.sleep(1)

        # 7. Doctor Prescriptions (Route is /doctor/prescriptions)
        print("Capturing 7. Doctor Prescriptions (/doctor/prescriptions)...")
        page.goto("http://localhost:5173/doctor/prescriptions")
        page.wait_for_load_state("networkidle")
        time.sleep(2)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.7_Doctor_Prescription_CDSS.png"))

        browser.close()
        print("Recapture completed successfully!")

if __name__ == "__main__":
    recapture()
