from fastapi import APIRouter
from app.api.prospects import DEMO_PROSPECTS

router = APIRouter()

@router.get("/summary")
def dashboard_summary():
    total      = len(DEMO_PROSPECTS)
    hot_leads  = sum(1 for p in DEMO_PROSPECTS if p.get("prospect_score", 0) >= 80)
    warm_leads = sum(1 for p in DEMO_PROSPECTS if 60 <= p.get("prospect_score", 0) < 80)
    converted  = sum(1 for p in DEMO_PROSPECTS if p.get("status") == "converted")
    contacted  = sum(1 for p in DEMO_PROSPECTS if p.get("status") == "contacted")
    pipeline   = sum(p.get("income", 0) * 12 * 0.3 for p in DEMO_PROSPECTS if p.get("prospect_score", 0) >= 70)

    top_prospects = sorted(
        [p for p in DEMO_PROSPECTS if p.get("status") != "converted"],
        key=lambda x: x.get("prospect_score", 0),
        reverse=True
    )[:5]

    product_dist = {}
    for p in DEMO_PROSPECTS:
        prod = p.get("recommended_product", "Other")
        product_dist[prod] = product_dist.get(prod, 0) + 1

    return {
        "kpis": {
            "total_prospects":  total,
            "hot_leads":        hot_leads,
            "warm_leads":       warm_leads,
            "converted":        converted,
            "contacted":        contacted,
            "pipeline_value":   round(pipeline),
            "conversion_rate":  round((converted / total) * 100, 1) if total > 0 else 0,
        },
        "top_prospects": top_prospects,
        "product_distribution": product_dist,
        "score_distribution": {
            "hot (80-100)":   hot_leads,
            "warm (60-79)":   warm_leads,
            "cold (0-59)":    total - hot_leads - warm_leads,
        }
    }

@router.get("/leaderboard")
def leaderboard():
    """Officer performance leaderboard (demo data)"""
    return {
        "leaderboard": [
            {"officer": "Isha Patel",    "branch": "Mumbai",    "converted": 12, "pipeline": 4200000},
            {"officer": "Rahul Sharma",  "branch": "Delhi",     "converted": 9,  "pipeline": 3100000},
            {"officer": "Divya Menon",   "branch": "Bangalore", "converted": 8,  "pipeline": 2800000},
            {"officer": "Arjun Das",     "branch": "Chennai",   "converted": 7,  "pipeline": 2500000},
            {"officer": "Sneha Kulkarni","branch": "Pune",      "converted": 6,  "pipeline": 2100000},
        ]
    }
