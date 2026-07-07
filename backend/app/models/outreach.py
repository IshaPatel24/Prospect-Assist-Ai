from pydantic import BaseModel
from typing import Optional

class OutreachRequest(BaseModel):
    prospect_id: str
    prospect_name: str
    credit_score: int
    income: float
    recommended_product: str
    language: str = "english"
    officer_name: str = "our representative"

class OutreachScript(BaseModel):
    prospect_id: str
    opening: str
    hook: str
    objection_handler: str
    cta: str
    email_subject: str
    email_body: str
    language: str
