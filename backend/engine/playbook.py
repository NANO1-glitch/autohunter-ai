from typing import Dict, Any

def get_student_playbook(job: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generates a personalized, beginner-friendly coaching playbook for a student.
    Teaches the student step-by-step how to price, pitch, fulfill with AI, and close the deal.
    """
    category = job.get("category", "General Automation")
    title = job.get("title", "Project")
    budget = job.get("budget", 500)
    difficulty = job.get("difficulty", "Easy")
    ai_time = job.get("ai_dev_time", "30 mins")
    turnaround = job.get("turnaround_time", "2-3 days")
    deliverable = job.get("deliverable", "Finished project package")

    # 1. Fulfillment Steps with Antigravity / AI
    if "Scraping" in category:
        fulfillment_steps = [
            "Ask Antigravity: 'Write a Python script using Playwright or BeautifulSoup to scrape [URL] and export clean columns: [List fields] to CSV.'",
            "Run the script locally in your terminal to scrape 10 sample items and ensure headers match.",
            "Add error handling: Make sure it handles pagination and adds a 1-second delay between requests.",
            "Package it: Put the Python file in a folder, add a 4-line `README.txt` with instructions (`pip install playwright`, `python scraper.py`), and attach the sample CSV."
        ]
        tools_recommended = ["Python 3", "Playwright or BeautifulSoup", "Pandas", "Antigravity Assistant"]
    elif "Data Entry" in category or "Excel" in category:
        fulfillment_steps = [
            "Ask Antigravity: 'Write a Python script using pandas and openpyxl that takes input.xlsx, removes duplicates, formats phone/email columns, and exports formatted_output.xlsx.'",
            "Drop the client's messy file in your scratch folder and run the script. It finishes in 5 seconds.",
            "Inspect the output in Excel or Google Sheets to verify zero missing rows.",
            "Deliver both the cleaned spreadsheet AND the script so the client sees you as a tech wizard."
        ]
        tools_recommended = ["Python Pandas", "OpenPyXL", "Google Sheets", "Antigravity Assistant"]
    elif "Logo" in category or "Design" in category:
        fulfillment_steps = [
            "Use AI image generation or SVG generation: generate 4 high-concept vector marks based on client's industry and color preferences.",
            "Select the top 2 cleanest, minimalist versions with modern fonts.",
            "Export in 3 formats: High-res transparent PNG, Vector SVG, and dark/light background variants.",
            "Create a 1-page PDF brand card showing the logo, font name, and color hex codes."
        ]
        tools_recommended = ["AI Vector Generator", "Figma (Free)", "Canva / SVG tools", "Antigravity Assistant"]
    elif "Automation" in category or "Script" in category:
        fulfillment_steps = [
            "Break down the client's manual workflow: Source -> Trigger -> Action -> Destination.",
            "Ask Antigravity: 'Write an asynchronous Python script that listens to [webhook/cron] and updates [API] with error handling and retry logic.'",
            "Test with test API keys or sample webhook payloads.",
            "Document environment variables in a `.env.example` file and create a simple `start.bat` runner."
        ]
        tools_recommended = ["Python FastAPI/HTTPX", "Make.com or Zapier", "Antigravity Assistant"]
    else:
        fulfillment_steps = [
            "Provide the project requirements to Antigravity and ask for the minimal working MVP code.",
            "Test locally in your development browser or terminal.",
            "Refine UI or edge cases according to client specifications.",
            "Zip the final code with a clear setup guide."
        ]
        tools_recommended = ["Antigravity Assistant", "VS Code / Python / Node"]

    # 2. Closing scripts & payment handling
    closing_script = (
        "When the client replies:\n"
        "'Awesome! I reviewed the requirements and put together a quick game plan. "
        f"I can deliver the full working solution within {turnaround} for a flat rate of ${budget}. "
        "We can do 50% milestone to kick off and 50% once you review the working demo, "
        "or through an escrow milestone. Does that work for you?'"
    )

    objection_qa = [
        {
            "question": "What if they ask for my past experience or portfolio?",
            "answer": "Don't panic! Say: 'I let my work speak for itself—I've already sketched out the exact workflow for your project and can show you a quick sample or 60-second screen demo today so you know it works before spending a dime.'"
        },
        {
            "question": "How do I take payment safely as a student?",
            "answer": "Use PayPal Invoice, Stripe Payment Link, Wise, or if the client found you on Upwork/Freelancer/Reddit, use their built-in Escrow. Always request 50% upfront deposit before handing over final source code."
        },
        {
            "question": "What if the client has revisions or something bugs out?",
            "answer": "Antigravity is here with you! Just copy the client's error message or feedback back to Antigravity, get the fixed code in 2 minutes, and reply: 'Fixed! Just pushed the updated patch for you.'"
        }
    ]

    return {
        "job_title": title,
        "category": category,
        "difficulty": difficulty,
        "ai_dev_time": ai_time,
        "client_turnaround": turnaround,
        "budget": budget,
        "effective_hourly_rate": job.get("effective_hourly_rate", 250),
        "deliverable": deliverable,
        "why_you_can_win": f"This job pays ${budget} and can be built in about {ai_time} with AI. Clients usually wait days for agencies, but you can deliver a working sample today.",
        "fulfillment_steps": fulfillment_steps,
        "tools_recommended": tools_recommended,
        "closing_script": closing_script,
        "objection_qa": objection_qa
    }
