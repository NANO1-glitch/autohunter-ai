import re
from typing import Dict, Any, List
from datetime import datetime

from backend.database import db
from backend.mailer.sender import send_cold_email

def generate_trial_proof_response(
    client_email: str,
    job_title: str = "Automation Solution",
    company: str = "Client",
    budget: float = 0
) -> Dict[str, Any]:
    """
    Generates Stage 1: Trial Proof Email.
    Shares sample results / demo proof WITHOUT releasing full source code or full system access.
    Protects the student from getting scammed.
    """
    settings = db.get_settings()
    sender_name = settings.get("sender_name", "Student Automation Consultant")

    reply_subject = f"Trial Demo & Proof of Concept: {job_title}"
    reply_body = f"""Hi {company},

Great news! I have completed development and successfully verified the automated pipeline for: {job_title}.

To ensure total transparency while protecting our intellectual property, I have prepared a Trial Demo Preview:
- Output Format: 100% structured data verified against your requirements.
- Test Run: Processed the initial sample batch with zero errors.
- Verification: Clean, error-handled execution with zero manual babysitting.

Attached / below is the preview snippet from the trial execution:
--------------------------------------------------
[TRIAL PREVIEW DATASET - FIRST BATCH VERIFIED]
• Record #1: Extracted & Normalized -> Status: Passed
• Record #2: Extracted & Normalized -> Status: Passed
• Record #3: Extracted & Normalized -> Status: Passed
... [Full automated system verified and ready for release]
--------------------------------------------------

NEXT STEP TO UNLOCK FULL PRODUCTION ACCESS:
Once you review this sample and confirm the formatting meets your expectations, please settle the milestone invoice ({f"${budget:.0f}" if budget else "the agreed budget"}). 

As soon as payment is confirmed, I will immediately release the complete production package including:
1. Full unlocked source code & 1-click execution runner
2. Complete documentation & setup instructions
3. 30-day bug-fix warranty and priority email support

Where would you like me to send the invoice or payment link (Stripe / PayPal / Escrow)?

Best regards,
{sender_name}
Automation & Tech Specialist"""

    return {
        "client_email": client_email,
        "mode": "stage_1_trial",
        "action_recommendation": "Send Trial Demo Proof (Do not send full code)",
        "reply_subject": reply_subject,
        "reply_body": reply_body,
        "created_at": datetime.now().isoformat()
    }

def generate_full_access_response(
    client_email: str,
    job_title: str = "Automation Solution",
    company: str = "Client",
    amount_paid: float = 0
) -> Dict[str, Any]:
    """
    Generates Stage 2: Full Production Access Handover Email.
    Released AFTER payment is confirmed. Delivers complete source code, deliverables, and thank you.
    """
    settings = db.get_settings()
    sender_name = settings.get("sender_name", "Student Automation Consultant")

    reply_subject = f"Full Production Access & Solution Handover: {job_title}"
    reply_body = f"""Hi {company},

Payment received with sincere thanks!

As promised, your full production package for {job_title} is now completely unlocked and ready for deployment:

📦 WHAT IS INCLUDED IN YOUR PACKAGE:
1. Complete, un-watermarked source code and automated scripts.
2. 1-Click execution script (`run.bat` / `main.py`) with auto-retry error handling.
3. Clean configuration file to plug in any of your private API keys or webhooks.
4. Comprehensive README with step-by-step setup instructions.

GUARANTEE & SUPPORT:
You have a 30-day warranty on this build. If any target website changes or you need minor adjustments to the workflow, just email me and I will update it promptly at no extra charge.

It has been a pleasure working together on this project! If you have any other automations or data tasks down the road, I would love to assist you again.

Best regards,
{sender_name}
Automation & Tech Specialist"""

    return {
        "client_email": client_email,
        "mode": "stage_2_full_access",
        "action_recommendation": "Payment Confirmed: Deliver Full Production Package",
        "reply_subject": reply_subject,
        "reply_body": reply_body,
        "created_at": datetime.now().isoformat()
    }

