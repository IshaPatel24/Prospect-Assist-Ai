"""
Mock data service simulating CBS + CRM + CIBIL data fusion.
In production: replace with real DB queries and API calls.
"""
import random
from typing import List, Optional
from app.models.prospect import Prospect
from app.ml.scorer import score_prospect

# Seed for reproducibility
random.seed(42)

NAMES = ["Rajan Mehta","Priya Sharma","Vikram Tiwari","Anita Desai","Suresh Nair",
         "Kavita Joshi","Amit Verma","Sunita Rao","Rajesh Gupta","Pooja Iyer",
         "Manoj Kumar","Deepa Singh","Arun Pillai","Neha Agarwal","Sanjay Patil",
         "Meena Krishnan","Rohit Bhatia","Lakshmi Reddy","Sunil Chandra","Archana Mishra"]

OCCUPATIONS = ["Salaried Engineer","Government Employee","Doctor","Teacher","PSU Officer",
                "Self-Employed","Business Owner","Retired Government","IT Professional","CA/Lawyer"]

LOCATIONS = ["Mumbai","Pune","Bengaluru","Chennai","Hyderabad","Ahmedabad","Kolkata","Delhi","Nagpur","Jaipur"]

PRODUCTS = ["Savings Account","Current Account","Fixed Deposit","Home Loan","Personal Loan",
            "Mutual Fund","Credit Card","Insurance","Demat Account"]

_CACHE: List[Prospect] = []

def _generate_prospects(n=50) -> List[Prospect]:
    prospects = []
    for i in range(n):
        name = NAMES[i % len(NAMES)] + (" Jr." if i >= len(NAMES) else "")
        age = random.randint(24, 62)
        income = random.choice([180000,240000,360000,480000,600000,720000,900000,1200000,1500000])
        credit_score = random.randint(580, 800)
        existing = random.sample(PRODUCTS[:5], random.randint(1, 3))
        monthly_txn = random.randint(5, 35)
        avg_txn = random.choice([2000,5000,8000,12000,20000,35000])
        enquiries = random.randint(0, 5)
        dpd = random.choice([0,0,0,0,30,60])
        occupation = OCCUPATIONS[i % len(OCCUPATIONS)]

        score, product, reasons = score_prospect(
            age=age, income=income, credit_score=credit_score,
            existing_products=existing, occupation=occupation,
            monthly_txn_count=monthly_txn, avg_txn_value=avg_txn,
            bureau_enquiries_6m=enquiries, dpd_history=dpd,
        )

        prospects.append(Prospect(
            id=f"PROS{1000+i}",
            name=name,
            phone=f"+91 98{random.randint(10000000,99999999)}",
            email=f"{name.split()[0].lower()}.{name.split()[-1].lower()}@email.com",
            age=age,
            income=income,
            credit_score=credit_score,
            existing_products=existing,
            location=LOCATIONS[i % len(LOCATIONS)],
            occupation=occupation,
            prospect_score=score,
            recommended_product=product,
            score_reasons=reasons,
        ))
    return sorted(prospects, key=lambda p: p.prospect_score, reverse=True)

def get_all_prospects(limit: int = 20, min_score: float = 0) -> List[Prospect]:
    global _CACHE
    if not _CACHE:
        _CACHE = _generate_prospects(50)
    return [p for p in _CACHE if p.prospect_score >= min_score][:limit]

def get_prospect_by_id(prospect_id: str) -> Optional[Prospect]:
    all_p = get_all_prospects(limit=100)
    return next((p for p in all_p if p.id == prospect_id), None)
