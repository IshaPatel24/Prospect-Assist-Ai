from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.prospect import Prospect, ProspectScore, ScoreRequest
from app.services.data_service import get_all_prospects, get_prospect_by_id
from app.ml.scorer import score_prospect

router = APIRouter()

@router.get("/", response_model=List[Prospect])
def list_prospects(
    limit: int = Query(20, le=100),
    min_score: float = Query(0, ge=0, le=100),
):
    """Get ranked list of prospects by AI score."""
    return get_all_prospects(limit=limit, min_score=min_score)

@router.get("/{prospect_id}", response_model=Prospect)
def get_prospect(prospect_id: str):
    """Get a single prospect by ID."""
    p = get_prospect_by_id(prospect_id)
    if not p:
        raise HTTPException(status_code=404, detail="Prospect not found")
    return p

@router.post("/score", response_model=ProspectScore)
def score_new_prospect(req: ScoreRequest):
    """Score a new prospect on-the-fly."""
    score, product, reasons = score_prospect(
        age=req.age, income=req.income, credit_score=req.credit_score,
        existing_products=req.existing_products, occupation=req.occupation,
        monthly_txn_count=req.monthly_txn_count, avg_txn_value=req.avg_txn_value,
        bureau_enquiries_6m=req.bureau_enquiries_6m, dpd_history=req.dpd_history,
    )
    return ProspectScore(
        prospect_id="LIVE",
        score=score,
        recommended_product=product,
        reasons=reasons,
        confidence=round(score / 100, 2),
    )
