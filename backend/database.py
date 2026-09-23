import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional
from backend.config import DB_PATH, SETTINGS_PATH, DEFAULT_SETTINGS

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
                 search: Optional[str] = None) -> List[Dict[str, Any]]:
        data = self._read_data()
        jobs = data.get("jobs", [])

        filtered = []
        for job in jobs:
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
            if search:
                q = search.lower()
                title = job.get("title", "").lower()
                desc = job.get("description", "").lower()
                skills = " ".join(job.get("skills", [])).lower()
                if q not in title and q not in desc and q not in skills:
                    continue
            filtered.append(job)

        # Sort by feasibility desc, budget desc
        filtered.sort(key=lambda j: (j.get("feasibility_score", 0), j.get("budget", 0)), reverse=True)
        return filtered

    def get_job_by_id(self, job_id: str) -> Optional[Dict[str, Any]]:
        jobs = self._read_data().get("jobs", [])
        for j in jobs:
            if j.get("id") == job_id:
                return j
        return None

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

        data["outreaches"].append(outreach_entry)
        self._write_data(data)

        # Also update job status to "contacted"
        if "job_id" in outreach_entry:
            self.update_job_status(outreach_entry["job_id"], "contacted")

        return outreach_entry

    def get_outreaches(self) -> List[Dict[str, Any]]:
        return self._read_data().get("outreaches", [])

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

