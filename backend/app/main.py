from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import prospects, auth, outreach, analytics

app = FastAPI(
    title="Prospect Assist AI",
    description="AI-powered sales co-pilot for IDBI Bank",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(prospects.router, prefix="/api/prospects", tags=["Prospects"])
app.include_router(outreach.router, prefix="/api/outreach", tags=["Outreach"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])

@app.get("/")
def root():
    return {"message": "Prospect Assist AI API", "team": "Bugspire", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "ok"}
