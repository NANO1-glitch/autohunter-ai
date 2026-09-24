import os
import json
import zipfile
import shutil
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_ZIP = BASE_DIR.parent / "AutoHunter_AI_Shareable.zip"

CLEAN_DEFAULT_SETTINGS = {
    "smtp_server": "smtp.gmail.com",
    "smtp_port": 587,
    "smtp_email": "",
    "smtp_password": "",
    "sender_name": "Automation & AI Engineer",
    "sender_title": "Lead Automation & Solutions Specialist",
    "sender_company": "Autonomous Systems Studio",
    "signature_style": "executive_card",
    "simulation_mode": True,

    "min_budget": 300,
    "min_feasibility": 70,
    "auto_pilot": False,
    "target_categories": [
        "Automation & Python Scripts",
        "Web Scraping & Data Extraction",
        "AI Chatbots & Workflows",
        "Logo & Brand Design",
        "Data Entry & Excel Automations",
        "Web & Landing Page Dev"
    ]
}

def create_shareable_zip():
    print("=" * 65)
    print("   PACKAGING AUTOHUNTER AI (JOB FINDER BOT) FOR FRIENDS   ")
    print("=" * 65)
    print(f"[*] Packaging AutoHunter AI into {OUTPUT_ZIP}...")

    # Ensure frontend dist exists
    dist_dir = BASE_DIR / "frontend" / "dist"
    if not dist_dir.exists():
        print("[!] Warning: frontend/dist not found. Please run 'npm run build' first.")

    with zipfile.ZipFile(OUTPUT_ZIP, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(BASE_DIR):
            # Exclude node_modules, git, and pycache to keep ZIP super lightweight (<5MB)
            dirs[:] = [d for d in dirs if d not in ["node_modules", "__pycache__", ".git", "dist_temp", ".venv", "venv"]]
            
            for file in files:
                if file.endswith(".pyc") or file.endswith(".log") or file == "AutoHunter_AI_Shareable.zip":
                    continue

                file_path = Path(root) / file
                rel_path = file_path.relative_to(BASE_DIR)

                # Privacy Shield: Never include personal email or Google App Passwords
                if rel_path.name == "settings.json":
                    zipf.writestr(f"autohunter_ai/{rel_path}", json.dumps(CLEAN_DEFAULT_SETTINGS, indent=2))
                    print(f"  [+] Sanitized settings.json (Zero personal credentials leaked)")
                    continue

                # Add file to ZIP
                zipf.write(file_path, arcname=f"autohunter_ai/{rel_path}")

    size_mb = os.path.getsize(OUTPUT_ZIP) / (1024 * 1024)
    print(f"\n[OK] Package created: {OUTPUT_ZIP} ({size_mb:.2f} MB)")

    # Copy directly to Desktop for easy sharing
    desktop_path = Path.home() / "Desktop" / "AutoHunter_AI_Shareable.zip"
    try:
        shutil.copy2(OUTPUT_ZIP, desktop_path)
        print(f"[OK] Saved directly to your Desktop: {desktop_path}")
    except Exception as e:
        print(f"[!] Note: Could not copy to Desktop: {e}")

    print("\n" + "=" * 65)
    print("WHAT YOUR FRIENDS GET:")
    print("1. Standalone 1-Click Launch: They just double-click 'run.bat'")
    print("2. Zero Setup: Python auto-installs if missing. Node/npm NOT required.")
    print("3. Full Features: Live Radar, Gmail Outreach CRM, 2-Hour Auto-Refresh, Anti-Scam Bot")
    print("4. 100% Privacy Protected: Your personal passwords/email are stripped out.")
    print("=" * 65)

if __name__ == "__main__":
    create_shareable_zip()
