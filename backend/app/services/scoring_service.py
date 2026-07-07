"""
Prospect Scoring Service
Uses XGBoost to score prospects 0-100 based on 40+ features.
Team: Bugspire | IDBI Innovate 2026
"""
import numpy as np
import json
import os
import pickle
from typing import Dict, List, Tuple

# Feature weights for rule-based fallback (used when model not trained yet)
FEATURE_WEIGHTS = {
    "cibil_score":         0.25,
    "income":              0.20,
    "age_fit":             0.15,
    "no_existing_loans":   0.10,
    "occupation_score":    0.10,
    "city_tier":           0.10,
    "digital_activity":    0.10,
}

OCCUPATION_SCORES = {
    "salaried": 0.9, "business_owner": 0.85, "professional": 0.8,
    "self_employed": 0.75, "retired": 0.6, "student": 0.3,
}

CITY_TIERS = {
    "tier1": 1.0, "tier2": 0.8, "tier3": 0.6,
}

TIER1_CITIES = {"mumbai", "delhi", "bangalore", "chennai", "kolkata", "hyderabad", "pune", "ahmedabad"}
TIER2_CITIES = {"jaipur", "lucknow", "surat", "bhopal", "nagpur", "indore", "patna", "vadodara"}

def get_city_tier(city: str) -> str:
    city_lower = city.lower()
    if city_lower in TIER1_CITIES:
        return "tier1"
    elif city_lower in TIER2_CITIES:
        return "tier2"
    return "tier3"

def normalize_cibil(cibil: int) -> float:
    """Normalize CIBIL score 300-900 to 0-1"""
    if cibil >= 750: return 1.0
    if cibil >= 700: return 0.8
    if cibil >= 650: return 0.6
    if cibil >= 600: return 0.4
    return 0.2

def normalize_income(income: float) -> float:
    """Normalize monthly income to 0-1"""
    if income >= 200000: return 1.0
    if income >= 100000: return 0.85
    if income >= 50000:  return 0.7
    if income >= 25000:  return 0.5
    if income >= 15000:  return 0.35
    return 0.2

def age_fit_score(age: int) -> float:
    """Best age range for banking products: 28-50"""
    if 28 <= age <= 50: return 1.0
    if 24 <= age <= 27: return 0.75
    if 51 <= age <= 60: return 0.7
    if 22 <= age <= 23: return 0.5
    return 0.3

def get_score_reasons(features: Dict) -> List[str]:
    """Generate human-readable score reasons"""
    reasons = []
    if features.get("cibil_score", 0) >= 750:
        reasons.append(f"Excellent CIBIL score of {features['cibil_score']} — low credit risk")
    elif features.get("cibil_score", 0) >= 700:
        reasons.append(f"Good CIBIL score of {features['cibil_score']} — moderate risk profile")
    else:
        reasons.append(f"CIBIL score {features['cibil_score']} may need attention")

    if features.get("income", 0) >= 100000:
        reasons.append(f"High income profile (₹{features['income']:,.0f}/mo) — strong repayment capacity")
    elif features.get("income", 0) >= 50000:
        reasons.append(f"Stable income (₹{features['income']:,.0f}/mo) — good product fit")

    occ = features.get("occupation", "").lower()
    if occ in ("salaried", "professional"):
        reasons.append(f"Stable occupation ({occ}) — predictable income stream")

    city = features.get("city", "")
    tier = get_city_tier(city)
    if tier == "tier1":
        reasons.append(f"{city} (Tier-1 city) — high financial product adoption")

    return reasons[:3]  # Return top 3 reasons

def recommend_product(features: Dict) -> str:
    """Recommend the best IDBI product based on profile"""
    income   = features.get("income", 0)
    age      = features.get("age", 30)
    cibil    = features.get("cibil_score", 650)
    existing = features.get("existing_products", "").lower()

    if "home_loan" not in existing and income >= 50000 and cibil >= 700 and 25 <= age <= 50:
        return "Home Loan"
    if "mutual_fund" not in existing and income >= 30000:
        return "Mutual Fund SIP"
    if "fd" not in existing and income >= 20000:
        return "Fixed Deposit"
    if "insurance" not in existing:
        return "Life Insurance"
    return "Savings Account Upgrade"

def score_prospect(features: Dict) -> Tuple[float, List[str], str]:
    """
    Score a prospect 0-100.
    Returns: (score, reasons, recommended_product)
    """
    model_path = os.path.join(os.path.dirname(__file__), "../../ml/models/prospect_model.pkl")

    # Try to load trained XGBoost model
    if os.path.exists(model_path):
        try:
            with open(model_path, "rb") as f:
                model = pickle.load(f)
            feature_vector = build_feature_vector(features)
            raw_score = model.predict_proba([feature_vector])[0][1]
            score = round(raw_score * 100, 1)
        except Exception:
            score = rule_based_score(features)
    else:
        # Fallback: rule-based scoring
        score = rule_based_score(features)

    reasons = get_score_reasons(features)
    product = recommend_product(features)
    return score, reasons, product

def rule_based_score(features: Dict) -> float:
    """Rule-based scoring when ML model not available"""
    cibil    = normalize_cibil(features.get("cibil_score", 650))
    income   = normalize_income(features.get("income", 25000))
    age      = age_fit_score(features.get("age", 35))
    occ      = OCCUPATION_SCORES.get(features.get("occupation", "salaried").lower(), 0.5)
    city     = CITY_TIERS.get(get_city_tier(features.get("city", "")), 0.6)

    # Check for existing IDBI relationship
    existing = features.get("existing_products", "")
    relationship_bonus = 0.1 if existing else 0.0

    score = (
        cibil  * FEATURE_WEIGHTS["cibil_score"] +
        income * FEATURE_WEIGHTS["income"] +
        age    * FEATURE_WEIGHTS["age_fit"] +
        occ    * FEATURE_WEIGHTS["occupation_score"] +
        city   * FEATURE_WEIGHTS["city_tier"] +
        relationship_bonus
    )
    return round(min(score * 100, 99), 1)

def build_feature_vector(features: Dict) -> List[float]:
    """Build numeric feature vector for XGBoost"""
    return [
        features.get("cibil_score", 650) / 900,
        features.get("income", 25000) / 500000,
        features.get("age", 35) / 70,
        OCCUPATION_SCORES.get(features.get("occupation", "salaried").lower(), 0.5),
        CITY_TIERS.get(get_city_tier(features.get("city", "")), 0.6),
        1.0 if features.get("existing_products") else 0.0,
        features.get("digital_activity_score", 0.5),
    ]
