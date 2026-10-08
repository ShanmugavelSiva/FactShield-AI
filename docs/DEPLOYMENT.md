# FactShield AI — Deployment Guide

## Architecture Overview

```
┌─────────────┐     HTTPS      ┌──────────────┐     HTTPS     ┌─────────────────┐
│   Vercel    │ ──────────────▶│    Render    │──────────────▶│  MongoDB Atlas  │
│  (Frontend) │                │   (Backend)  │               │   (Database)    │
│  React/Vite │                │   FastAPI    │               │                 │
└─────────────┘                └──────────────┘               └─────────────────┘
```

---

## 1. MongoDB Atlas

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a **free M0 cluster**
3. **Database Access** → Add user with password
4. **Network Access** → Allow `0.0.0.0/0`
5. **Connect** → Get connection string:

```
mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

---

## 2. Backend — Render

### Option A: render.yaml (Recommended)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New → Blueprint
3. Connect your repo — Render reads `backend/render.yaml`

### Option B: Manual Setup

1. New → Web Service → Connect GitHub repo
2. Settings:
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app:app --host 0.0.0.0 --port $PORT`

3. Environment Variables:

| Key | Value |
|-----|-------|
| `MONGODB_URL` | Your Atlas connection string |
| `DATABASE_NAME` | `factshield` |
| `SECRET_KEY` | Random 64-char string |
| `FRONTEND_URL` | Your Vercel URL |
| `PYTHON_VERSION` | `3.11.0` |

4. Deploy → Copy your Render URL: `https://factshield-api.onrender.com`

### ML Model on Render

Upload trained model files (`classifier.pkl`, `vectorizer.pkl`) to the repo in `ml_model/model/` before deploying, OR train locally and commit the `.pkl` files.

> Note: For large models, consider cloud storage (S3) in production.

---

## 3. Frontend — Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your repo
4. Settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. Environment Variables:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://factshield-api.onrender.com` |

6. Deploy → Your app is live at `https://factshield-ai.vercel.app`

---

## 4. Post-Deployment Verification

```bash
# Backend health
curl https://factshield-api.onrender.com/health

# Register test user
curl -X POST https://factshield-api.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123","full_name":"Test User"}'
```

Frontend checklist:
- [ ] Home page loads
- [ ] Register/Login works
- [ ] Analyze news returns prediction
- [ ] Dashboard shows charts
- [ ] Dark mode toggles

---

## 5. Production Security Checklist

- [ ] Change `SECRET_KEY` to a strong random value
- [ ] Restrict MongoDB Atlas IP whitelist
- [ ] Set specific CORS origins (not `*`)
- [ ] Enable HTTPS everywhere
- [ ] Review rate limits
- [ ] Never commit `.env` files

---

## 6. Local Development

```bash
# Terminal 1 — MongoDB (if local)
brew services start mongodb-community

# Terminal 2 — Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app:app --reload --port 8000

# Terminal 3 — Frontend
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open: http://localhost:5173
