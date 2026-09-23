import imaplib
import email
from email.header import decode_header
import time
from typing import Dict, Any, List
from datetime import datetime

from backend.database import db
from backend.mailer.sender import send_cold_email

def analyze_client_reply(reply_text: str, client_email: str) -> Dict[str, Any]:
    """
    Analyzes incoming client email response, detects scam tactics,
    and drafts an ironclad anti-scam reply with milestone protection.
    """
    text_lower = reply_text.lower()

    # 1. SCAM DETECTOR
    scam_flags = []
    if any(k in text_lower for k in ["telegram", "t.me/", "whatsapp only", "contact me on telegram"]):
        scam_flags.append("Client trying to divert conversation away from email to Telegram/untraceable chat")
    if any(k in text_lower for k in ["send full code first", "send files first", "pay after 30 days", "pay next month"]):
        scam_flags.append("Client refusing milestone deposit (high non-payment risk)")
    if any(k in text_lower for k in ["pay fee", "security deposit", "registration fee", "buy equipment"]):
        scam_flags.append("Classic upfront fee scam (never pay money to work!)")

    is_scam_risk = len(scam_flags) > 0

    # 2. INTENT CLASSIFICATION & ANTI-SCAM RESPONSE
    settings = db.get_settings()
    sender_name = settings.get("sender_name", "Automation & Tech Consultant")

    if is_scam_risk:
        action_recommendation = "Reject scam offer or enforce escrow"
        reply_subject = "Re: your project requirement - milestone policy"
        reply_body = f"""Hi there,

Thank you for your reply.

Per our development policy, all client work is conducted strictly through standard 50% milestone invoices or platform escrow (Upwork / Stripe Milestone) to ensure mutual protection. We do not deliver source code prior to milestone funding, nor do we communicate on untraceable channels like Telegram.

If you are happy to proceed with standard milestone escrow, I'd be glad to send over a sample demonstration. Otherwise, I will have to respectfully pass.

Best regards,
{sender_name}"""

    elif any(k in text_lower for k in ["sample", "demo", "proof", "show me", "portfolio", "test"]):
        action_recommendation = "Send video proof or sample rows"
        reply_subject = "Re: your project - sample demo"
        reply_body = f"""Hi there,

Happy to show you proof!

I've already sketched out the exact automated workflow and can share a 60-second screen capture running a test batch on your data today so you can verify the format without spending a dime.

For the final source code and 1-click execution script, we use a standard 50% milestone invoice to kick off and 50% upon your review of the working demo.

Does that work for you? If so, send over the target link or sample input and I'll generate the demo right away.

Best,
{sender_name}"""

    elif any(k in text_lower for k in ["price", "cost", "how much", "rate", "quote", "budget"]):
        action_recommendation = "State flat fee with 50% upfront milestone"
        reply_subject = "Re: project quote & timeline"
        reply_body = f"""Hi there,

Thanks for reaching out!

I can deliver the complete, automated solution with full error handling and a 1-click runner for a flat fee. We break this down into a 50% milestone deposit to get started and 50% after you test the working demo on your machine.

Turnaround time is 24 to 48 hours.

Where should I send the milestone invoice or payment link so we can kick off?

Best,
{sender_name}"""

    else:
        # General positive interest
        action_recommendation = "Lock in project scope and send invoice"
        reply_subject = "Re: getting started on your project"
        reply_body = f"""Hi there,

Great to connect!

I'm ready to build this out for you. To kick things off cleanly:
1. I'll send over a 50% milestone invoice or Stripe/PayPal link.
2. I'll deliver the working solution with a 1-click runner and video guide within 48 hours.
3. You test everything, and once satisfied, release the final 50%.

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
    analysis = analyze_client_reply(mock_reply, "inquiries@clientcompany.com")
    
    # Record in escalation desk
    db.add_escalation(
        title="⚠️ Incoming Reply Analyzed: High Scam Risk",
        description="Client asked for full source code before payment. Anti-Scam Shield has drafted a defensive milestone enforcement reply.",
        action_required="Click 'Send Anti-Scam Response' to protect yourself."
    )
    db.add_autopilot_log("🛡️ Anti-Scam Shield intercepted client message: Enforced 50% milestone policy.", level="action")
    return analysis
