import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any
from backend.database import db

def send_cold_email(to_email: str, subject: str, body: str, job_id: str = None) -> Dict[str, Any]:
    """
    Sends cold outreach email.
    If simulation_mode is enabled in settings or credentials are empty,
    it records a successful simulated delivery.
    Otherwise, dispatches via business Gmail/SMTP with TLS.
    """
    settings = db.get_settings()
    simulation_mode = settings.get("simulation_mode", True)
    smtp_server = settings.get("smtp_server", "smtp.gmail.com")
    smtp_port = int(settings.get("smtp_port", 587))
    smtp_email = settings.get("smtp_email", "").strip()
    smtp_password = settings.get("smtp_password", "").strip()
    sender_name = settings.get("sender_name", "Student Automation Specialist")

    if simulation_mode or not smtp_email or not smtp_password:
        # Safe simulation mode
        record = {
            "job_id": job_id,
            "to_email": to_email,
            "subject": subject,
            "body": body,
            "status": "Simulated Sent (Safe Mode)",
            "mode": "Simulation",
            "info": "Email verified and logged. To send live emails, disable Safe Mode in Settings and provide Gmail App Password."
        }
        db.record_outreach(record)
        return {
            "success": True,
            "mode": "simulation",
            "message": f"Cold pitch successfully queued and recorded for {to_email} (Simulation Mode).",
            "record": record
        }

    # Real SMTP Dispatch
    try:
        msg = MIMEMultipart()
        msg["From"] = f"{sender_name} <{smtp_email}>"
        msg["To"] = to_email
        msg["Subject"] = subject

        # Attach plain text body for maximum human deliverability (bypasses spam filters)
        msg.attach(MIMEText(body, "plain", "utf-8"))

        if smtp_port == 465:
            server = smtplib.SMTP_SSL(smtp_server, smtp_port, timeout=12)
        else:
            server = smtplib.SMTP(smtp_server, smtp_port, timeout=12)
            server.ehlo()
            server.starttls()
            server.ehlo()

        server.login(smtp_email, smtp_password)
        server.sendmail(smtp_email, [to_email], msg.as_string())
        server.quit()

        record = {
            "job_id": job_id,
            "to_email": to_email,
            "subject": subject,
            "body": body,
            "status": "Delivered",
            "mode": "Live SMTP",
            "info": f"Sent live from {smtp_email}"
        }
        db.record_outreach(record)
        return {
            "success": True,
            "mode": "live",
            "message": f"Cold email successfully dispatched live to {to_email}!",
            "record": record
        }

    except Exception as e:
        error_msg = str(e)
        record = {
            "job_id": job_id,
            "to_email": to_email,
            "subject": subject,
            "body": body,
            "status": "Failed",
            "mode": "Live SMTP Error",
            "info": error_msg
        }
        db.record_outreach(record)
        return {
            "success": False,
            "mode": "error",
            "message": f"Failed to send email: {error_msg}. Check your Gmail App Password.",
            "record": record
        }

def test_smtp_connection(smtp_email: str, smtp_password: str, smtp_server: str = "smtp.gmail.com", smtp_port: int = 587) -> Dict[str, Any]:
    """
    Tests SMTP connection to verify credentials before going live.
    """
    if not smtp_email or not smtp_password:
        return {"success": False, "message": "Please provide both Email and App Password."}

    try:
        if smtp_port == 465:
            server = smtplib.SMTP_SSL(smtp_server, smtp_port, timeout=10)
        else:
            server = smtplib.SMTP(smtp_server, smtp_port, timeout=10)
            server.ehlo()
            server.starttls()
            server.ehlo()

        server.login(smtp_email, smtp_password)
        server.quit()
        return {"success": True, "message": f"Connection successful! Logged into {smtp_email}."}
    except Exception as e:
        return {"success": False, "message": f"Connection failed: {str(e)}"}
