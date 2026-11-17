import os
import time
from playwright.sync_api import sync_playwright

OUTPUT_DIR = r"C:\Users\trinh\.gemini\antigravity\brain\120a925a-357a-4801-8615-0fed004fed45\images"
os.makedirs(OUTPUT_DIR, exist_ok=True)

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

def capture():
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=CHROME_PATH, headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # 1. Web Login (Clean)
        print("Capturing 1. Web Login...")
        page.goto("http://localhost:5173/login")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.1_Web_Login.png"), full_page=False)

        # Function to login as role
        def login_as(username, role_home):
            page.goto("http://localhost:5173/login")
            page.wait_for_load_state("networkidle")
            # If already logged in, clear storage
            context.clear_cookies()
            page.evaluate("() => { localStorage.clear(); sessionStorage.clear(); }")
            page.goto("http://localhost:5173/login")
            page.wait_for_load_state("networkidle")
            page.fill('input[type="text"]', username)
            page.fill('input[type="password"]', "123456")
            page.click('button[type="submit"]')
            page.wait_for_url(f"**{role_home}**", timeout=10000)
            page.wait_for_load_state("networkidle")
            time.sleep(1.5)

        # 2. Staff Pages
        print("Logging in as Staff...")
        login_as("staff1", "/staff")

        # Check-in
        print("Capturing 2. Staff Check-in...")
        page.goto("http://localhost:5173/staff/check-in")
        page.wait_for_load_state("networkidle")
        time.sleep(1.5)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.2_Staff_CheckIn.png"))

        # Triage
        print("Capturing 3. Staff Triage...")
        page.goto("http://localhost:5173/staff/triage")
        page.wait_for_load_state("networkidle")
        time.sleep(1.5)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.3_Staff_Triage.png"))

        # Billing
        print("Capturing 10. Staff Billing VietQR...")
        page.goto("http://localhost:5173/staff/billing")
        page.wait_for_load_state("networkidle")
        time.sleep(1.5)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.10_Staff_Billing_VietQR.png"))

        # Pharmacy
        print("Capturing 9. Staff Pharmacy FEFO...")
        page.goto("http://localhost:5173/staff/pharmacy")
        page.wait_for_load_state("networkidle")
        time.sleep(1.5)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.9_Pharmacy_Dispense.png"))

        # 4. Queue Display Board (Public / Staff)
        print("Capturing 4. Queue Display Board...")
        page.goto("http://localhost:5173/queue-board")
        page.wait_for_load_state("networkidle")
        time.sleep(2)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.4_Queue_Display_Board.png"))

        # 5. Doctor Pages
        print("Logging in as Doctor...")
        login_as("doctor1", "/doctor")

        print("Capturing 5. Doctor Queue...")
        page.goto("http://localhost:5173/doctor/queue")
        page.wait_for_load_state("networkidle")
        time.sleep(1.5)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.5_Doctor_Queue.png"))

        print("Capturing 6. Doctor Examination...")
        page.goto("http://localhost:5173/doctor/examination")
        page.wait_for_load_state("networkidle")
        time.sleep(1.5)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.6_Doctor_Examination.png"))

        print("Capturing 7. Doctor Prescription CDSS...")
        page.goto("http://localhost:5173/doctor/prescription")
        page.wait_for_load_state("networkidle")
        time.sleep(1.5)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.7_Doctor_Prescription_CDSS.png"))

        # 6. Lab Pages
        print("Logging in as Lab...")
        login_as("lab1", "/lab")

        print("Capturing 8. Lab Orders & Results...")
        page.goto("http://localhost:5173/lab/orders")
        page.wait_for_load_state("networkidle")
        time.sleep(1.5)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.8_Lab_Orders_Results.png"))

        # 7. Admin Pages
        print("Logging in as Admin...")
        login_as("admin", "/admin")

        print("Capturing 11. Admin Analytics Dashboard...")
        page.goto("http://localhost:5173/admin/analytics")
        page.wait_for_load_state("networkidle")
        time.sleep(2)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.11_Admin_Analytics_Dashboard.png"))

        browser.close()
        print("All Web screenshots captured successfully!")

if __name__ == "__main__":
    capture()
