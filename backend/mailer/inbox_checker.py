import imaplib
import email
from email.header import decode_header
from typing import Dict, Any, List, Optional
from datetime import datetime

from backend.database import db

def decode_mime_words(raw_header: str) -> str:
    """Decodes MIME encoded header strings (e.g. =?UTF-8?B?...?=)."""
    if not raw_header:
        return ""
    decoded_fragments = decode_header(raw_header)
    parts = []
    for fragment, encoding in decoded_fragments:
        if isinstance(fragment, bytes):
            try:
                parts.append(fragment.decode(encoding or "utf-8", errors="replace"))
            except Exception:
                parts.append(fragment.decode("utf-8", errors="replace"))
        else:
            parts.append(str(fragment))
    return "".join(parts)

def extract_email_body(msg: email.message.Message) -> str:
    """Extracts clean plain-text body from an email message."""
    body = ""
    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            content_disposition = str(part.get("Content-Disposition"))
            if content_type == "text/plain" and "attachment" not in content_disposition:
                payload = part.get_payload(decode=True)
                if payload:
                    body += payload.decode("utf-8", errors="replace") + "\n"
            elif content_type == "text/html" and not body and "attachment" not in content_disposition:
                payload = part.get_payload(decode=True)
                if payload:
                    html_text = payload.decode("utf-8", errors="replace")
                    # Basic tag strip
                    import re
                    clean_text = re.sub(r'<[^>]+>', ' ', html_text)
                    body += clean_text + "\n"
    else:
        payload = msg.get_payload(decode=True)
        if payload:
            body = payload.decode("utf-8", errors="replace")
    return body.strip()

def classify_client_reply(reply_text: str) -> Dict[str, Any]:
    """
    Intelligently analyzes client message text and automatically classifies whether
    the job is APPROVED (hired/won), DENIED (rejected), or PENDING (questions/trial request).
    """
    text = reply_text.lower()

    # 1. APPROVED SIGNALS
    approval_signals = [
        "approved", "let's proceed", "lets proceed", "you're hired", "you are hired",
        "sounds good, let's start", "sounds good lets start", "sounds good to me",
        "when can you start", "let's do it", "lets do it", "we would love to work with you",
        "send the invoice", "send payment link", "send your paypal", "send your bank details",
        "payment sent", "i paid", "transferred", "contract sent", "accepted", "deal",
        "looks good, go ahead", "go ahead", "hire you", "ready to move forward",
        "milestone funded", "start working", "agreed"
    ]

    # 2. DENIED / REJECTED SIGNALS
    denial_signals = [
        "not interested", "position has been filled", "position is filled", "already filled",
        "already hired", "hired someone else", "we have selected another", "not moving forward",
        "too expensive", "out of budget", "no thank you", "no thanks", "unsubscribe",
        "remove me from your list", "do not contact", "pass on this", "not looking for freelancers",
        "position closed", "we went with another candidate", "not a good fit"
    ]

    # 3. PENDING / TRIAL REQUEST SIGNALS
    pending_signals = [
        "sample", "demo", "proof", "show me", "portfolio", "test", "how much",
        "what is your rate", "can you send", "timeline", "more details", "interview"
    ]

    if any(s in text for s in approval_signals):
        return {
            "status": "approved",
            "confidence": "high",
            "reason": "Client expressed clear approval, hiring intent, or confirmed payment."
        }
    elif any(s in text for s in denial_signals):
        return {
            "status": "denied",
            "confidence": "high",
            "reason": "Client declined the pitch or indicated position is filled/closed."
        }
    elif any(s in text for s in pending_signals):
        return {
            "status": "pending",
            "confidence": "medium",
            "reason": "Client replied with inquiries or requested trial/portfolio demo."
        }
    else:
        return {
            "status": "pending",
            "confidence": "low",
            "reason": "Client message received. Marked as Pending for your review."
        }

