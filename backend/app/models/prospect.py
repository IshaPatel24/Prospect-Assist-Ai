from pydantic import BaseModel, computed_field
from typing import Optional, List
from datetime import datetime

class Prospect(BaseModel):
    id: str
    name: str
    phone: str
    email: Optional[str] = None
    age: int
    income: float
    credit_score: int
    cibil_score: Optional[int] = None   # alias for credit_score in UI
    existing_products: List[str] = []
    location: str
    city: Optional[str] = None          # alias for location — set on model_post_init
    occupation: str
    status: Optional[str] = None        # new / contacted / converted / lost
    prospect_score: Optional[float] = None
    recommended_product: Optional[str] = None
    score_reasons: Optional[List[str]] = None
    created_at: Optional[datetime] = None

    def model_post_init(self, __context):
        # Ensure city and cibil_score aliases are always populated
        if not self.city:
            object.__setattr__(self, 'city', self.location)
        if self.cibil_score is None:
            object.__setattr__(self, 'cibil_score', self.credit_score)

class ProspectScore(BaseModel):
    prospect_id: str
    score: float
    recommended_product: str
    reasons: List[str]
    confidence: float

class ScoreRequest(BaseModel):
    age: int
    income: float
    credit_score: int
    existing_products: List[str]
    occupation: str
    monthly_txn_count: int
    avg_txn_value: float
    bureau_enquiries_6m: int
    dpd_history: int
