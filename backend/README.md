# FactShield AI — Backend

FastAPI REST API with JWT authentication.

## Status

**Phase 1:** Folder created. Full setup in **Phase 3**.

## Planned Stack

- FastAPI
- Uvicorn
- PyMongo / Motor
- Python-JOSE (JWT)
- Passlib (password hashing)
- Pydantic

## Planned Endpoints

| Method | Route        | Description              |
|--------|--------------|--------------------------|
| POST   | /auth/register | User registration      |
| POST   | /auth/login    | User login             |
| POST   | /predict       | Fake news detection    |
| POST   | /verify        | Fact verification      |
| POST   | /summarize     | Article summarization  |
| GET    | /history       | Prediction history     |
| GET    | /dashboard     | Analytics data         |

## Setup (Phase 3)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

API docs: http://localhost:8000/docs