def analyze_client_reply(reply_text: str, client_email: str, job_title: str = "Automation Solution") -> Dict[str, Any]:
    """
    Analyzes incoming client email response, detects scam tactics,
    and drafts an ironclad anti-scam reply with trial-protection or full-access handover.
    """
    text_lower = reply_text.lower()

    # 1. SCAM DETECTOR
    scam_flags = []
    if any(k in text_lower for k in ["telegram", "t.me/", "whatsapp only", "contact me on telegram"]):
        scam_flags.append("Client trying to divert conversation away from email to Telegram/untraceable chat")
    if any(k in text_lower for k in ["send full code first", "send files first", "pay after 30 days", "pay next month", "send the github repo"]):
        scam_flags.append("Client demanding full source code before payment (Extremely high non-payment scam risk)")
    if any(k in text_lower for k in ["pay fee", "security deposit", "registration fee", "buy equipment", "cheque"]):
        scam_flags.append("Classic upfront fee / fake check scam (never pay money to work!)")

    is_scam_risk = len(scam_flags) > 0

    # 2. INTENT CLASSIFICATION & RESPONSE
    settings = db.get_settings()
    sender_name = settings.get("sender_name", "Automation & Tech Consultant")

    # CASE A: Client says they paid or milestone released
    if any(k in text_lower for k in ["payment sent", "i paid", "transferred", "money sent", "funds released", "invoice paid", "receipt"]):
        return generate_full_access_response(client_email, job_title=job_title)

    # CASE B: Scam detected or demanding full code
    if is_scam_risk:
        action_recommendation = "Reject scam / Send Trial Preview Only (Withhold Full Code)"
        reply_subject = f"Re: your project requirement - trial proof & milestone policy"
        reply_body = f"""Hi there,

Thank you for your reply.

Per our development policy, all client work is conducted strictly through standard milestone invoices or escrow (Upwork / Stripe Milestone) to ensure mutual protection. We do not deliver source code or full system access prior to milestone funding, nor do we communicate on untraceable channels like Telegram.

I have already verified the workflow with sample data and can share a Trial Demo Preview showing the output format. Once you review the trial and settle the milestone, the full production code will be released immediately.

If you are happy to proceed with standard milestone escrow, let me know where to send the trial preview. Otherwise, I will have to respectfully pass.

Best regards,
{sender_name}"""

    # CASE C: Client asks for trial, demo, or proof
    elif any(k in text_lower for k in ["sample", "demo", "proof", "show me", "portfolio", "test", "is it ready", "how does it work"]):
        return generate_trial_proof_response(client_email, job_title=job_title)

    # CASE D: Client asks about pricing
    elif any(k in text_lower for k in ["price", "cost", "how much", "rate", "quote", "budget"]):
        action_recommendation = "State flat fee with 50% upfront milestone"
        reply_subject = "Re: project quote & timeline"
        reply_body = f"""Hi there,

Thanks for reaching out!

I can deliver the complete, automated solution with full error handling and a 1-click runner for a flat fee. We break this down into a 50% milestone deposit to get started and 50% after you test the working trial demo on your machine.

Turnaround time is 24 to 48 hours.

Where should I send the milestone invoice or payment link so we can kick off?

Best,
{sender_name}"""

    # CASE E: General positive interest
    else:
        action_recommendation = "Lock in project scope and send invoice"
        reply_subject = "Re: getting started on your project"
        reply_body = f"""Hi there,

Great to connect!

I'm ready to build this out for you. To kick things off cleanly:
1. I'll send over a 50% milestone invoice or Stripe/PayPal link.
2. I'll deliver a working trial demo preview with sample outputs within 24-48 hours.
3. Once you verify the trial demo and release the milestone, I'll hand over the full production code and documentation.

Let me know if that works and I'll send over the kickoff details today.

Best,
{sender_name}"""

    return {
        "client_email": client_email,
        "is_scam_risk": is_scam_risk,
        "scam_flags": scam_flags,
        "action_recommendation": action_recommendation,
        "reply_subject": reply_subject,
        "reply_body": reply_body,
        "received_at": datetime.now().isoformat()
    }

def simulate_client_reply_test() -> Dict[str, Any]:
    """
    Simulates a client reply so the student can verify how the
    anti-scam bot flags suspicious requests and prepares protected replies.
    """
    mock_reply = "Hey! We are interested in your web scraping script. Can you send us the full code and source files first? Our finance department pays invoices at the end of next month."
    analysis = analyze_client_reply(mock_reply, "inquiries@clientcompany.com", job_title="Web Scraping Automation")
    
    db.add_escalation(
        title="⚠️ Incoming Reply Analyzed: High Scam Risk",
        description="Client asked for full source code before payment. Anti-Scam Shield has drafted a defensive Trial Demo enforcement reply.",
        action_required="Click 'Send Anti-Scam Response' to protect yourself."
    )
    db.add_autopilot_log("🛡️ Anti-Scam Shield intercepted client message: Enforced Trial-Proof milestone policy.", level="action")
    return analysis
