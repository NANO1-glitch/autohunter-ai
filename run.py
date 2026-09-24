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
    print(f"\n[*] Opening Dashboard at: {url}\n")
    try:
        webbrowser.open(url)
    except Exception:
        pass

def ensure_port_free(port: int = 8000):
    """Checks if port 8000 is occupied. If so, frees it cleanly or reuses existing instance."""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('127.0.0.1', port)) == 0:
                # Port is already in use
                import urllib.request
                try:
                    req = urllib.request.Request(f"http://127.0.0.1:{port}/api/stats")
                    with urllib.request.urlopen(req, timeout=1.5) as resp:
                        if resp.status == 200:
                            print(f"[OK] AutoHunter AI is already active and running on port {port}!")
                            print(f"🚀 Opening Dashboard in your browser: http://localhost:{port}")
                            webbrowser.open(f"http://localhost:{port}")
                            sys.exit(0)
                except Exception:
                    pass

                # If stale or uncooperative, terminate old process
                import subprocess
                out = subprocess.check_output(f'netstat -ano | findstr :{port}', shell=True, text=True)
                for line in out.strip().split('\n'):
                    parts = line.split()
                    if len(parts) >= 5 and "LISTENING" in parts[3].upper():
                        old_pid = parts[-1]
                        if old_pid != str(os.getpid()):
                            subprocess.run(f'taskkill /F /PID {old_pid}', shell=True, capture_output=True)
                            time.sleep(0.5)
    except Exception:
        pass

if __name__ == "__main__":
    ensure_port_free(8000)
    local_ip = get_local_ip()

    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

    print("=" * 68)
    print("      AUTOHUNTER AI - GLOBAL FREELANCE & AUTOMATION ENGINE      ")
    print("=" * 68)
    print("[+] 100% Autonomous Auto-Pilot: Ready")
    print("[+] Privacy Shield (Zero Personal Leaks): Active")
    print("[+] Android PWA / Mobile App Support: Active")
    print("=" * 68)
    print(f"[*] On this PC:                  http://localhost:8000")
    print(f"[*] On Android Phone / Friends:  http://{local_ip}:8000")
    print("=" * 68)
    print("[*] Android Tip: Open the mobile link on your phone in Chrome,")
    print("    tap the 3 dots (menu) -> 'Install App' or 'Add to Home screen'")
    print("    to install it as an Android App with its own icon!")
    print("=" * 68)

    # Launch browser on PC
    threading.Thread(target=open_browser, daemon=True).start()

    # Start FastAPI server binding to 0.0.0.0 so phone can connect
    uvicorn.run("backend.app:app", host="0.0.0.0", port=8000, reload=False)
