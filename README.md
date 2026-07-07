# 🚀 Prospect Assist AI
**Team: Bugspire | Team Leader: Isha Patel**
**IDBI Innovate Hackathon 2026 — Problem Statement 2: Prospect Assist AI**

---

## What is this?
An AI-powered sales co-pilot for IDBI Bank field officers that:
- **Scores** prospects 0–100 using ML (XGBoost) across 40+ features
- **Ranks** leads by conversion probability in real-time
- **Generates** personalised outreach scripts via GenAI (GPT-4o)
- **Unifies** CBS, CRM, CIBIL, and bureau data in one dashboard

---

## Tech Stack
| Layer | Tech |
|---|---|
| ML Scoring | Python, XGBoost, Scikit-learn, SHAP |
| GenAI Engine | OpenAI GPT-4o, LangChain |
| Backend API | FastAPI, PostgreSQL, Redis |
| Frontend | React.js, React Router |
| DevOps | Docker, Docker Compose |

---

## Quick Start

### Option 1: Docker (Recommended)
```bash
cp backend/.env.example backend/.env
# Add your OPENAI_API_KEY to backend/.env (optional — works without it using templates)
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Option 2: Manual

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

---

## Demo Login
| Email | Password | Role |
|---|---|---|
| isha.patel@idbi.co.in | bugspire123 | Manager |
| officer@idbi.co.in | demo123 | Field Officer |

---

## API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/prospects/ | List all scored prospects |
| GET | /api/prospects/{id} | Get prospect details |
| POST | /api/prospects/score | Score a new prospect live |
| GET | /api/outreach/generate/{id} | Generate AI script |
| GET | /api/analytics/dashboard | Dashboard KPIs |
| POST | /api/auth/login | Login |

API Docs: http://localhost:8000/docs

---

## Project Structure
```
prospect-assist-ai/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app entry point
│   │   ├── api/             # Route handlers
│   │   ├── models/          # Pydantic models
│   │   ├── services/        # Business logic
│   │   └── ml/              # Scoring engine
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── pages/           # Dashboard, Prospects, Outreach
│       ├── components/      # Shared UI components
│       └── utils/api.js     # API client
├── ml/
│   └── train_model.py       # XGBoost training script
└── docker-compose.yml
```

---

## Built with ❤️ by Bugspire
