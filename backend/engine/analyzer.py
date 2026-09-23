import re
from typing import Dict, Any, List

def analyze_job(job_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyzes raw job data to classify feasibility, category, difficulty,
    AI fulfillment dev time, budget normalization, and turnaround time.
    """
    title = job_data.get("title", "")
    description = job_data.get("description", "")
    content = f"{title}\n{description}".lower()

    # 1. Category Classification & Feasibility
    category = "General Automation"
    feasibility = 80
    difficulty = "Easy"
    ai_time = "30 mins"
    turnaround = "2 to 3 days"
    deliverable = "Automated solution package"
    skills = []

    # Category matching heuristics - specific micro-tasks first
    if any(k in content for k in ["caption", "captions", "subtitle", "subtitles", "transcribe", "transcription", "srt", "vtt", "reels caption", "tiktok caption"]):
        category = "Video Captions & Subtitles"
        feasibility = 98
        difficulty = "Very Easy"
        ai_time = "5-10 mins with AI transcription"
        turnaround = "24 hours"
        deliverable = "Synchronized SRT / VTT subtitle files + formatted text script"
        skills = ["Video Captions", "Subtitles", "Transcription", "Short-Form Video"]

    elif any(k in content for k in ["translate", "translation", "translator", "spanish", "french", "german", "localize", "localization"]):
        category = "Language Translation & Localization"
        feasibility = 98
        difficulty = "Very Easy"
        ai_time = "10 mins with AI translation"
        turnaround = "24 hours"
        deliverable = "Accurate, culturally natural translated document + side-by-side verification"
        skills = ["Translation", "Localization", "Multi-Language", "Proofreading"]

    elif any(k in content for k in ["scrape", "scraper", "scraping", "crawl", "playwright", "selenium", "extract data", "lead extraction"]):
        category = "Web Scraping & Data Extraction"
        feasibility = 95
        difficulty = "Very Easy"
        ai_time = "15-25 mins with Python Playwright/BeautifulSoup"
        turnaround = "24 to 48 hours"
        deliverable = "Robust Python extraction script + Clean sample CSV + README setup"
        skills = ["Python", "Playwright", "Web Scraping", "CSV/Excel Data"]

    elif any(k in content for k in ["bot", "script", "automation", "automate", "zapier", "make.com", "webhook", "cron", "auto-reply", "sync"]):
        category = "Automation & Python Scripts"
        feasibility = 92
        difficulty = "Easy"
        ai_time = "30-45 mins with Python or Make.com"
        turnaround = "2 to 3 days"
        deliverable = "End-to-end automation workflow + auto-retry error handling + instructions"
        skills = ["Python", "API Integration", "Automation", "Zapier/Make"]

    elif any(k in content for k in ["excel", "google sheet", "spreadsheet", "data entry", "clean data", "csv", "format data", "vba", "macro"]):
        category = "Data Entry & Excel Automations"
        feasibility = 98
        difficulty = "Very Easy"
        ai_time = "10-20 mins using Python Pandas & OpenPyXL"
        turnaround = "24 hours"
        deliverable = "100% cleaned and validated spreadsheet + 1-click update script"
        skills = ["Excel", "Google Sheets", "Data Cleaning", "Pandas"]

    elif any(k in content for k in ["logo", "brand identity", "graphic design", "banner", "flyer", "social media post", "thumbnail", "vector", "svg"]):
        category = "Logo & Brand Design"
        feasibility = 90
        difficulty = "Very Easy"
        ai_time = "15-30 mins with AI generation + vectorization"
        turnaround = "24 to 48 hours"
        deliverable = "3-5 high-resolution vector logo concepts (SVG, PNG transparent, brand palette)"
        skills = ["Graphic Design", "Logo Design", "Branding", "Vector SVG"]

    elif any(k in content for k in ["chatgpt", "openai", "claude", "llm", "ai chatbot", "langchain", "agent", "gemini", "rag", "custom gpt"]):
        category = "AI Chatbots & Workflows"
        feasibility = 92
        difficulty = "Easy"
        ai_time = "45 mins with FastAPI + OpenAI/Gemini API"
        turnaround = "3 to 4 days"
        deliverable = "Custom trained AI bot embeddable on website/WhatsApp + prompt template"
        skills = ["AI Chatbots", "Prompt Engineering", "OpenAI/Gemini", "FastAPI"]

    elif any(k in content for k in ["landing page", "website", "react", "html", "css", "portfolio", "wordpress", "webflow", "shopify"]):
        category = "Web & Landing Page Dev"
        feasibility = 85
        difficulty = "Moderate"
        ai_time = "1-2 hours using AI code generation & Tailwind"
        turnaround = "3 to 5 days"
        deliverable = "Responsive, high-converting landing page with mobile optimization"
        skills = ["Web Development", "React/Tailwind", "Responsive Design"]

    elif any(k in content for k in ["copywriting", "blog", "content writer", "article", "newsletter", "email sequence"]):
        category = "Copywriting & Translation"
        feasibility = 95
        difficulty = "Very Easy"
        ai_time = "15 mins with AI editor"
        turnaround = "24 hours"
        deliverable = "SEO-optimized, human-edited articles or sales copy"
        skills = ["Copywriting", "SEO", "Content Strategy"]

    # 2. Extract or Estimate Budget
    budget = job_data.get("budget", 0)
    if not budget or budget == 0:
        # Regex search for $XXX or XXX USD or XXX/hr
        dollar_match = re.search(r'\$\s?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?)', description + " " + title)
        if dollar_match:
            try:
                num_str = dollar_match.group(1).replace(",", "")
                val = float(num_str)
                # If it looks like an hourly rate, assume a 20h project
                if val < 150 and any(h in content for h in ["/hr", "per hour", "hourly"]):
                    budget = val * 20
                else:
                    budget = val
            except Exception:
                pass

        if not budget or budget < 50:
            # Contextual estimation based on category
            budget_defaults = {
                "Web Scraping & Data Extraction": 650,
                "Automation & Python Scripts": 1200,
                "AI Chatbots & Workflows": 1800,
                "Logo & Brand Design": 450,
                "Data Entry & Excel Automations": 400,
                "Web & Landing Page Dev": 1500,
                "Video Captions & Subtitles": 250,
                "Language Translation & Localization": 300,
                "Copywriting & Translation": 350,
                "General Automation": 800
            }
            budget = budget_defaults.get(category, 750)

    # 3. High Ticket Classification
    is_high_ticket = budget >= 1000

    # 4. Hourly Profit Calculation for the student
    # Estimated minutes to hours
    est_hours = 0.5
    if "15" in ai_time or "20" in ai_time:
        est_hours = 0.35
    elif "45" in ai_time:
        est_hours = 0.75
    elif "1-2" in ai_time:
        est_hours = 1.5

    effective_hourly_rate = round(budget / max(est_hours, 0.25))

    # Safely flatten and deduplicate skills
    raw_skills = skills + job_data.get("skills", [])
    deduped_skills = []
    seen = set()
    for s in raw_skills:
        if isinstance(s, list):
            for sub in s:
                val = str(sub).strip()
                if val and val not in seen:
                    seen.add(val)
                    deduped_skills.append(val)
        else:
            val = str(s).strip()
            if val and val not in seen:
                seen.add(val)
                deduped_skills.append(val)

    # 5. Resume / Bidding vs Direct Deal Detection
    resume_indicators = ["resume", "cv", "curriculum vitae", "cover letter", "submit application", "years of experience required", "send your resume"]
    requires_resume = any(ind in content for ind in resume_indicators)
    application_type = "Resume Required" if requires_resume else "Direct Deal (No Resume / No Bidding)"

    # 6. Global Country & Currency Detection
    loc = job_data.get("location", "").lower()
    if any(c in loc for c in ["us", "usa", "united states", "america"]):
        country_badge = "🇺🇸 USA ($ USD)"
    elif any(c in loc for c in ["uk", "united kingdom", "london"]):
        country_badge = "🇬🇧 UK (£ GBP)"
    elif any(c in loc for c in ["europe", "germany", "france", "netherlands", "spain", "emea"]):
        country_badge = "🇪🇺 Europe (€ EUR)"
    elif any(c in loc for c in ["canada", "toronto"]):
        country_badge = "🇨🇦 Canada ($ CAD)"
    elif any(c in loc for c in ["australia", "sydney"]):
        country_badge = "🇦🇺 Australia ($ AUD)"
    else:
        country_badge = "🌍 Global Remote ($ USD)"

    return {
        **job_data,
        "category": category,
        "feasibility_score": feasibility,
        "difficulty": difficulty,
        "ai_dev_time": ai_time,
        "turnaround_time": turnaround,
        "budget": round(budget, 2),
        "is_high_ticket": is_high_ticket,
        "deliverable": deliverable,
        "effective_hourly_rate": effective_hourly_rate,
        "requires_resume": requires_resume,
        "application_type": application_type,
        "country_badge": country_badge,
        "skills": deduped_skills
    }
