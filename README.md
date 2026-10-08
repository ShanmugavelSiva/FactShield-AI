# FactShield AI

An AI-powered Fake News Detection and Fact Verification Platform.

## Project Structure

```
fakenews detection/
├── frontend/          # React + Vite + Tailwind CSS
├── backend/           # FastAPI + JWT Authentication
├── ml_model/          # Scikit-Learn ML Pipeline
├── database/          # MongoDB schemas & seed scripts
└── README.md
```

## Prerequisites

Install these before starting:

| Tool       | Version  | Download                                      |
|------------|----------|-----------------------------------------------|
| Node.js    | 18+      | https://nodejs.org                            |
| Python     | 3.10+    | https://python.org                            |
| MongoDB    | 6+       | https://mongodb.com/try/download/community    |
| VS Code    | Latest   | https://code.visualstudio.com                 |

### Recommended VS Code Extensions

- **Python** (Microsoft)
- **Pylance** (Microsoft)
- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **MongoDB for VS Code**

## Quick Start (After All Phases)

```bash
# Terminal 1 — Backend
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev

# Terminal 3 — Train ML Model (one-time)
cd ml_model
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python train.py
```

## Development Phases

| Phase | Topic                    | Status      |
|-------|--------------------------|-------------|
| 1     | Project Setup            | ✅ Complete |
| 2     | Frontend Setup           | Pending     |
| 3     | Backend Setup            | Pending     |
| 4     | MongoDB Integration      | Pending     |
| 5     | Machine Learning Model   | Pending     |
| 6     | Connect ML with FastAPI  | Pending     |
| 7     | Explainable AI           | Pending     |
| 8     | Fact Verification        | Pending     |
| 9     | News Summarization       | Pending     |
| 10    | Dashboard                | Pending     |
| 11    | Prediction History       | Pending     |
| 12    | Final Deployment         | Pending     |

## License

MIT — Portfolio / Educational Use
