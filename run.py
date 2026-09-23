import os
import sys
import socket
import webbrowser
import threading
import time
from pathlib import Path
import uvicorn

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

def get_local_ip():
    """Finds the local network IP of this PC so phones can connect over Wi-Fi"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def open_browser():
    time.sleep(1.5)
    url = "http://127.0.0.1:8000"
    print(f"\n🚀 Opening Dashboard at: {url}\n")
    try:
        webbrowser.open(url)
    except Exception:
        pass

if __name__ == "__main__":
    local_ip = get_local_ip()

    print("=" * 68)
    print("      AUTOHUNTER AI • GLOBAL FREELANCE & AUTOMATION ENGINE      ")
    print("=" * 68)
    print("✓ 100% Autonomous Auto-Pilot: Ready")
    print("✓ Privacy Shield (Zero Personal Leaks): Active")
    print("✓ Android PWA / Mobile App Support: Active")
    print("=" * 68)
    print(f"💻 On this PC:                  http://localhost:8000")
    print(f"📱 On Android Phone / Friends:  http://{local_ip}:8000")
    print("=" * 68)
    print("💡 Android Tip: Open the mobile link on your phone in Chrome,")
    print("   tap the 3 dots (menu) -> 'Install App' or 'Add to Home screen'")
    print("   to install it as an Android App with its own icon!")
    print("=" * 68)

    # Launch browser on PC
    threading.Thread(target=open_browser, daemon=True).start()

    # Start FastAPI server binding to 0.0.0.0 so phone can connect
    uvicorn.run("backend.app:app", host="0.0.0.0", port=8000, reload=False)
