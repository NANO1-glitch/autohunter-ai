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
from backend.engine.scheduler import job_scheduler
from backend.engine.autopilot import autopilot

app = FastAPI(title="AutoHunter AI", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event to populate initial jobs and start 2-Hour Auto-Refresh
@app.on_event("startup")
async def startup_event():
    existing = db.get_jobs()
    if not existing:
        print("[AutoHunter] Initializing database with global job sources...")
        initial_jobs = fetch_all_jobs()
        db.upsert_jobs(initial_jobs)
        print(f"[AutoHunter] Populated {len(initial_jobs)} actionable jobs.")
    
    # Start 2-Hour Background Refresher
    job_scheduler.start()

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
    html_body: Optional[str] = None


class OutreachStatusUpdate(BaseModel):
    status: str  # 'sent', 'pending', 'approved', 'denied'

class RecordOutreachInput(BaseModel):
    job_id: Optional[str] = None
    to_email: str
    subject: str
    body: str
    company: Optional[str] = None
    job_title: Optional[str] = None
    budget: Optional[float] = 0
    mode: Optional[str] = "Gmail (1-Click)"
    outreach_status: Optional[str] = "pending"

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
    hide_done: Optional[bool] = False,
    search: Optional[str] = None,
    marketplace_category: Optional[str] = None,
    min_acceptance: Optional[int] = None
):
    return db.get_jobs(
        category=category,
        source=source,
        min_budget=min_budget,
        difficulty=difficulty,
        no_resume_only=no_resume_only,
        hide_done=hide_done,
        search=search,
        marketplace_category=marketplace_category,
        min_acceptance=min_acceptance
    )



@app.get("/api/jobs/{job_id}")
def get_job(job_id: str):
    job = db.get_job_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@app.delete("/api/jobs/{job_id}")
def delete_single_job(job_id: str):
    """
    Permanently deletes a specific job that was completed or closed by someone else.
    """
    success = db.delete_job(job_id)
    if not success:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"success": True, "message": f"Job {job_id} removed"}

@app.post("/api/jobs/purge-closed")
def purge_closed_jobs():
    """
    Bulk removes all jobs that were pitched/done or closed/rejected.
    """
    removed = db.purge_done_and_closed_jobs()
    return {
        "success": True,
        "removed_count": removed,
        "remaining_jobs": len(db.get_jobs())
    }

@app.patch("/api/jobs/{job_id}/close")
def mark_job_closed(job_id: str):
    """
    Marks a job as closed/filled by client.
    """
    db.update_job_status(job_id, "closed")
    return {"success": True, "status": "closed"}

@app.post("/api/jobs/sync")
def sync_jobs():
    """
    Refreshes jobs from live web feeds & resets 2-hour scheduler timer
    """
    result = job_scheduler.trigger_refresh(is_scheduled=False)
    all_jobs = db.get_jobs()
    return {
        "success": True,
        "added_or_updated": len(all_jobs),
        "new_items": result.get("new_items", 0),
        "scheduler": job_scheduler.get_status()
    }

@app.get("/api/scheduler/status")
def get_scheduler_status():
    """
    Returns the live status of the 2-Hour background job refresher
    """
    return job_scheduler.get_status()

@app.post("/api/scheduler/refresh-now")
def trigger_refresh_now():
    """
    Triggers immediate refresh and resets 2-hour countdown
    """
    res = job_scheduler.trigger_refresh(is_scheduled=False)
    return {"message": "Job refresh completed", "result": res, "status": job_scheduler.get_status()}

# Autopilot Engine Routes
@app.get("/api/autopilot/status")
def get_autopilot_status():
    return autopilot.get_status()

@app.post("/api/autopilot/start")
def start_autopilot():
    return autopilot.start()

@app.post("/api/autopilot/stop")
def stop_autopilot():
    return autopilot.stop()

@app.post("/api/autopilot/trigger")
def trigger_autopilot():
    return autopilot.run_pass()

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
    sender_name = settings.get("sender_name", "Sharesth")
    sender_title = settings.get("sender_title", "Lead Automation & Solutions Engineer")
    sender_company = settings.get("sender_company", "Autonomous Systems & Workflow Automation")
    sender_email = settings.get("smtp_email", "")
    pitch = generate_humanized_pitch(
        job, 
        sender_name=sender_name,
        sender_title=sender_title,
        sender_company=sender_company,
        sender_email=sender_email
    )
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
        job_id=outreach.job_id,
        html_body=outreach.html_body
    )
    return result


@app.get("/api/outreaches")
def list_outreaches():
    return db.get_outreaches()

@app.post("/api/outreach/record")
def record_manual_outreach(payload: RecordOutreachInput):
    record = {
        "job_id": payload.job_id,
        "to_email": payload.to_email,
        "subject": payload.subject,
        "body": payload.body,
        "company": payload.company,
        "job_title": payload.job_title,
        "budget": payload.budget or 0,
        "status": f"Sent via {payload.mode}",
        "mode": payload.mode,
        "outreach_status": payload.outreach_status or "pending",
        "info": f"Dispatched via {payload.mode}"
    }
    saved = db.record_outreach(record)
    return {"success": True, "record": saved}

@app.patch("/api/outreach/{outreach_id}/status")
def update_outreach_status_endpoint(outreach_id: str, payload: OutreachStatusUpdate):
    if payload.status not in ["sent", "pending", "approved", "denied"]:
        raise HTTPException(status_code=400, detail="Invalid status. Must be sent, pending, approved, or denied.")
    updated = db.update_outreach_status(outreach_id, payload.status)
    if not updated:
        raise HTTPException(status_code=404, detail="Outreach record not found")
    return {"success": True, "record": updated}

