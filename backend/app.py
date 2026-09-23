import os
from pathlib import Path
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from backend.database import db
from backend.ingest.aggregator import fetch_all_jobs
from backend.engine.analyzer import analyze_job
from backend.engine.humanizer import generate_humanized_pitch
from backend.engine.playbook import get_student_playbook
from backend.mailer.sender import send_cold_email, test_smtp_connection

app = FastAPI(title="AutoHunter AI", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event to populate initial jobs if DB is empty
@app.on_event("startup")
async def startup_event():
    existing = db.get_jobs()
    if not existing:
        print("[AutoHunter] Initializing database with global job sources...")
        initial_jobs = fetch_all_jobs()
        db.upsert_jobs(initial_jobs)
        print(f"[AutoHunter] Populated {len(initial_jobs)} actionable jobs.")

# Request models
class ManualJobInput(BaseModel):
    title: str
    company: Optional[str] = "Client"
    contact_email: Optional[str] = "contact@client.com"
    source: Optional[str] = "Manual Ingest"
    budget: Optional[float] = 0
    description: str

class OutreachRequest(BaseModel):
    job_id: str
    to_email: str
    subject: str
    body: str

class TestSMTPRequest(BaseModel):
    smtp_email: str
    smtp_password: str
    smtp_server: Optional[str] = "smtp.gmail.com"
    smtp_port: Optional[int] = 587

@app.get("/api/stats")
def get_stats():
    return db.get_stats()

@app.get("/api/jobs")
def get_jobs(
    category: Optional[str] = None,
    source: Optional[str] = None,
    min_budget: Optional[float] = None,
    difficulty: Optional[str] = None,
    no_resume_only: Optional[bool] = False,
    search: Optional[str] = None
):
    return db.get_jobs(
        category=category,
        source=source,
        min_budget=min_budget,
        difficulty=difficulty,
        no_resume_only=no_resume_only,
        search=search
    )

@app.get("/api/jobs/{job_id}")
def get_job(job_id: str):
    job = db.get_job_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@app.post("/api/jobs/sync")
def sync_jobs(background_tasks: BackgroundTasks):
    """
    Refreshes jobs from live web feeds & high-ticket stream
    """
    def do_sync():
        jobs = fetch_all_jobs()
        db.upsert_jobs(jobs)
    
    # Run sync in background or immediately
    jobs = fetch_all_jobs()
    added = db.upsert_jobs(jobs)
    return {"success": True, "added_or_updated": len(jobs), "new_items": added}

@app.post("/api/jobs/manual")
def add_manual_job(input_data: ManualJobInput):
    """
    Allows user to paste ANY job post from Discord, LinkedIn, Upwork, or Telegram.
    Immediately analyzes, estimates difficulty/profit, and saves.
    """
    raw_job = {
        "title": input_data.title,
        "company": input_data.company,
        "contact_email": input_data.contact_email,
        "source": input_data.source or "Pasted Listing",
        "budget": input_data.budget,
        "description": input_data.description,
        "skills": []
    }
    analyzed = analyze_job(raw_job)
    db.upsert_jobs([analyzed])
    return analyzed

@app.get("/api/jobs/{job_id}/playbook")
def get_job_coaching(job_id: str):
    """
    Returns step-by-step student fulfillment guide, pricing, difficulty, and closing scripts.
    """
    job = db.get_job_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return get_student_playbook(job)

@app.post("/api/outreach/generate")
def generate_pitch(payload: Dict[str, Any]):
    job_id = payload.get("job_id")
    job = db.get_job_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    settings = db.get_settings()
    sender_name = settings.get("sender_name", "Student Automation Consultant")
    pitch = generate_humanized_pitch(job, sender_name=sender_name)
    return pitch

@app.post("/api/outreach/send")
def send_pitch(outreach: OutreachRequest):
    """
    1-Click Cold Email Approval & Dispatch.
    """
    result = send_cold_email(
        to_email=outreach.to_email,
        subject=outreach.subject,
        body=outreach.body,
        job_id=outreach.job_id
    )
    return result

@app.get("/api/outreaches")
def list_outreaches():
    return db.get_outreaches()

@app.get("/api/settings")
def get_settings():
    return db.get_settings()

@app.post("/api/settings")
def save_settings(new_settings: Dict[str, Any]):
    return db.update_settings(new_settings)

@app.post("/api/settings/test-smtp")
def test_smtp(req: TestSMTPRequest):
    return test_smtp_connection(
        smtp_email=req.smtp_email,
        smtp_password=req.smtp_password,
        smtp_server=req.smtp_server,
        smtp_port=req.smtp_port
    )

from backend.engine.builder import generate_deliverable_package, DELIVERABLES_DIR
from backend.engine.autopilot import autopilot
from fastapi.responses import FileResponse

@app.post("/api/autopilot/start")
def start_autopilot():
    return autopilot.start()

@app.post("/api/autopilot/stop")
def stop_autopilot():
    return autopilot.stop()

@app.get("/api/autopilot/status")
def get_autopilot_status():
    return autopilot.get_status()

@app.post("/api/autopilot/trigger")
def trigger_autopilot_pass():
    return autopilot.run_pass()

@app.post("/api/escalations/{esc_id}/resolve")
def resolve_escalation(esc_id: str):
    db.resolve_escalation(esc_id)
    return {"success": True}

from backend.mailer.inbox_bot import analyze_client_reply, simulate_client_reply_test

class ClientReplyInput(BaseModel):
    message: str
    client_email: Optional[str] = "client@domain.com"

@app.post("/api/inbox/analyze")
def analyze_reply(payload: ClientReplyInput):
    """
    Analyzes any message sent by a client, flags scam tactics,
    and returns a safe anti-scam response protecting the student.
    """
    return analyze_client_reply(payload.message, payload.client_email)

@app.post("/api/inbox/simulate-reply")
def simulate_reply():
    return simulate_client_reply_test()

@app.post("/api/inbox/send-reply")
def send_reply(outreach: OutreachRequest):
    return send_cold_email(
        to_email=outreach.to_email,
        subject=outreach.subject,
        body=outreach.body,
        job_id=outreach.job_id
    )

@app.post("/api/jobs/{job_id}/build-deliverable")
def build_client_deliverable(job_id: str):
    """
    AI builds the actual working app/script, strips all personal information,
    packages a clean ZIP file, and generates the handover email for the client.
    """
    job = db.get_job_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    settings = db.get_settings()
    agency_name = settings.get("sender_name", "Automation & Tech Solutions")
    package = generate_deliverable_package(job, agency_name=agency_name)
    return package

@app.get("/api/deliverables/download/{zip_name}")
def download_deliverable(zip_name: str):
    file_path = DELIVERABLES_DIR / zip_name
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Deliverable file not found")
    return FileResponse(path=file_path, filename=zip_name, media_type="application/zip")

# Static frontend mount if dist exists
DIST_PATH = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if DIST_PATH.exists():
    app.mount("/", StaticFiles(directory=str(DIST_PATH), html=True), name="frontend")
