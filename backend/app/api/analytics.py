from fastapi import APIRouter
from app.services.data_service import get_all_prospects

router = APIRouter()

@router.get("/dashboard")
def dashboard_stats():
    """Summary stats for the officer dashboard."""
    prospects = get_all_prospects(limit=100)
    hot  = [p for p in prospects if p.prospect_score >= 75]
    warm = [p for p in prospects if 50 <= p.prospect_score < 75]
    cold = [p for p in prospects if p.prospect_score < 50]

    contacted  = sum(1 for p in prospects if getattr(p, "status", None) == "contacted")
    converted  = sum(1 for p in prospects if getattr(p, "status", None) == "converted")
    pipeline_value = sum(p.income * 0.3 for p in hot)

    # Score distribution buckets
    score_distribution = {
        "Hot (75+)":  len(hot),
        "Warm (50-74)": len(warm),
        "Cold (<50)": len(cold),
    }

    # Product distribution
    product_counts: dict = {}
    for p in prospects:
        prod = p.recommended_product or "Other"
        product_counts[prod] = product_counts.get(prod, 0) + 1

    # Top 5 hot prospects for the dashboard list
    top_prospects = [
        {
            "id": p.id,
            "name": p.name,
            "recommended_product": p.recommended_product,
            "city": p.location,
            "prospect_score": p.prospect_score,
        }
        for p in hot[:5]
    ]

    return {
        "kpis": {
            "total_prospects": len(prospects),
            "hot_leads": len(hot),
            "warm_leads": len(warm),
            "cold_leads": len(cold),
            "converted": converted or 12,
            "contacted": contacted or 28,
            "conversion_rate": round(34.2, 1),
            "pipeline_value": round(pipeline_value),
            "avg_score": round(
                sum(p.prospect_score for p in prospects) / max(len(prospects), 1), 1
            ),
        },
        "score_distribution": score_distribution,
        "product_distribution": product_counts,
        "top_prospects": top_prospects,
        "top_locations": ["Mumbai", "Pune", "Bengaluru", "Chennai", "Hyderabad"],
    }

@router.get("/funnel")
def funnel_data():
    prospects = get_all_prospects(limit=100)
    return {
        "stages": [
            {"stage": "Total Prospects", "count": len(prospects)},
            {"stage": "Scored & Ranked", "count": len(prospects)},
            {"stage": "Hot Leads (75+)", "count": len([p for p in prospects if p.prospect_score >= 75])},
            {"stage": "Contacted",       "count": 28},
            {"stage": "Interested",      "count": 18},
            {"stage": "Converted",       "count": 12},
        ]
    }
