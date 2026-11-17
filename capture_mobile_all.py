import subprocess
import time
import os
from PIL import Image

adb = r'C:\Users\trinh\AppData\Local\Android\Sdk\platform-tools\adb.exe'
img_dir = r'C:\Users\trinh\.gemini\antigravity\brain\120a925a-357a-4801-8615-0fed004fed45\images'

def tap(x, y, wait=1.5):
    subprocess.run([adb, 'shell', 'input', 'tap', str(x), str(y)])
    time.sleep(wait)

def key(code, wait=0.5):
    subprocess.run([adb, 'shell', 'input', 'keyevent', str(code)])
    time.sleep(wait)

def snap(filename):
    remote = f'/sdcard/{filename}'
    local = os.path.join(img_dir, filename)
    subprocess.run([adb, 'shell', 'screencap', '-p', remote], check=True)
    subprocess.run([adb, 'pull', remote, local], check=True)
    im = Image.open(local)
    print(f"Captured {filename}: size={im.size}, bytes={os.path.getsize(local)}")

# 1. We are on Profile, press BACK to return to Main
print("Returning to Main...")
key(4, 1.5)

# Verify we are on Main: Tab 1 is at x=108, y=2248
print("Selecting Tab 1: Home...")
tap(108, 2248, 2.0)
snap("Hinh_3.17_Mobile_Home.png")

# Tab 2: Booking
print("Selecting Tab 2: Booking...")
tap(324, 2248, 2.0)
snap("Hinh_3.18_Mobile_Booking.png")

# Tab 3: Ticket
print("Selecting Tab 3: Ticket...")
tap(540, 2248, 2.0)
snap("Hinh_3.19_Mobile_Ticket.png")

# Tab 4: Prescription
print("Selecting Tab 4: Prescription...")
tap(756, 2248, 2.0)
snap("Hinh_3.20_Mobile_Prescription.png")

# Tab 5: Invoice
print("Selecting Tab 5: Invoice...")
tap(972, 2248, 2.0)
snap("Hinh_3.21_Mobile_Invoice.png")

# Now go to Profile to Log out cleanly
print("Going to Profile to Logout...")
tap(108, 2248, 1.0) # Back to Home
tap(120, 160, 1.5)  # Avatar opens Profile
# In Profile, find Logout button (bottom)
# Let's tap logout or scroll down and tap logout
subprocess.run([adb, 'shell', 'input', 'swipe', '540', '1800', '540', '600', '300'])
time.sleep(1.0)
# Tap Logout (red button near bottom)
tap(540, 1850, 2.0)

# Dismiss keyboard if open
key(111, 0.5)
key(4, 0.5)

# Snap clean Login screen
snap("Hinh_3.16_Mobile_Login.png")

print("ALL MOBILE SCREENS CAPTURED SUCCESSFULLY!")
