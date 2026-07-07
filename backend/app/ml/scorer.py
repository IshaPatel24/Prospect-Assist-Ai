"""
Prospect Scoring Engine
Uses XGBoost to score prospects 0-100 for conversion probability.
For demo/prototype: uses a rule-based model with realistic logic.
In production: replace with trained XGBoost model loaded via MLflow.
"""
import random
from typing import List, Tuple

PRODUCT_RULES = {
    "Home Loan":      {"min_income": 400000, "min_score": 650, "min_age": 25, "max_age": 55},
    "Personal Loan":  {"min_income": 250000, "min_score": 600, "min_age": 21, "max_age": 60},
    "Mutual Fund":    {"min_income": 300000, "min_score": 0,   "min_age": 18, "max_age": 65},
    "Fixed Deposit":  {"min_income": 150000, "min_score": 0,   "min_age": 18, "max_age": 70},
    "Credit Card":    {"min_income": 200000, "min_score": 650, "min_age": 21, "max_age": 60},
    "Insurance":      {"min_income": 200000, "min_score": 0,   "min_age": 21, "max_age": 60},
}

def score_prospect(
    age: int,
    income: float,
    credit_score: int,
    existing_products: List[str],
    occupation: str,
    monthly_txn_count: int = 10,
    avg_txn_value: float = 5000,
    bureau_enquiries_6m: int = 1,
    dpd_history: int = 0,
) -> Tuple[float, str, List[str]]:
    """
    Returns (score 0-100, recommended_product, reasons_list)
    """
    score = 0.0
    reasons = []

    # Credit score component (max 30 pts)
    if credit_score >= 750:
        score += 30
        reasons.append(f"Excellent credit score of {credit_score}")
    elif credit_score >= 700:
        score += 22
        reasons.append(f"Good credit score of {credit_score}")
    elif credit_score >= 650:
        score += 14
    elif credit_score >= 600:
        score += 7

    # Income component (max 25 pts)
    if income >= 1200000:
        score += 25
        reasons.append("High income bracket (₹12L+)")
    elif income >= 600000:
        score += 18
        reasons.append("Strong income profile (₹6L+)")
    elif income >= 300000:
        score += 12
    elif income >= 150000:
        score += 6

    # Transaction behaviour (max 20 pts)
    txn_score = min(20, (monthly_txn_count / 30) * 15 + (avg_txn_value / 20000) * 5)
    score += txn_score
    if monthly_txn_count >= 20:
        reasons.append("High transaction activity signals financial engagement")

    # Bureau hygiene (max 15 pts)
    if dpd_history == 0 and bureau_enquiries_6m <= 2:
        score += 15
        reasons.append("Clean repayment history with low credit enquiries")
    elif dpd_history == 0:
        score += 10
    elif dpd_history <= 30:
        score += 5

    # Age & life stage (max 10 pts)
    if 28 <= age <= 45:
        score += 10
        reasons.append("Prime financial decision-making age bracket")
    elif 25 <= age <= 55:
        score += 7
    else:
        score += 3

    # Occupation bonus
    salaried_boost = ["salaried", "government", "psu", "doctor", "engineer", "teacher"]
    if any(o in occupation.lower() for o in salaried_boost):
        score = min(100, score + 5)

    # Penalise existing products (less cross-sell opportunity)
    score = max(0, score - len(existing_products) * 2)

    score = round(min(100, max(0, score)), 1)

    # Recommend best-fit product
    recommended = _recommend_product(income, credit_score, age, existing_products)

    if not reasons:
        reasons = ["Meets baseline eligibility criteria", "Active transaction profile", "Good demographic fit"]

    return score, recommended, reasons[:3]


def _recommend_product(income, credit_score, age, existing_products):
    candidates = []
    for product, rules in PRODUCT_RULES.items():
        if product in existing_products:
            continue
        if (income >= rules["min_income"] and
                credit_score >= rules["min_score"] and
                rules["min_age"] <= age <= rules["max_age"]):
            candidates.append(product)

    priority = ["Home Loan", "Mutual Fund", "Fixed Deposit", "Personal Loan", "Credit Card", "Insurance"]
    for p in priority:
        if p in candidates:
            return p
    return candidates[0] if candidates else "Fixed Deposit"
