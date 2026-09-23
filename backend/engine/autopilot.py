import time
import threading
from typing import Dict, Any, List
from datetime import datetime

from backend.database import db
from backend.ingest.aggregator import fetch_all_jobs
from backend.engine.humanizer import generate_humanized_pitch
from backend.engine.builder import generate_deliverable_package
from backend.mailer.sender import send_cold_email

class AutoPilotEngine:
    def __init__(self):
        self.is_running = False
        self.thread = None
        self.interval_seconds = 300  # Scan every 5 minutes
        self.last_run_time = None
        self.total_automated_actions = 0

    def start(self):
        if self.is_running:
            return {"status": "already_running"}
        
        self.is_running = True
        db.add_autopilot_log("🚀 100% Autonomous Auto-Pilot Activated! Radar is now continuously scanning.", level="action")
        self.thread = threading.Thread(target=self._loop, daemon=True)
        self.thread.start()
        return {"status": "started", "interval_seconds": self.interval_seconds}

    def stop(self):
        self.is_running = False
        db.add_autopilot_log("⏸️ Auto-Pilot Paused. Switching to Co-Pilot Observer mode.", level="warning")
        return {"status": "stopped"}

    def get_status(self) -> Dict[str, Any]:
        settings = db.get_settings()
        return {
            "is_running": self.is_running,
            "interval_seconds": self.interval_seconds,
            "last_run_time": self.last_run_time,
            "total_actions": self.total_automated_actions,
            "simulation_mode": settings.get("simulation_mode", True),
            "min_budget": settings.get("min_budget", 300),
            "min_feasibility": settings.get("min_feasibility", 70),
            "logs": db.get_autopilot_logs(limit=25),
            "escalations": [e for e in db.get_escalations() if e.get("status") == "pending"]
        }

    def run_pass(self) -> Dict[str, Any]:
        """
        Executes one full autonomous discovery, building, and dispatch cycle.
        """
        self.last_run_time = datetime.now().isoformat()
        db.add_autopilot_log("🌐 Autonomous cycle started: Scanning global APIs & freelance feeds...", level="info")

        try:
            # 1. Fetch & analyze fresh global jobs
            fresh_jobs = fetch_all_jobs()
            added = db.upsert_jobs(fresh_jobs)
            db.add_autopilot_log(f"📥 Feeds synchronized: {len(fresh_jobs)} active deals evaluated ({added} new).", level="info")

            # 2. Filter opportunities for auto-pilot
            settings = db.get_settings()
            min_budget = settings.get("min_budget", 400)
            min_feasibility = settings.get("min_feasibility", 75)
            sender_name = settings.get("sender_name", "Student Automation Consultant")

            all_jobs = db.get_jobs()
            eligible = [
                j for j in all_jobs 
                if j.get("status") == "new" 
                and j.get("budget", 0) >= min_budget 
                and j.get("feasibility_score", 0) >= min_feasibility
            ]

            db.add_autopilot_log(f"🎯 Filtered {len(eligible)} high-priority deals meeting auto-dispatch criteria.", level="info")

            dispatched_count = 0
            for job in eligible[:5]:  # Process up to 5 per cycle to maintain healthy pacing
                job_id = job["id"]
                title = job["title"]
                email = job.get("contact_email")

                if not email or "@" not in email:
                    # AI unable to extract email -> Escalate to human
                    db.add_escalation(
                        title=f"Missing Client Email for: {title[:45]}",
                        description=f"The job from {job.get('source')} pays ${job.get('budget')} but requires manual contact lookup on {job.get('url')}.",
                        action_required="Click the link to check the contact method on Discord/LinkedIn.",
                        job_id=job_id
                    )
                    db.add_autopilot_log(f"⚠️ Escalation created: Missing direct email for '{title[:35]}...'", level="warning", job_id=job_id)
                    continue

                # A. Pre-build sanitized deliverable package
                try:
                    pkg = generate_deliverable_package(job, agency_name=sender_name)
                    db.add_autopilot_log(f"📦 Pre-built sanitized solution: {pkg['zip_name']} (100% personal paths stripped)", level="success", job_id=job_id)
                except Exception as b_err:
                    db.add_autopilot_log(f"Package warning: {b_err}", level="warning", job_id=job_id)

                # B. Generate Humanized Cold Pitch
                pitch = generate_humanized_pitch(job, sender_name=sender_name)

                # C. Autonomous Dispatch
                result = send_cold_email(
                    to_email=email,
                    subject=pitch["subject"],
                    body=pitch["body"],
                    job_id=job_id
                )

                if result.get("success"):
                    mode_str = "Simulated Safe" if result.get("mode") == "simulation" else "Live Gmail"
                    db.add_autopilot_log(f"⚡ Autonomously dispatched cold pitch to {email} ({mode_str}) for ${job.get('budget')} gig!", level="action", job_id=job_id)
                    dispatched_count += 1
                    self.total_automated_actions += 1
                else:
                    db.add_escalation(
                        title=f"SMTP Dispatch Error to {email}",
                        description=result.get("message", "Unknown mailer error"),
                        action_required="Check Gmail App Password in Settings.",
                        job_id=job_id
                    )
                    db.add_autopilot_log(f"❌ Mailer issue: {result.get('message')}", level="warning", job_id=job_id)

                time.sleep(2)  # Polite pacing

            db.add_autopilot_log(f"✅ Autonomous pass complete. {dispatched_count} deals processed and pitches dispatched.", level="success")
            return {"success": True, "dispatched": dispatched_count}

        except Exception as e:
            db.add_autopilot_log(f"Auto-pilot error: {str(e)}", level="warning")
            return {"success": False, "error": str(e)}

    def _loop(self):
        while self.is_running:
            self.run_pass()
            # Sleep in small increments to allow responsive stopping
            for _ in range(self.interval_seconds):
                if not self.is_running:
                    break
                time.sleep(1)

autopilot = AutoPilotEngine()
