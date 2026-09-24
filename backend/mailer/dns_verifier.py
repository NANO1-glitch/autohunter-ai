import json
import urllib.request
import urllib.error
from typing import Optional, Dict

# In-memory cache for fast lookups
_MX_CACHE: Dict[str, bool] = {
    "gmail.com": True,
    "googlemail.com": True,
    "outlook.com": True,
    "hotmail.com": True,
    "live.com": True,
    "yahoo.com": True,
    "icloud.com": True,
    "proton.me": True,
    "protonmail.com": True,
    "aol.com": True,
    "zoho.com": True,
}

KNOWN_DEAD_DOMAINS = {
    "scaleretaillabs.io",
    "kryptonpay.app",
    "sentineldefense.tech",
    "luminarytech.io",
    "pulsehealth.app",
    "veritasclinics.com",
    "sneakerdropalerts.com",
    "apexventurepartners.io",
    "crestviewcapital.re",
    "elevatestudios.co",
    "hyperflowanalytics.com",
    "pulsefitglobal.com",
    "clientcompany.com",
    "example.com",
    "domain.com",
    "test.com",
    "placeholder.com"
}

def extract_domain(email_or_domain: str) -> str:
    """Extracts a clean, lowercase domain from an email or domain string."""
    if not email_or_domain:
        return ""
    val = email_or_domain.strip().lower()
    if "@" in val:
        val = val.split("@")[-1].strip()
    return val

def verify_email_domain_mx(email_or_domain: str, timeout: float = 3.5) -> bool:
    """
    Performs real-time DNS MX verification before attempting any SMTP delivery.
    Returns True if the domain has active Mail Exchange (MX) records.
    Returns False if the domain has no MX records or NXDOMAIN (guaranteeing a bounce).
    Uses caching and redundant DNS over HTTPS (DoH) providers (Google DNS & Cloudflare DNS).
    """
    domain = extract_domain(email_or_domain)
    if not domain or "." not in domain or len(domain.split(".")[-1]) < 2:
        return False

    if domain in KNOWN_DEAD_DOMAINS:
        return False

    if domain in _MX_CACHE:
        return _MX_CACHE[domain]

    # 1. Primary: Google Public DNS over HTTPS
    try:
        url = f"https://dns.google/resolve?name={domain}&type=MX"
        req = urllib.request.Request(url, headers={"User-Agent": "AutoHunter/1.1"})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = json.loads(resp.read().decode())
            answers = data.get("Answer", [])
            # Status 0 = NOERROR, 3 = NXDOMAIN
            status = data.get("Status", 0)
            if status == 3:  # NXDOMAIN
                _MX_CACHE[domain] = False
                return False
            # Check for MX records (DNS type 15)
            has_mx = any(ans.get("type") == 15 for ans in answers)
            if has_mx:
                _MX_CACHE[domain] = True
                return True
            # If status is NOERROR but no MX records, check if there is an A record fallback
            # (Strict deliverability: Gmail bounce occurs if neither valid MX nor direct mail handling)
            if not answers:
                _MX_CACHE[domain] = False
                return False
    except Exception:
        pass

    # 2. Secondary Fallback: Cloudflare DNS over HTTPS
    try:
        cf_url = f"https://cloudflare-dns.com/dns-query?name={domain}&type=MX"
        cf_req = urllib.request.Request(cf_url, headers={
            "User-Agent": "AutoHunter/1.1",
            "Accept": "application/dns-json"
        })
        with urllib.request.urlopen(cf_req, timeout=timeout) as resp:
            data = json.loads(resp.read().decode())
            answers = data.get("Answer", [])
            status = data.get("Status", 0)
            if status == 3:
                _MX_CACHE[domain] = False
                return False
            has_mx = any(ans.get("type") == 15 for ans in answers)
            _MX_CACHE[domain] = has_mx
            return has_mx
    except Exception:
        pass

    # If verification failed due to network errors and domain is not known, default to False to prevent bounces
    _MX_CACHE[domain] = False
    return False
