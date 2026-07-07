from fastapi import APIRouter, HTTPException
from app.models.user import LoginRequest, TokenResponse, User
import hashlib

router = APIRouter()

DEMO_USERS = {
    "isha.patel@idbi.co.in": {"password": "demo123", "name": "Isha Patel", "role": "manager", "branch": "Mumbai Main"},
    "officer@idbi.co.in":    {"password": "demo123",     "name": "Rajesh Kumar", "role": "officer", "branch": "Pune West"},
}

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest):
    user_data = DEMO_USERS.get(req.email)
    if not user_data or user_data["password"] != req.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = hashlib.sha256(f"{req.email}:bugspire:secret".encode()).hexdigest()
    return TokenResponse(
        access_token=token,
        user=User(
            id=req.email,
            name=user_data["name"],
            email=req.email,
            role=user_data["role"],
            branch=user_data["branch"],
        )
    )
