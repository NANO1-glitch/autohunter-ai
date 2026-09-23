import os
import zipfile
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_ZIP = BASE_DIR.parent / "AutoHunter_AI_Shareable.zip"

def create_shareable_zip():
    print(f"[*] Packaging AutoHunter AI into {OUTPUT_ZIP}...")
    with zipfile.ZipFile(OUTPUT_ZIP, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(BASE_DIR):
            # Exclude node_modules and __pycache__ to keep ZIP ultra-lightweight (<5MB)
            dirs[:] = [d for d in dirs if d not in ["node_modules", "__pycache__", ".git", "dist_temp"]]
            for file in files:
                if file.endswith(".pyc") or file.endswith(".log"):
                    continue
                file_path = Path(root) / file
                rel_path = file_path.relative_to(BASE_DIR)
                zipf.write(file_path, arcname=f"autohunter_ai/{rel_path}")
                
    size_mb = os.path.getsize(OUTPUT_ZIP) / (1024 * 1024)
    print(f"[OK] Created shareable package: {OUTPUT_ZIP} ({size_mb:.2f} MB)")
    
    # Also copy directly to Desktop if on Windows
    desktop_path = Path.home() / "Desktop" / "AutoHunter_AI_Shareable.zip"
    try:
        import shutil
        shutil.copy2(OUTPUT_ZIP, desktop_path)
        print(f"[OK] Copied directly to Desktop: {desktop_path}")
    except Exception as e:
        print(f"[!] Note: Could not copy to Desktop: {e}")

    print("[OK] Your friends do NOT need Antigravity or even Python pre-installed!")
    print("[OK] run.bat automatically downloads and installs Python if missing.")

if __name__ == "__main__":
    create_shareable_zip()
