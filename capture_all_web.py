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

        # 1. Web Portal Home
        print("Capturing 1. Web Portal Home...")
        page.goto("http://localhost:5173/")
        page.wait_for_load_state("networkidle")
        time.sleep(1.5)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.1_Web_Portal_Home.png"))

        # 2. Web Register
        print("Capturing 2. Web Register...")
        page.goto("http://localhost:5173/register")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.2_Web_Register.png"))

        # Helper login
        def login_as(username, password="password", role_home=""):
            page.goto("http://localhost:5173/login")
            page.wait_for_load_state("networkidle")
            context.clear_cookies()
            page.evaluate("() => { localStorage.clear(); sessionStorage.clear(); }")
            page.goto("http://localhost:5173/login")
            page.wait_for_load_state("networkidle")
            page.fill('input[type="text"]', username)
            page.fill('input[type="password"]', password)
            page.click('button[type="submit"]')
            if role_home:
                try:
                    page.wait_for_url(f"**{role_home}**", timeout=8000)
                except Exception as e:
                    print(f"Warning wait URL: {e}")
            page.wait_for_load_state("networkidle")
            time.sleep(1.5)

        # 3. Patient Appointment
        print("Logging in as Patient...")
        login_as("patient1", "123456", "/")
        print("Capturing 3. Web Patient Booking...")
        page.goto("http://localhost:5173/patient/appointment")
        page.wait_for_load_state("networkidle")
        time.sleep(1.5)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.3_Web_Patient_Booking.png"))

        # 4. Patient Queue Status
        print("Capturing 4. Web Patient Queue Status...")
        page.goto("http://localhost:5173/patient/queue-status")
        page.wait_for_load_state("networkidle")
        time.sleep(1.5)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.4_Web_Patient_Queue.png"))

        # 5. Public Queue Board
        print("Capturing 5. Public Queue Board...")
        page.goto("http://localhost:5173/queue-board")
        page.wait_for_load_state("networkidle")
        time.sleep(2)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.5_Queue_Display_Board.png"))

        # 6. Staff Check-in
        print("Logging in as Staff...")
        login_as("staff1", "123456", "/staff")
        print("Capturing 6. Staff Check-in...")
        page.goto("http://localhost:5173/staff/check-in")
        page.wait_for_load_state("networkidle")
        time.sleep(1.5)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.6_Staff_CheckIn.png"))

        # 7. Staff Triage
        print("Capturing 7. Staff Triage...")
        page.goto("http://localhost:5173/staff/triage")
        page.wait_for_load_state("networkidle")
        time.sleep(1.5)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.7_Staff_Triage.png"))

        # 8. Doctor Queue
        print("Logging in as Doctor...")
        login_as("doctor1", "123456", "/doctor")
        print("Capturing 8. Doctor Queue...")
        page.goto("http://localhost:5173/doctor/queue")
        page.wait_for_load_state("networkidle")
        time.sleep(1.5)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.8_Doctor_Queue.png"))

        # 9. Doctor Examination
        print("Capturing 9. Doctor Examination...")
        page.goto("http://localhost:5173/doctor/examination")
        page.wait_for_load_state("networkidle")
        time.sleep(1.5)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.9_Doctor_Examination.png"))

        # 10. Doctor Prescription CDSS
        print("Capturing 10. Doctor Prescription CDSS...")
        page.goto("http://localhost:5173/doctor/prescription")
        page.wait_for_load_state("networkidle")
        time.sleep(1.5)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.10_Doctor_Prescription_CDSS.png"))

        # 11. Lab Orders & Results
        print("Logging in as Lab...")
        login_as("lab1", "123456", "/lab")
        print("Capturing 11. Lab Orders & Results...")
        page.goto("http://localhost:5173/lab/orders")
        page.wait_for_load_state("networkidle")
        time.sleep(1.5)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.11_Lab_Orders_Results.png"))

        # 12. Pharmacy FEFO
        print("Logging in as Pharmacist / Staff...")
        login_as("staff1", "123456", "/staff")
        print("Capturing 12. Pharmacy FEFO...")
        page.goto("http://localhost:5173/staff/pharmacy")
        page.wait_for_load_state("networkidle")
        time.sleep(1.5)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.12_Pharmacy_Dispense.png"))

        # 13. Billing VietQR
        print("Capturing 13. Staff Billing VietQR...")
        page.goto("http://localhost:5173/staff/billing")
        page.wait_for_load_state("networkidle")
        time.sleep(1.5)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.13_Staff_Billing_VietQR.png"))

        # 14. Admin Analytics Dashboard
        print("Logging in as Admin...")
        login_as("admin", "admin123", "/admin")
        print("Capturing 14. Admin Analytics Dashboard...")
        page.goto("http://localhost:5173/admin/analytics")
        page.wait_for_load_state("networkidle")
        time.sleep(2)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.14_Admin_Analytics_Dashboard.png"))

        # 15. Admin User Management
        print("Capturing 15. Admin User Management...")
        page.goto("http://localhost:5173/admin/users")
        page.wait_for_load_state("networkidle")
        time.sleep(1.5)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.15_Admin_User_Management.png"))

        browser.close()
        print("ALL 15 WEB SCREENS CAPTURED SUCCESSFULLY!")

if __name__ == "__main__":
    capture()
