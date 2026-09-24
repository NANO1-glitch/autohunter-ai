import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional
from backend.config import DB_PATH, SETTINGS_PATH, DEFAULT_SETTINGS
from backend.mailer.dns_verifier import verify_email_domain_mx


class Database:
    def __init__(self):
        self._init_db()

    def _init_db(self):
        if not DB_PATH.exists():
            initial_data = {
                "jobs": [],
                "outreaches": [],
                "last_sync": None
            }
            with open(DB_PATH, "w", encoding="utf-8") as f:
                json.dump(initial_data, f, indent=2)

        if not SETTINGS_PATH.exists():
            with open(SETTINGS_PATH, "w", encoding="utf-8") as f:
                json.dump(DEFAULT_SETTINGS, f, indent=2)

    def _read_data(self) -> Dict[str, Any]:
        try:
            with open(DB_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {"jobs": [], "outreaches": [], "last_sync": None}

    def _write_data(self, data: Dict[str, Any]):
        with open(DB_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    def get_settings(self) -> Dict[str, Any]:
        try:
            with open(SETTINGS_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                # Merge missing keys
                for k, v in DEFAULT_SETTINGS.items():
                    if k not in data:
                        data[k] = v
                return data
        except Exception:
            return DEFAULT_SETTINGS.copy()

    def update_settings(self, new_settings: Dict[str, Any]) -> Dict[str, Any]:
        current = self.get_settings()
        current.update(new_settings)
        with open(SETTINGS_PATH, "w", encoding="utf-8") as f:
            json.dump(current, f, indent=2)
        return current

    def get_jobs(self, 
                 category: Optional[str] = None, 
                 source: Optional[str] = None,
                 min_budget: Optional[float] = None,
                 difficulty: Optional[str] = None,
                 no_resume_only: Optional[bool] = False,
                 hide_done: Optional[bool] = False,
                 search: Optional[str] = None,
                 marketplace_category: Optional[str] = None,
                 min_acceptance: Optional[int] = None) -> List[Dict[str, Any]]:

        data = self._read_data()
        jobs = data.get("jobs", [])
        closed_statuses = {"contacted", "won", "done", "completed", "closed", "rejected", "passed"}
        outreaches = data.get("outreaches", [])
        contacted_ids = {o.get("job_id") for o in outreaches if o.get("job_id")}

        filtered = []
        for job in jobs:
            # Filter out jobs that were completed/contacted or closed by someone else
            if hide_done and (job.get("status") in closed_statuses or job.get("id") in contacted_ids):
                continue
            if category and category.lower() != "all" and job.get("category") != category:
                continue
            if source and source.lower() != "all" and job.get("source", "").lower() != source.lower():
                continue
            if min_budget is not None and job.get("budget", 0) < min_budget:
                continue
            if difficulty and difficulty.lower() != "all" and job.get("difficulty", "").lower() != difficulty.lower():
                continue
            if no_resume_only and job.get("requires_resume") is True:
                continue
            if min_acceptance is not None and job.get("acceptance_probability", 80) < min_acceptance:
                continue
            if marketplace_category:
                cat = marketplace_category.lower()
                is_bidding = bool(job.get("is_bidding_gig") or job.get("requires_resume") or job.get("marketplace_category") == "bidding_and_resumes")
                if cat in ["bidding_and_resumes", "bidding", "resumes"]:
                    if not is_bidding:
                        continue
                elif cat in ["direct_deals", "direct", "no_resume"]:
                    if is_bidding:
                        continue

            if search:
                q = search.lower()
                title = job.get("title", "").lower()
                desc = job.get("description", "").lower()
                skills = " ".join(job.get("skills", [])).lower()
                if q not in title and q not in desc and q not in skills:
                    continue
            filtered.append(job)

        # Sort by acceptance probability desc, feasibility desc, budget desc
        filtered.sort(key=lambda j: (j.get("acceptance_probability", 80), j.get("feasibility_score", 0), j.get("budget", 0)), reverse=True)
        return filtered

    def get_job_by_id(self, job_id: str) -> Optional[Dict[str, Any]]:
        jobs = self._read_data().get("jobs", [])
        for j in jobs:
            if j.get("id") == job_id:
                return j
        return None

    def delete_job(self, job_id: str) -> bool:
        """
        Permanently removes a job/gig from database (e.g. if closed by client or done).
        """
        data = self._read_data()
        jobs = data.get("jobs", [])
        orig_count = len(jobs)
        data["jobs"] = [j for j in jobs if j.get("id") != job_id]
        if len(data["jobs"]) < orig_count:
            self._write_data(data)
            return True
        return False

    def dismiss_job(self, job_id: str) -> bool:
        return self.delete_job(job_id)

    def purge_done_and_closed_jobs(self) -> int:
        """
        Purges all jobs that were done/contacted by the user or marked as closed/rejected.
        """
        data = self._read_data()
        jobs = data.get("jobs", [])
        orig_count = len(jobs)
        closed_statuses = {"contacted", "won", "done", "completed", "closed", "rejected", "passed"}
        outreaches = data.get("outreaches", [])
        contacted_ids = {o.get("job_id") for o in outreaches if o.get("job_id")}

        data["jobs"] = [
            j for j in jobs 
            if j.get("status") not in closed_statuses and j.get("id") not in contacted_ids
        ]
        removed_count = orig_count - len(data["jobs"])
        if removed_count > 0:
            self._write_data(data)
        return removed_count

    def upsert_jobs(self, new_jobs: List[Dict[str, Any]]) -> int:
        data = self._read_data()
        existing_jobs = {j["id"]: j for j in data.get("jobs", [])}
        added_count = 0

        for job in new_jobs:
            jid = job.get("id")
            if not jid:
                jid = str(uuid.uuid4())[:8]
                job["id"] = jid

            if jid not in existing_jobs:
                job["created_at"] = datetime.now().isoformat()
                job["status"] = job.get("status", "new")
                existing_jobs[jid] = job
                added_count += 1
            else:
                # Update without overriding outreach status
                current_status = existing_jobs[jid].get("status", "new")
                existing_jobs[jid].update(job)
                existing_jobs[jid]["status"] = current_status

        data["jobs"] = list(existing_jobs.values())
        data["last_sync"] = datetime.now().isoformat()
        self._write_data(data)
        return added_count

    def update_job_status(self, job_id: str, status: str):
        data = self._read_data()
        for j in data.get("jobs", []):
            if j.get("id") == job_id:
                j["status"] = status
                break
        self._write_data(data)

    def record_outreach(self, outreach_entry: Dict[str, Any]):
        data = self._read_data()
        if "outreaches" not in data:
            data["outreaches"] = []
        
        outreach_entry["timestamp"] = datetime.now().isoformat()
        if "id" not in outreach_entry:
            outreach_entry["id"] = str(uuid.uuid4())[:8]

        # Enrich with job details if job_id exists
        if "job_id" in outreach_entry and outreach_entry["job_id"]:
            job = self.get_job_by_id(outreach_entry["job_id"])
            if job:
                if "company" not in outreach_entry or not outreach_entry["company"]:
                    outreach_entry["company"] = job.get("company", "Client")
                if "job_title" not in outreach_entry or not outreach_entry["job_title"]:
                    outreach_entry["job_title"] = job.get("title", "")
                if "budget" not in outreach_entry or not outreach_entry["budget"]:
                    outreach_entry["budget"] = job.get("budget", 0)

        if "outreach_status" not in outreach_entry:
            outreach_entry["outreach_status"] = "pending"

        data["outreaches"].append(outreach_entry)
        self._write_data(data)

        # Also update job status to "contacted"
        if "job_id" in outreach_entry and outreach_entry["job_id"]:
            self.update_job_status(outreach_entry["job_id"], "contacted")

        return outreach_entry

    def is_already_pitched(self, to_email: str, job_id: Optional[str] = None) -> bool:
        """
        Enforces strict single-pitch policy: Checks if this client email or job
        has already been contacted in CRM. Prevents sending multiple cold emails
        to the same client. Only replies are permitted after initial contact.
        """
        data = self._read_data()
        outreaches = data.get("outreaches", [])
        target_email = (to_email or "").strip().lower()

        for o in outreaches:
            sent_email = (o.get("to_email") or "").strip().lower()
            sent_job = o.get("job_id")
            # Block if same recipient has already been emailed
            if target_email and sent_email == target_email:
                return True
            # Block if same job has already been emailed
            if job_id and sent_job and str(job_id) == str(sent_job):
                return True

        return False


    def get_outreaches(self) -> List[Dict[str, Any]]:
        outreaches = self._read_data().get("outreaches", [])
        for o in outreaches:
            if "outreach_status" not in o:
                # Default legacy status to sent or pending
                o["outreach_status"] = "sent"
        return outreaches

    def update_outreach_status(self, outreach_id: str, new_status: str) -> Optional[Dict[str, Any]]:
        data = self._read_data()
        outreaches = data.get("outreaches", [])
        updated = None
        for item in outreaches:
            if item.get("id") == outreach_id:
                item["outreach_status"] = new_status
                item["updated_at"] = datetime.now().isoformat()
                updated = item
                if item.get("job_id"):
                    job_status = "won" if new_status == "approved" else ("rejected" if new_status == "denied" else "contacted")
                    self.update_job_status(item["job_id"], job_status)
                break
        if updated:
            self._write_data(data)
        return updated

    def delete_outreach(self, outreach_id: str) -> bool:
        data = self._read_data()
        outreaches = data.get("outreaches", [])
        orig_len = len(outreaches)
        data["outreaches"] = [o for o in outreaches if o.get("id") != outreach_id]
        if len(data["outreaches"]) < orig_len:
            self._write_data(data)
            return True
        return False

    def remove_outreaches_by_email(self, email_address: str) -> int:
        """
        Removes all outreaches sent to a specific bounced or invalid email address.
        """
        data = self._read_data()
        outreaches = data.get("outreaches", [])
        orig_len = len(outreaches)
        target = email_address.strip().lower()
        data["outreaches"] = [o for o in outreaches if (o.get("to_email") or "").strip().lower() != target]
        removed = orig_len - len(data["outreaches"])
        if removed > 0:
            self._write_data(data)
        return removed

    def add_bounced_email(self, email_address: str) -> int:
        """
        Blacklists a bounced email address and automatically cleans it from CRM.
        """
        data = self._read_data()
        if "bounced_emails" not in data:
            data["bounced_emails"] = []
        target = email_address.strip().lower()
        if target and target not in data["bounced_emails"]:
            data["bounced_emails"].append(target)
            self._write_data(data)
        return self.remove_outreaches_by_email(target)

    def get_bounced_emails(self) -> List[str]:
        return self._read_data().get("bounced_emails", [])

    def is_placeholder_or_bounced(self, email_address: str) -> bool:
        """
        Checks if an email is fake, a placeholder (e.g. clientcompany.com), blacklisted,
        or has no valid MX records in DNS (which causes Mailer-Daemon bounces).
        """
        if not email_address or "@" not in email_address:
            return True
        target = email_address.strip().lower()
        if target in self.get_bounced_emails():
            return True
        domain = target.split("@")[-1]
        fake_domains = {
            "clientcompany.com", "example.com", "domain.com", "test.com",
            "client.com", "sample.com", "company.com", "yourdomain.com", "placeholder.com",
            "contractor.hn", "sentry.io", "w3.org", "schema.org", "google.com",
            "scaleretaillabs.io", "kryptonpay.app", "sentineldefense.tech",
            "luminarytech.io", "pulsehealth.app", "veritasclinics.com",
            "sneakerdropalerts.com", "apexventurepartners.io", "crestviewcapital.re",
            "elevatestudios.co", "hyperflowanalytics.com", "pulsefitglobal.com"
        }
        if domain in fake_domains:
            return True
        if any(domain.endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".svg", ".webp", ".gif", ".css", ".js"]):
            return True
        # Pre-flight real DNS MX check: If domain has no MX records, bounce is guaranteed
        if not verify_email_domain_mx(domain):
            return True
        return False


    def get_stats(self) -> Dict[str, Any]:
        data = self._read_data()
        jobs = data.get("jobs", [])
        outreaches = data.get("outreaches", [])

        total_value = sum(j.get("budget", 0) for j in jobs if j.get("budget", 0) > 0)
        automatable_gigs = [j for j in jobs if j.get("feasibility_score", 0) >= 75]
        high_ticket_gigs = [j for j in jobs if j.get("budget", 0) >= 1000]

        return {
            "total_jobs": len(jobs),
            "total_pipeline_value": total_value,
            "automatable_gigs_count": len(automatable_gigs),
            "high_ticket_count": len(high_ticket_gigs),
            "outreaches_sent": len(outreaches),
            "last_sync": data.get("last_sync")
        }

    def add_autopilot_log(self, message: str, level: str = "info", job_id: Optional[str] = None):
        data = self._read_data()
        if "autopilot_logs" not in data:
            data["autopilot_logs"] = []
        
        log_entry = {
            "id": str(uuid.uuid4())[:8],
            "timestamp": datetime.now().strftime("%H:%M:%S"),
            "level": level,  # 'info', 'success', 'warning', 'action'
            "message": message,
            "job_id": job_id
        }
        data["autopilot_logs"].insert(0, log_entry)  # Latest first
        data["autopilot_logs"] = data["autopilot_logs"][:150]  # Keep last 150
        self._write_data(data)
        return log_entry

    def get_autopilot_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        return self._read_data().get("autopilot_logs", [])[:limit]

    def add_escalation(self, title: str, description: str, action_required: str, job_id: Optional[str] = None):
        data = self._read_data()
        if "escalations" not in data:
            data["escalations"] = []
        
        entry = {
            "id": str(uuid.uuid4())[:8],
            "title": title,
            "description": description,
            "action_required": action_required,
            "job_id": job_id,
            "status": "pending",
            "timestamp": datetime.now().isoformat()
        }
        data["escalations"].insert(0, entry)
        self._write_data(data)
        return entry

    def get_escalations(self) -> List[Dict[str, Any]]:
        return self._read_data().get("escalations", [])

    def resolve_escalation(self, escalation_id: str):
        data = self._read_data()
        for esc in data.get("escalations", []):
            if esc["id"] == escalation_id:
                esc["status"] = "resolved"
                break
        self._write_data(data)

db = Database()

