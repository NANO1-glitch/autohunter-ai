import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

DB_PATH = DATA_DIR / "autohunter.json"
SETTINGS_PATH = DATA_DIR / "settings.json"

DEFAULT_SETTINGS = {
    "smtp_server": "smtp.gmail.com",
    "smtp_port": 587,
    "smtp_email": "",
    "smtp_password": "",
    "sender_name": "Automation & AI Engineer",
    "sender_title": "Lead Automation & Solutions Specialist",
    "sender_company": "Autonomous Systems Studio",
    "signature_style": "executive_card",
    "simulation_mode": True,  # When True, emails are logged safely without real SMTP

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
