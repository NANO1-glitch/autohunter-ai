import smtplib
import mimetypes
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from email.utils import formatdate, make_msgid
from pathlib import Path
from typing import Dict, Any, List, Optional
from backend.database import db
from backend.mailer.dns_verifier import verify_email_domain_mx
from backend.engine.humanizer import convert_plain_to_professional_html


def send_cold_email(
    to_email: str, 
    subject: str, 
    body: str, 
    job_id: str = None, 
    attachments: Optional[List[str]] = None,
    html_body: Optional[str] = None
) -> Dict[str, Any]:

    """
    Sends cold outreach email.
    If simulation_mode is enabled in settings or credentials are empty,
    it records a successful simulated delivery.
    Otherwise, dispatches via business Gmail/SMTP with TLS.
    Supports file attachments (PNG screenshots, GIF demos, ZIP deliverables).
    """
    settings = db.get_settings()
    simulation_mode = settings.get("simulation_mode", True)
    smtp_server = settings.get("smtp_server", "smtp.gmail.com")
    smtp_port = int(settings.get("smtp_port", 587))
    smtp_email = settings.get("smtp_email", "").strip()
    smtp_password = settings.get("smtp_password", "").replace(" ", "").strip()
    sender_name = settings.get("sender_name", "Student Automation Specialist")

    if simulation_mode or not smtp_email or not smtp_password:
        # Safe simulation mode
        record = {
            "job_id": job_id,
            "to_email": to_email,
            "subject": subject,
            "body": body,
            "status": "Simulated Sent (Safe Mode)",
            "outreach_status": "sent",
            "mode": "Simulation",
            "info": f"Email verified and logged. Attachments: {[Path(a).name for a in (attachments or [])]}"
        }
        db.record_outreach(record)
        return {
            "success": True,
            "mode": "simulation",
            "message": f"Cold pitch successfully queued and recorded for {to_email} (Simulation Mode).",
            "record": record
        }

    # Pre-flight check: Prevent sending to placeholder, blacklisted, or domains without MX records
    if db.is_placeholder_or_bounced(to_email) or not verify_email_domain_mx(to_email):
        record = {
            "job_id": job_id,
            "to_email": to_email,
            "subject": subject,
            "body": body,
            "status": "Blocked (No MX Record / Invalid Domain)",
            "outreach_status": "denied",
            "mode": "Shielded (Pre-flight DNS Check)",
            "info": f"Prevented bounce: {to_email} domain has no active DNS MX records. Real SMTP blocked to protect sender reputation."
        }
        db.record_outreach(record)
        return {
            "success": False,
            "mode": "blocked_no_mx",
            "message": f"Pre-flight shield blocked dispatch to {to_email}: No valid MX records in DNS.",
            "record": record
        }


    # Real SMTP Dispatch
    try:
        sender_title = settings.get("sender_title", "Lead Automation & Solutions Engineer")
        sender_company = settings.get("sender_company", "Autonomous Systems & Workflow Automation")
        
        # Display From header formatted for executive inbox appearance
        display_from = f"{sender_name} | {sender_title} <{smtp_email}>" if sender_title else f"{sender_name} <{smtp_email}>"

        if attachments:
            msg = MIMEMultipart("mixed")
            body_container = MIMEMultipart("alternative")
            msg.attach(body_container)
        else:
            msg = MIMEMultipart("alternative")
            body_container = msg

        msg["From"] = display_from
        msg["To"] = to_email
        msg["Reply-To"] = smtp_email
        msg["Subject"] = subject
        msg["Date"] = formatdate(localtime=True)
        msg["Message-ID"] = make_msgid(domain="gmail.com")

        # 1. Plain text fallback part
        body_container.attach(MIMEText(body, "plain", "utf-8"))

        # 2. Executive HTML part
        html_content = html_body or convert_plain_to_professional_html(
            plain_text=body,
            sender_name=sender_name,
            sender_title=sender_title,
            sender_company=sender_company,
            sender_email=smtp_email
        )
        body_container.attach(MIMEText(html_content, "html", "utf-8"))

        # 3. Attach files if any
        if attachments:
            for attach_path in attachments:
                p = Path(attach_path)
                if p.exists() and p.is_file():
                    ctype, encoding = mimetypes.guess_type(str(p))
                    if ctype is None or encoding is not None:
                        ctype = "application/octet-stream"
                    maintype, subtype = ctype.split("/", 1)
                    with open(p, "rb") as f:
                        part = MIMEBase(maintype, subtype)
                        part.set_payload(f.read())
                    encoders.encode_base64(part)
                    part.add_header("Content-Disposition", f"attachment; filename=\"{p.name}\"")
                    msg.attach(part)

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
            "outreach_status": "sent",
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
    smtp_password = (smtp_password or "").replace(" ", "").strip()
    smtp_email = (smtp_email or "").strip()
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
