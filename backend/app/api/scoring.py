from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.scoring_service import score_prospect

router = APIRouter()

class ScoreRequest(BaseModel):
    name:              str
    age:               int
    income:            float
    occupation:        str
    city:              str
    cibil_score:       int
    existing_products: Optional[str] = ""
    digital_activity_score: Optional[float] = 0.5

@router.post("/score")
def score(req: ScoreRequest):
    features = req.dict()
    score_val, reasons, product = score_prospect(features)
    return {
        "prospect_score":       score_val,
        "score_band":           "Hot" if score_val >= 80 else "Warm" if score_val >= 60 else "Cold",
        "score_reasons":        reasons,
        "recommended_product":  product,
        "priority":             "high" if score_val >= 80 else "medium" if score_val >= 60 else "low",
    }

@router.post("/batch-score")
def batch_score(prospects: list):
    results = []
    for p in prospects:
        score_val, reasons, product = score_prospect(p)
        results.append({
            "id": p.get("id"),
            "prospect_score": score_val,
            "recommended_product": product,
        })
    return sorted(results, key=lambda x: x["prospect_score"], reverse=True)