@app.delete("/api/outreach/{outreach_id}")
def delete_outreach_endpoint(outreach_id: str):
    success = db.delete_outreach(outreach_id)
    if not success:
        raise HTTPException(status_code=404, detail="Outreach record not found")
    return {"success": True}

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

from backend.mailer.inbox_bot import (
    analyze_client_reply, 
    simulate_client_reply_test,
    generate_trial_proof_response,
    generate_full_access_response
)

class ClientReplyInput(BaseModel):
    message: str
    client_email: Optional[str] = "client@domain.com"
    job_title: Optional[str] = "Automation Solution"

class TrialRequestInput(BaseModel):
    client_email: str
    job_title: Optional[str] = "Automation Solution"
    company: Optional[str] = "Client"
    budget: Optional[float] = 0.0

class FullAccessRequestInput(BaseModel):
    client_email: str
    job_title: Optional[str] = "Automation Solution"
    company: Optional[str] = "Client"
    amount_paid: Optional[float] = 0.0

class MarkPaidReleaseInput(BaseModel):
    outreach_id: Optional[str] = None
    job_id: Optional[str] = None
    client_email: str
    job_title: Optional[str] = "Automation Solution"
    company: Optional[str] = "Client"
    amount_paid: Optional[float] = 0.0
    send_via_smtp: Optional[bool] = False

@app.post("/api/inbox/analyze")
def analyze_reply(payload: ClientReplyInput):
    """
    Analyzes any message sent by a client, flags scam tactics,
    and returns a safe anti-scam response protecting the student.
    """
    return analyze_client_reply(payload.message, payload.client_email, payload.job_title or "Automation Solution")

@app.post("/api/inbox/simulate-reply")
def simulate_reply():
    return simulate_client_reply_test()

@app.post("/api/inbox/generate-trial")
def generate_trial(payload: TrialRequestInput):
    """
    Stage 1: Generates Trial Proof email with verified sample output,
    withholding full source code until milestone invoice is settled.
    """
    return generate_trial_proof_response(
        client_email=payload.client_email,
        job_title=payload.job_title or "Automation Solution",
        company=payload.company or "Client",
        budget=payload.budget or 0.0
    )

@app.post("/api/inbox/generate-full-access")
def generate_full_access(payload: FullAccessRequestInput):
    """
    Stage 2: Generates Full Production Access handover email after
    payment has been confirmed.
    """
    return generate_full_access_response(
        client_email=payload.client_email,
        job_title=payload.job_title or "Automation Solution",
        company=payload.company or "Client",
        amount_paid=payload.amount_paid or 0.0
    )

@app.post("/api/inbox/mark-paid-and-release")
def mark_paid_and_release(payload: MarkPaidReleaseInput):
    """
    Marks the deal as Won / Approved in DB, updates job status,
    and generates/dispatches the Full Production Access package.
    """
    if payload.outreach_id:
        db.update_outreach_status(payload.outreach_id, "approved")
    if payload.job_id:
        db.dismiss_job(payload.job_id)
    
    handover = generate_full_access_response(
        client_email=payload.client_email,
        job_title=payload.job_title or "Automation Solution",
        company=payload.company or "Client",
        amount_paid=payload.amount_paid or 0.0
    )
    
    send_result = None
    if payload.send_via_smtp:
        send_result = send_cold_email(
            to_email=payload.client_email,
            subject=handover["reply_subject"],
            body=handover["reply_body"],
            job_id=payload.job_id or payload.outreach_id or "paid-handover"
        )
    
    return {
        "success": True,
        "handover": handover,
        "send_result": send_result,
        "message": f"Payment of ${payload.amount_paid or 0:.0f} recorded! Full production access handover ready."
    }

@app.post("/api/inbox/send-reply")
def send_reply(outreach: OutreachRequest):
    return send_cold_email(
        to_email=outreach.to_email,
        subject=outreach.subject,
        body=outreach.body,
        job_id=outreach.job_id
    )

from backend.mailer.inbox_checker import check_gmail_for_replies, simulate_reply_detection

@app.post("/api/inbox/check-replies")
def check_replies_endpoint():
    """
    Scans Gmail inbox via IMAP for replies from clients we've pitched.
    Automatically classifies whether the reply is Approved or Denied and updates CRM.
    """
    return check_gmail_for_replies()

class SimulateDetectionInput(BaseModel):
    status: str = "approved" # 'approved' or 'denied'
    outreach_id: Optional[str] = None

@app.post("/api/inbox/simulate-detection")
def simulate_detection_endpoint(payload: SimulateDetectionInput):
    """
    Simulates an incoming client reply (Approved or Denied) for instant testing.
    """
    return simulate_reply_detection(payload.status, payload.outreach_id)

from backend.engine.verifier import run_automated_trial_flow, release_full_app_to_client

class AutoTrialInput(BaseModel):
    job_id: str
    client_email: str

@app.post("/api/inbox/auto-trial")
def auto_trial_endpoint(payload: AutoTrialInput):
    """
    Runs background test verification, generates screenshot + animated GIF video recording,
    embeds PayPal link, and emails trial proof to client withholding raw code.
    """
    return run_automated_trial_flow(payload.job_id, payload.client_email)

class AutoReleaseAppInput(BaseModel):
    job_id: str
    client_email: str
    amount_paid: Optional[float] = 0.0

@app.post("/api/inbox/auto-release-app")
def auto_release_app_endpoint(payload: AutoReleaseAppInput):
    """
    Releases full production app package (clean ZIP) upon payment received.
    Updates CRM to Won and records revenue.
    """
    return release_full_app_to_client(payload.job_id, payload.client_email, payload.amount_paid or 0.0)

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
