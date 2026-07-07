"""
GenAI Outreach Script Service
Uses OpenAI GPT-4o via LangChain to generate personalised scripts.
Team: Bugspire | IDBI Innovate 2026
"""
import os
from typing import Optional

# Try to import OpenAI — gracefully fall back to template if not available
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", ""))
except ImportError:
    OPENAI_AVAILABLE = False

LANGUAGE_GREETINGS = {
    "hindi":   "नमस्ते",
    "marathi": "नमस्कार",
    "tamil":   "வணக்கம்",
    "english": "Good morning",
}

PRODUCT_HOOKS = {
    "Home Loan":           "home loan at one of our lowest rates this quarter",
    "Mutual Fund SIP":     "SIP plan that can grow your wealth with just ₹500/month",
    "Fixed Deposit":       "Fixed Deposit offering up to 7.5% p.a. — fully secured",
    "Life Insurance":      "life insurance cover that protects your family at minimal cost",
    "Savings Account Upgrade": "premium savings account with zero charges and higher interest",
}

def build_prompt(prospect: dict, script_type: str, language: str) -> str:
    greeting   = LANGUAGE_GREETINGS.get(language.lower(), "Good morning")
    product    = prospect.get("recommended_product", "banking product")
    hook       = PRODUCT_HOOKS.get(product, "exclusive offer")
    score      = prospect.get("prospect_score", 75)
    name       = prospect.get("name", "valued customer")
    income     = prospect.get("income", 0)
    occupation = prospect.get("occupation", "professional")
    city       = prospect.get("city", "")

    return f"""
You are an expert IDBI Bank sales script writer. Generate a {script_type} script in {language}.

Prospect Profile:
- Name: {name}
- Occupation: {occupation}
- Monthly Income: ₹{income:,.0f}
- City: {city}
- Recommended Product: {product}
- AI Prospect Score: {score}/100
- Greeting: {greeting}

Write a warm, professional {script_type} script that:
1. Opens with a personalised greeting using their name
2. Mentions the specific product: {product} ({hook})
3. Gives ONE compelling reason based on their profile (income/occupation)
4. Has a clear, low-pressure call to action
5. Is conversational and under 120 words

Return ONLY the script text, no labels or formatting.
"""

def generate_script_ai(prospect: dict, script_type: str = "call", language: str = "english") -> str:
    """Generate script using OpenAI GPT-4o"""
    if not OPENAI_AVAILABLE or not os.getenv("OPENAI_API_KEY"):
        return generate_template_script(prospect, script_type, language)

    try:
        prompt = build_prompt(prospect, script_type, language)
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an expert Indian bank sales script writer. Be warm, professional and concise."},
                {"role": "user",   "content": prompt}
            ],
            max_tokens=300,
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return generate_template_script(prospect, script_type, language)

def generate_template_script(prospect: dict, script_type: str = "call", language: str = "english") -> str:
    """Fallback template-based script when API not available"""
    name    = prospect.get("name", "Sir/Madam")
    product = prospect.get("recommended_product", "banking product")
    income  = prospect.get("income", 0)
    hook    = PRODUCT_HOOKS.get(product, "exclusive offer")
    greeting = LANGUAGE_GREETINGS.get(language.lower(), "Good morning")

    first_name = name.split()[0]

    if script_type == "call":
        return (
            f"{greeting} {first_name}-ji, I'm calling from IDBI Bank. "
            f"Based on your profile, you qualify for our {hook}. "
            f"Given your income of ₹{income:,.0f}/month, this could be a perfect fit for you. "
            f"It will take just 10 minutes to walk you through the details. "
            f"Would you have some time this week for a quick call?"
        )
    elif script_type == "email":
        return (
            f"Subject: Exclusive {product} Offer for You — IDBI Bank\n\n"
            f"Dear {first_name}-ji,\n\n"
            f"We hope this message finds you well. Based on your financial profile, "
            f"we're pleased to offer you our {hook}.\n\n"
            f"This offer has been personalised keeping your income and goals in mind. "
            f"We'd love to set up a brief call to explain the benefits.\n\n"
            f"Reply to this email or call us at 1800-XXX-XXXX.\n\n"
            f"Warm regards,\nYour IDBI Bank Relationship Manager"
        )
    else:  # whatsapp
        return (
            f"Hi {first_name}-ji 👋 This is your IDBI Bank RM. "
            f"I have a special {product} offer for you — {hook}. "
            f"Interested? Let me know and I'll share full details! 🏦"
        )

def generate_script(prospect: dict, script_type: str = "call", language: str = "english") -> dict:
    """Main entry point — returns script with metadata"""
    content = generate_script_ai(prospect, script_type, language)
    return {
        "prospect_id":   prospect.get("id"),
        "prospect_name": prospect.get("name"),
        "script_type":   script_type,
        "language":      language,
        "product":       prospect.get("recommended_product"),
        "content":       content,
        "generated_by":  "gpt-4o" if OPENAI_AVAILABLE and os.getenv("OPENAI_API_KEY") else "template",
    }
