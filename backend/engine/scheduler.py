import time
import threading
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

from backend.database import db
from backend.ingest.aggregator import fetch_all_jobs

class JobRefresher:
    """
    Background Autonomous Job Refresher.
    Periodically queries live feeds (RemoteOK, WeWorkRemotely, HackerNews, Remotive, Jobicy, Discord stream)
    every 2 hours (or custom interval) to discover fresh gigs and high-ticket opportunities.
    """
    def __init__(self, interval_seconds: int = 7200):  # 2 hours = 7200s
        self.interval_seconds = interval_seconds
        self.enabled = True
        self.is_refreshing = False
        self.thread: Optional[threading.Thread] = None
        self.last_refresh: Optional[datetime] = None
        self.next_refresh: Optional[datetime] = None
        self.total_refreshes = 0
        self.last_new_jobs = 0
        self._stop_event = threading.Event()

    def start(self):
        if self.thread and self.thread.is_alive():
            return
        
        self.enabled = True
        self._stop_event.clear()
        now = datetime.now()
        self.last_refresh = now
        self.next_refresh = now + timedelta(seconds=self.interval_seconds)

        self.thread = threading.Thread(target=self._run_loop, daemon=True, name="JobSchedulerThread")
        self.thread.start()
        print(f"[Scheduler] 2-Hour Auto-Refresh activated. Next cycle at: {self.next_refresh.strftime('%H:%M:%S')}")

    def stop(self):
        self.enabled = False
        self._stop_event.set()

    def _run_loop(self):
        # Initial check: if database has never synced or empty, run initial refresh
        try:
            stats = db.get_stats()
            if stats.get("total_jobs", 0) == 0:
                self.trigger_refresh(is_scheduled=False)
        except Exception as e:
            print(f"[Scheduler] Initial check warning: {e}")

        while not self._stop_event.is_set():
            # Sleep in small increments of 1 second so stop/wake is responsive
            sleep_chunk = 1.0
            time_waited = 0.0

            while time_waited < self.interval_seconds and not self._stop_event.is_set():
                time.sleep(sleep_chunk)
                time_waited += sleep_chunk

            if self._stop_event.is_set():
                break

            if self.enabled:
                print(f"[Scheduler] 2-Hour interval elapsed. Triggering automatic job refresh...")
                self.trigger_refresh(is_scheduled=True)

    def trigger_refresh(self, is_scheduled: bool = False) -> Dict[str, Any]:
        """
        Executes a job refresh pass: queries all feeds and upserts into database.
        """
        if self.is_refreshing:
            return {"status": "already_refreshing", "seconds_remaining": self.get_seconds_remaining()}

        self.is_refreshing = True
        start_time = datetime.now()
        new_items = 0

        try:
            db.add_autopilot_log(
                "🔄 Auto-Refresh: Scanning live feeds (RemoteOK, WWR, HN, Remotive, Discord) for fresh gigs...",
                level="info"
            )
            fresh_jobs = fetch_all_jobs()
            new_items = db.upsert_jobs(fresh_jobs)
            self.total_refreshes += 1
            self.last_new_jobs = new_items
            self.last_refresh = datetime.now()
            self.next_refresh = self.last_refresh + timedelta(seconds=self.interval_seconds)

            # Auto-check inbox for client replies
            try:
                from backend.mailer.inbox_checker import check_gmail_for_replies
                check_gmail_for_replies()
            except Exception as e:
                print(f"[Scheduler] Inbox check notice: {e}")

            msg = f"🎉 2-Hour Auto-Refresh completed: Evaluated {len(fresh_jobs)} gigs ({new_items} new/updated). Checked inbox for client replies. Next refresh in 2 hours."
            db.add_autopilot_log(msg, level="success")
            print(f"[Scheduler] {msg}")

        except Exception as err:
            err_msg = f"⚠️ Auto-Refresh warning: {err}"
            print(f"[Scheduler] {err_msg}")
            db.add_autopilot_log(err_msg, level="warning")
            self.next_refresh = datetime.now() + timedelta(seconds=self.interval_seconds)

        finally:
            self.is_refreshing = False

        return {
            "success": True,
            "new_items": new_items,
            "total_refreshes": self.total_refreshes,
            "next_refresh": self.next_refresh.isoformat() if self.next_refresh else None,
            "seconds_remaining": self.get_seconds_remaining()
        }

    def get_seconds_remaining(self) -> int:
        if not self.next_refresh:
            return self.interval_seconds
        remaining = int((self.next_refresh - datetime.now()).total_seconds())
        return max(0, remaining)

    def get_status(self) -> Dict[str, Any]:
        seconds = self.get_seconds_remaining()
        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        secs = seconds % 60
        formatted = f"{hours}h {minutes:02d}m" if hours > 0 else f"{minutes}m {secs:02d}s"

        return {
            "enabled": self.enabled,
            "interval_hours": round(self.interval_seconds / 3600, 1),
            "interval_seconds": self.interval_seconds,
            "is_refreshing": self.is_refreshing,
            "seconds_remaining": seconds,
            "formatted_remaining": formatted,
            "last_refresh": self.last_refresh.isoformat() if self.last_refresh else None,
            "next_refresh": self.next_refresh.isoformat() if self.next_refresh else None,
            "total_refreshes": self.total_refreshes,
            "last_new_jobs": self.last_new_jobs
        }

# Global singleton instance
job_scheduler = JobRefresher(interval_seconds=7200) # 2 hours
