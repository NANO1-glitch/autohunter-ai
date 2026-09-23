# AutoHunter AI 🚀
### Autonomous Global Freelance Job Hunter, Anti-Scam Shield & Deal Closer

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC.svg)](https://tailwindcss.com)

**AutoHunter AI** is an open-source autonomous agent and job intelligence platform built for students and freelancers. It continuously aggregates high-ticket opportunities and quick micro-tasks across global platforms (RemoteOK, Remotive, Jobicy, HackerNews, Discord communities, WeWorkRemotely), filters out bidding wars and resume requirements, generates anti-AI humanized outreach pitches, and provides a built-in **Anti-Scam Shield & Reply Bot** to ensure freelancers never get cheated.

---

## 🌟 Key Features

### 1. 🌍 Worldwide High-Paying Gigs
* Aggregates opportunities from international markets paying in **USD ($500–$2,500+)**, **GBP (£)**, and **EUR (€)**.
* Automatic country and currency detection (`🇺🇸 USA`, `🇬🇧 UK`, `🇪🇺 Europe`, `🌍 Global Remote`).

### 2. ⚡ "No Resume / No Bidding Wars" Filter
* Filter specifically for direct client deals where **no CV, resume, or bidding tokens** are needed.
* Direct email/message approach: review the gig, send a tailored pitch, get approved, deliver the code, and collect payment.

### 3. 🎯 Instant AI Micro-Gigs
* **Video Captions & Subtitles**: Transcribe TikToks, Reels, and YouTube shorts into synchronized `.srt`/`.vtt` subtitle files (5–10 min turnaround).
* **Language Translation & Localization**: Translate websites, apps, and documents.
* **Data Entry & Excel Automations**: Clean, format, and deduplicate spreadsheets with Pandas.
* **Logo & Brand Design**: Generate high-res vector logos and banners.

### 4. 🛡️ Anti-Scam Shield & Automated Reply Bot
* Never get scammed or cheated by clients asking for free work or taking code without paying:
  * **Risk Detector**: Detects red flags like Telegram/WhatsApp diversion, unpaid source code demands, or fake "test project" requests.
  * **Milestone Enforcer**: Automatically drafts polite, authoritative replies enforcing the **50% milestone deposit** or escrow.
  * **Proof Protection**: Guides you to provide 60-second watermarked video demos or sample rows instead of raw code before payment.

### 5. 🤖 100% Autonomous Autopilot Mode
* Background agent crawls feeds 24/7, analyzes profitability, pre-builds the deliverable code, drafts anti-AI pitches, and escalates to you only when human action is needed.

### 6. 📦 1-Click Deliverable Packager & Privacy Sanitizer
* Generates working code with a ready-to-use `run.bat` for your client while scrubbing all personal paths and local identifiers.

### 7. 📱 Mobile PWA Support
* Access the dashboard from your smartphone over Wi-Fi. Add it to your home screen to use it as an Android or iOS web app.

---

## 🚀 Quick Start (Zero-Setup)

### For Windows:
Simply double-click **`run.bat`**!

> **No Python installed?**
> `run.bat` automatically detects if Python is missing, downloads the official 64-bit installer from `python.org`, installs it silently in the background (no admin password required), installs dependencies, and launches the app!

### Manual / macOS / Linux:

```bash
# 1. Clone repository
git clone https://github.com/NANO1-glitch/autohunter-ai.git
cd autohunter-ai

# 2. Install dependencies
pip install -r requirements.txt

# 3. Launch
python run.py
```

Open your browser at **`http://localhost:8000`**.

---

## 📁 Architecture & Tech Stack

```text
autohunter_ai/
├── backend/
│   ├── app.py             # FastAPI REST API & static UI mount
│   ├── config.py          # App configuration & paths
│   ├── database.py        # Persistent JSON database (jobs, outreaches, logs)
│   ├── engine/
│   │   ├── analyzer.py    # Multi-category classification & ROI scoring
│   │   ├── autopilot.py   # Autonomous background agent
│   │   ├── builder.py     # Safe deliverable packager & path sanitizer
│   │   ├── humanizer.py   # Anti-AI cold pitch copywriter (98% human score)
│   │   └── playbook.py    # Student sales coach & anti-scam rules
│   ├── ingest/
│   │   └── aggregator.py  # Multi-source live ingestion engine
│   └── mailer/
│       ├── inbox_bot.py   # Anti-scam reply analyzer & shield
│       └── sender.py      # Gmail SMTP & simulation sender
├── frontend/              # Modern React + Vite + Tailwind glassmorphism UI
├── run.bat                # 1-click Windows launcher with auto-Python installer
├── run.py                 # Multi-platform launcher
└── requirements.txt       # Core Python dependencies
```

---

## 🔒 Privacy & Security

* **100% Local & Self-Hosted**: All jobs, settings, and generated code reside strictly on your local computer.
* **Path Sanitization**: Client deliverable packages automatically replace all local paths with portable relative paths.
* **Safe Simulation Mode**: Emails are safely simulated by default until you explicitly connect your SMTP credentials.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/NANO1-glitch/autohunter-ai/issues).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
