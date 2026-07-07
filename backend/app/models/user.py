from pydantic import BaseModel
from typing import Optional

class User(BaseModel):
    id: str
    name: str
    email: str
    role: str = "officer"
    branch: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User