def check_gmail_for_replies() -> Dict[str, Any]:
    """
    Connects to Gmail via IMAP, inspects incoming emails from clients we've pitched,
    automatically detects Approval vs Denial vs Questions, and updates CRM status.
    """
    settings = db.get_settings()
    user = settings.get("smtp_email", "").strip()
    pwd = settings.get("smtp_password", "").replace(" ", "").strip()
    imap_server = "imap.gmail.com"
    imap_port = 993

    if not user or not pwd:
        return {
            "success": False,
            "error": "Gmail credentials (smtp_email / smtp_password) not configured in Settings."
        }

    outreaches = db.get_outreaches()
    if not outreaches:
        return {
            "success": True,
            "checked": 0,
            "replies_found": 0,
            "message": "No active outreach records to track in CRM."
        }

    # Map target emails to outreach records (normalize lowercase)
    email_to_records = {}
    for o in outreaches:
        email_addr = (o.get("to_email") or "").strip().lower()
        if email_addr:
            if email_addr not in email_to_records:
                email_to_records[email_addr] = []
            email_to_records[email_addr].append(o)

    detected_replies = []
    approvals_count = 0
    denials_count = 0

    try:
        mail = imaplib.IMAP4_SSL(imap_server, imap_port, timeout=12)
        mail.login(user, pwd)
        mail.select("INBOX", readonly=True)

        for client_email, records in email_to_records.items():
            try:
                # Search for emails FROM this client
                status, msg_data = mail.search(None, f'(FROM "{client_email}")')
                if status != "OK" or not msg_data or not msg_data[0]:
                    continue

                msg_ids = msg_data[0].split()
                if not msg_ids:
                    continue

                # Get the most recent message from this client
                latest_id = msg_ids[-1]
                res, data = mail.fetch(latest_id, "(RFC822)")
                if res != "OK":
                    continue

                raw_email = data[0][1]
                msg = email.message_from_bytes(raw_email)

                subject = decode_mime_words(msg.get("Subject", ""))
                date_str = msg.get("Date", "")
                body = extract_email_body(msg)

                # Classify the reply
                classification = classify_client_reply(body)
                detected_status = classification["status"]

                for rec in records:
                    old_status = rec.get("outreach_status", "sent")
                    # Update status in DB
                    db.update_outreach_status(rec["id"], detected_status)

                    if detected_status == "approved":
                        approvals_count += 1
                        db.add_autopilot_log(
                            f"🎉 Auto-Detected Approval from {client_email}! Status updated to Approved / Won.",
                            level="success"
                        )
                    elif detected_status == "denied":
                        denials_count += 1
                        db.add_autopilot_log(
                            f"ℹ️ Auto-Detected Decline from {client_email}. Status updated to Denied.",
                            level="warning"
                        )

                    detected_replies.append({
                        "outreach_id": rec["id"],
                        "client_email": client_email,
                        "subject": subject,
                        "date": date_str,
                        "old_status": old_status,
                        "new_status": detected_status,
                        "reason": classification["reason"],
                        "body_snippet": body[:200] + ("..." if len(body) > 200 else "")
                    })

            except Exception as search_err:
                print(f"[IMAP] Error checking client {client_email}: {search_err}")

        # Check for PayPal payment confirmations to auto-release full app
        try:
            status, pp_data = mail.search(None, '(OR (FROM "paypal") (SUBJECT "payment received"))')
            if status == "OK" and pp_data and pp_data[0]:
                for pp_id in pp_data[0].split()[-5:]: # check last 5 paypal emails
                    res, fetch_data = mail.fetch(pp_id, "(RFC822)")
                    if res != "OK":
                        continue
                    pp_msg = email.message_from_bytes(fetch_data[0][1])
                    pp_body = extract_email_body(pp_msg)
                    # Check if body contains any pitched client email or project title
                    for client_email, records in email_to_records.items():
                        if client_email in pp_body.lower():
                            for rec in records:
                                if rec.get("outreach_status") != "approved":
                                    from backend.engine.verifier import release_full_app_to_client
                                    release_full_app_to_client(rec.get("job_id", "job"), client_email, float(rec.get("budget", 150)))
                                    db.add_autopilot_log(
                                        f"💰 PayPal Payment Auto-Detected from {client_email}! Full Application package automatically released!",
                                        level="success"
                                    )
        except Exception as pp_err:
            print(f"[IMAP] PayPal scan notice: {pp_err}")

        # Check for Mail Delivery Subsystem / Bounce notifications (Address not found)
        bounced_count = 0
        bounced_list = []
        try:
            status, bounce_data = mail.search(None, '(OR (FROM "mailer-daemon") (OR (SUBJECT "Delivery Status") (SUBJECT "Address not found")))')
            if status == "OK" and bounce_data and bounce_data[0]:
                import re
                for b_id in bounce_data[0].split()[-25:]:
                    res, fetch_data = mail.fetch(b_id, "(RFC822)")
                    if res != "OK":
                        continue
                    b_msg = email.message_from_bytes(fetch_data[0][1])
                    b_body = extract_email_body(b_msg)
                    
                    # Regex match bounced addresses from multiple mailer-daemon formats
                    patterns = [
                        r"(?:wasn't delivered to|failed to deliver to|delivered to|unable to deliver to|couldn't be found)\s*<?([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)>?",
                        r"Final-Recipient:\s*rfc822;\s*<?([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)>?",
                        r"Original-Recipient:\s*rfc822;\s*<?([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)>?",
                        r"\bto:\s*<?([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)>?"
                    ]
                    for pat in patterns:
                        for bad_email in re.findall(pat, b_body, re.IGNORECASE):
                            bad_email = bad_email.strip().lower()
                            if bad_email and bad_email != user.lower() and "google" not in bad_email and "mailer-daemon" not in bad_email:
                                removed = db.add_bounced_email(bad_email)
                                if bad_email not in bounced_list:
                                    bounced_list.append(bad_email)
                                    bounced_count += 1
                                    db.add_autopilot_log(
                                        f"🚫 Auto-Purged Bounced Outreach: {bad_email} ('Address not found'). Blacklisted to protect sender reputation.",
                                        level="warning"
                                    )
        except Exception as b_err:
            print(f"[IMAP] Bounce check notice: {b_err}")


        mail.logout()

    except Exception as err:
        return {
            "success": False,
            "error": f"Failed to check Gmail IMAP: {err}"
        }

    msg_text = f"Scanned {len(email_to_records)} client threads: {len(detected_replies)} replies detected ({approvals_count} Approved, {denials_count} Denied)."
    if bounced_count > 0:
        msg_text += f" Auto-purged {bounced_count} bounced 'Address not found' email(s) from tracker."

    return {
        "success": True,
        "checked_targets": len(email_to_records),
        "replies_found": len(detected_replies),
        "approvals": approvals_count,
        "denials": denials_count,
        "bounces_purged": bounced_count,
        "bounced_emails": bounced_list,
        "results": detected_replies,
        "message": msg_text
    }

def simulate_reply_detection(target_status: str, outreach_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Test helper allowing user to simulate what happens when a client approves or denies.
    """
    outreaches = db.get_outreaches()
    if not outreaches:
        return {"success": False, "error": "No outreach records found"}

    target = None
    if outreach_id:
        target = next((o for o in outreaches if o["id"] == outreach_id), None)
    if not target:
        target = outreaches[0]

    status_name = "approved" if target_status.lower() in ["approved", "won", "yes"] else "denied"
    db.update_outreach_status(target["id"], status_name)

    sample_text = (
        "Hi! We reviewed your proposal and sample output. Looks fantastic! When can you start? Send over the invoice."
        if status_name == "approved"
        else "Thanks for reaching out, but this position has already been filled. Best of luck!"
    )

    db.add_autopilot_log(
        f"{'🎉' if status_name == 'approved' else 'ℹ️'} Simulated client reply for {target['to_email']}: Marked as {status_name.capitalize()}.",
        level="success" if status_name == "approved" else "warning"
    )

    return {
        "success": True,
        "outreach_id": target["id"],
        "client_email": target["to_email"],
        "new_status": status_name,
        "sample_text": sample_text,
        "message": f"Successfully simulated client response! Outreach status updated to '{status_name}'."
    }
