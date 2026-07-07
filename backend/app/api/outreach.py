from fastapi import APIRouter, HTTPException
from app.models.outreach import OutreachRequest, OutreachScript
from app.services.genai_service import generate_script
from app.services.data_service import get_prospect_by_id

router = APIRouter()

@router.post("/generate", response_model=OutreachScript)
def generate_outreach(req: OutreachRequest):
    """Generate a personalised outreach script for a prospect."""
    result = generate_script(
        prospect_name=req.prospect_name,
        credit_score=req.credit_score,
        income=req.income,
        recommended_product=req.recommended_product,
        language=req.language,
        officer_name=req.officer_name,
    )
    return OutreachScript(prospect_id=req.prospect_id, **result)

@router.get("/generate/{prospect_id}", response_model=OutreachScript)
def generate_outreach_for_prospect(prospect_id: str, language: str = "english"):
    """Generate outreach script directly from prospect ID."""
    p = get_prospect_by_id(prospect_id)
    if not p:
        raise HTTPException(status_code=404, detail="Prospect not found")
    result = generate_script(
        prospect_name=p.name,
        credit_score=p.credit_score,
        income=p.income,
        recommended_product=p.recommended_product or "Fixed Deposit",
        language=language,
    )
    return OutreachScript(prospect_id=prospect_id, **result)
