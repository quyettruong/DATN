import os
import time
from playwright.sync_api import sync_playwright

OUTPUT_DIR = r"C:\Users\trinh\.gemini\antigravity\brain\120a925a-357a-4801-8615-0fed004fed45\images"
os.makedirs(OUTPUT_DIR, exist_ok=True)
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

def run_capture():
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=CHROME_PATH, headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # Helper to reset session
        def clear_session():
            context.clear_cookies()
            try:
                page.goto("http://localhost:5173/login")
                page.evaluate("() => { localStorage.clear(); sessionStorage.clear(); }")
            except Exception:
                pass

        # Helper to login
        def login(user, pwd):
            clear_session()
            page.goto("http://localhost:5173/login")
            page.wait_for_load_state("networkidle")
            page.fill('input[type=text]', user)
            page.fill('input[type=password]', pwd)
            page.click('button[type=submit]')
            time.sleep(2)
            page.wait_for_load_state("networkidle")

        # 1. Web Portal Home
        print("1. Capturing Hinh_3.1_Web_Portal_Home.png...")
        clear_session()
        page.goto("http://localhost:5173/")
        page.wait_for_load_state("networkidle")
        time.sleep(1.5)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.1_Web_Portal_Home.png"))

        # 2. Web Register
        print("2. Capturing Hinh_3.2_Web_Register.png...")
        page.goto("http://localhost:5173/register")
        page.wait_for_load_state("networkidle")
        time.sleep(1.5)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.2_Web_Register.png"))

        # 3. Web Patient Booking
        print("3. Logging in as patient1...")
        login("patient1", "123456")
        print("3. Capturing Hinh_3.3_Web_Patient_Booking.png...")
        page.goto("http://localhost:5173/patient/appointments")
        page.wait_for_load_state("networkidle")
        time.sleep(2)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.3_Web_Patient_Booking.png"))

        # 4. Web Patient Queue
        print("4. Capturing Hinh_3.4_Web_Patient_Queue.png...")
        page.goto("http://localhost:5173/patient/queue")
        page.wait_for_load_state("networkidle")
        time.sleep(2)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.4_Web_Patient_Queue.png"))

        # 5. Public Queue Display Board
        print("5. Capturing Hinh_3.5_Queue_Display_Board.png...")
        page.goto("http://localhost:5173/queue-display")
        page.wait_for_load_state("networkidle")
        time.sleep(2.5)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.5_Queue_Display_Board.png"))

        # 6. Staff Check-in
        print("6. Logging in as staff1...")
        login("staff1", "123456")
        print("6. Capturing Hinh_3.6_Staff_CheckIn.png...")
        page.goto("http://localhost:5173/staff/check-in")
        page.wait_for_load_state("networkidle")
        time.sleep(2)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.6_Staff_CheckIn.png"))

        # 7. Staff Triage
        print("7. Capturing Hinh_3.7_Staff_Triage.png...")
        page.goto("http://localhost:5173/staff/triage")
        page.wait_for_load_state("networkidle")
        time.sleep(2)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.7_Staff_Triage.png"))

        # 8. Doctor Queue
        print("8. Logging in as doctor1...")
        login("doctor1", "123456")
        print("8. Capturing Hinh_3.8_Doctor_Queue.png...")
        page.goto("http://localhost:5173/doctor/queue")
        page.wait_for_load_state("networkidle")
        time.sleep(2)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.8_Doctor_Queue.png"))

        # 9. Doctor Examination
        print("9. Capturing Hinh_3.9_Doctor_Examination.png...")
        page.goto("http://localhost:5173/doctor/examination")
        page.wait_for_load_state("networkidle")
        time.sleep(2)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.9_Doctor_Examination.png"))

        # 10. Doctor Prescription CDSS
        print("10. Capturing Hinh_3.10_Doctor_Prescription_CDSS.png...")
        page.goto("http://localhost:5173/doctor/prescription")
        page.wait_for_load_state("networkidle")
        time.sleep(2)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.10_Doctor_Prescription_CDSS.png"))

        # 11. Lab Orders & Results
        print("11. Logging in as lab1...")
        login("lab1", "123456")
        print("11. Capturing Hinh_3.11_Lab_Orders_Results.png...")
        page.goto("http://localhost:5173/lab/orders")
        page.wait_for_load_state("networkidle")
        time.sleep(2)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.11_Lab_Orders_Results.png"))

        # 12. Pharmacy FEFO
        print("12. Logging in as staff1 (pharmacist)...")
        login("staff1", "123456")
        print("12. Capturing Hinh_3.12_Pharmacy_Dispense.png...")
        page.goto("http://localhost:5173/staff/pharmacy")
        page.wait_for_load_state("networkidle")
        time.sleep(2)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.12_Pharmacy_Dispense.png"))

        # 13. Billing VietQR
        print("13. Capturing Hinh_3.13_Staff_Billing_VietQR.png...")
        page.goto("http://localhost:5173/staff/billing")
        page.wait_for_load_state("networkidle")
        time.sleep(2)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.13_Staff_Billing_VietQR.png"))

        # 14. Admin Analytics Dashboard
        print("14. Logging in as admin...")
        login("admin", "admin123")
        print("14. Capturing Hinh_3.14_Admin_Analytics_Dashboard.png...")
        page.goto("http://localhost:5173/admin/analytics")
        page.wait_for_load_state("networkidle")
        time.sleep(2.5)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.14_Admin_Analytics_Dashboard.png"))

        # 15. Admin User Management
        print("15. Capturing Hinh_3.15_Admin_User_Management.png...")
        page.goto("http://localhost:5173/admin/users")
        page.wait_for_load_state("networkidle")
        time.sleep(2)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "Hinh_3.15_Admin_User_Management.png"))

        browser.close()
        print("ALL 15 WEB SCREENS CAPTURED AND SAVED!")

if __name__ == "__main__":
    run_capture()
