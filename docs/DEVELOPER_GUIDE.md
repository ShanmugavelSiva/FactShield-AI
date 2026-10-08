# FactShield AI — Developer Guide

## Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB 6+ (local or Atlas)
- VS Code with Python, ESLint, Tailwind extensions

## Project Structure

```
fakenews detection/
├── frontend/                 # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # Auth & Theme providers
│   │   ├── pages/            # Route pages
│   │   ├── services/         # API client (Axios)
│   │   └── config/           # Environment config
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # FastAPI
│   ├── app.py                # Entry point
│   ├── config/               # Settings (Pydantic)
│   ├── routes/               # API route handlers
│   ├── models/               # Pydantic schemas
│   ├── services/             # Business logic + ML
│   ├── database/             # MongoDB connection
│   ├── middleware/           # Rate limiting
│   ├── utils/                # Auth helpers, logging
│   └── tests/                # pytest tests
│
├── ml_model/                 # Machine Learning
│   ├── preprocessing.py      # Text cleaning
│   ├── train.py              # Model training
│   ├── predict.py            # CLI prediction
│   ├── data/                 # Training CSV files
│   └── model/                # Saved .pkl files
│
├── database/                 # Schema documentation
└── docs/                     # Project documentation
```

## Setup

### 1. Clone & Environment

```bash
cd "fakenews detection"

# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

# Frontend
cd ../frontend
npm install
cp .env.example .env

# ML Model
cd ../ml_model
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python generate_sample_data.py
python train.py
```

### 2. Run Development Servers

```bash
# Terminal 1 — Backend (from backend/)
source venv/bin/activate
uvicorn app:app --reload --port 8000

# Terminal 2 — Frontend (from frontend/)
npm run dev
```

### 3. Run Tests

```bash
# Backend
cd backend && pytest -v

# Frontend
cd frontend && npm test
```

## Adding New Features

### New API Endpoint

1. Define schema in `backend/models/schemas.py`
2. Create service logic in `backend/services/`
3. Add route in `backend/routes/`
4. Register router in `backend/app.py`
5. Add frontend service in `frontend/src/services/index.js`
6. Create/update page component

### New Frontend Page

1. Create page in `frontend/src/pages/`
2. Add route in `frontend/src/App.jsx`
3. Add nav link in `frontend/src/components/layout/Navbar.jsx`

## Code Conventions

| Area | Convention |
|------|-----------|
| Python | snake_case, type hints, async/await |
| React | PascalCase components, camelCase functions |
| CSS | Tailwind utility classes, `.card`, `.btn-primary` |
| API | RESTful, JSON, JWT Bearer auth |
| Git | Conventional commits (`feat:`, `fix:`, `docs:`) |

## Environment Variables

See `backend/.env.example` and `frontend/.env.example`.

## ML Pipeline

```
CSV Data → preprocessing.py → TF-IDF Vectorizer → Logistic Regression → .pkl files
```

Retrain after adding new data:
```bash
cd ml_model && python train.py
```

Evaluation reports saved to `ml_model/reports/`.
