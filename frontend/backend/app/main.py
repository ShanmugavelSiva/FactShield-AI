from pathlib import Path
import re

import joblib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline


# =========================================================
# App
# =========================================================

app = FastAPI(title="FactShield AI")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# Paths
# =========================================================

BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = BASE_DIR / "ml_model" / "fake_news_model.pkl"
VECTORIZER_PATH = BASE_DIR / "ml_model" / "tfidf_vectorizer.pkl"


# =========================================================
# Load Fake News ML Model
# =========================================================

print("Loading Fake News Detection model...")

model = joblib.load(MODEL_PATH)
vectorizer = joblib.load(VECTORIZER_PATH)

print("Fake News Detection model loaded successfully.")


# =========================================================
# Load Summarization Model Lazily
# =========================================================

summarizer = None


def get_summarizer():
    global summarizer

    if summarizer is None:
        print("Loading AI summarization model...")

        summarizer = pipeline(
            "summarization",
            model="sshleifer/distilbart-cnn-12-6"
        )

        print("AI summarization model loaded.")

    return summarizer


# =========================================================
# Text Cleaning
# =========================================================

def clean_text(text: str) -> str:
    text = str(text).lower()

    text = re.sub(
        r"http\S+|www\S+|https\S+",
        " ",
        text
    )

    text = re.sub(
        r"[^a-zA-Z\s]",
        " ",
        text
    )

    text = re.sub(
        r"\s+",
        " ",
        text
    ).strip()

    return text


# =========================================================
# Home
# =========================================================

@app.get("/")
def home():
    return {
        "message": "FactShield AI Backend Running"
    }


# =========================================================
# Dashboard
# =========================================================

@app.get("/dashboard/stats")
def dashboard_stats():
    return {
        "total_users": 125,
        "total_predictions": 890,
        "total_verifications": 450,
        "active_today": 34
    }


@app.get("/dashboard/charts")
def dashboard_charts():
    return {
        "fake": 40,
        "real": 60
    }


# =========================================================
# REAL FAKE NEWS PREDICTION
# =========================================================

@app.post("/predict")
def predict(data: dict):

    news_text = data.get("news_text", "").strip()

    if not news_text:
        return {
            "prediction": "UNKNOWN",
            "confidence": 0.0,
            "news_text": "",
            "explanation": "Please enter a news article or claim."
        }

    # Clean user input
    cleaned_text = clean_text(news_text)

    # Convert text into TF-IDF features
    features = vectorizer.transform([cleaned_text])

    # Prediction
    prediction_value = int(model.predict(features)[0])

    # Probability
    probabilities = model.predict_proba(features)[0]

    fake_probability = float(probabilities[0])
    real_probability = float(probabilities[1])

    if prediction_value == 0:
        prediction = "FAKE"
        confidence = fake_probability

        explanation = (
            "The machine learning model identified patterns in the "
            "article that are more similar to the fake-news examples "
            "used during training."
        )
    else:
        prediction = "REAL"
        confidence = real_probability

        explanation = (
            "The machine learning model identified patterns in the "
            "article that are more similar to the real-news examples "
            "used during training."
        )

    # Simple keyword extraction
    words = cleaned_text.split()

    stop_words = {
        "the", "is", "a", "an", "and", "or",
        "of", "to", "in", "on", "for", "with",
        "this", "that", "was", "were", "are",
        "be", "by", "as", "from", "at", "it"
    }

    keywords = []

    for word in words:
        if (
            len(word) >= 5
            and word not in stop_words
            and word not in keywords
        ):
            keywords.append(word)

        if len(keywords) >= 8:
            break

    return {
        "prediction": prediction,
        "confidence": confidence,
        "news_text": news_text,
        "fake_probability": fake_probability,
        "real_probability": real_probability,
        "explanation": explanation,
        "keywords": keywords
    }


# =========================================================
# URL Prediction
# =========================================================

@app.post("/predict/url")
def predict_url(data: dict):
    url = data.get("url", "").strip()

    if not url:
        return {
            "prediction": "UNKNOWN",
            "confidence": 0.0,
            "url": "",
            "explanation": "Please enter a valid news URL."
        }

    return {
        "prediction": "REAL",
        "confidence": 0.50,
        "url": url,
        "explanation": (
            "URL-based article extraction has not been connected yet. "
            "Please use the text analysis feature for ML prediction."
        ),
        "keywords": []
    }


# =========================================================
# Fact Verification
# =========================================================

@app.post("/verify")
def verify(data: dict):
    claim = data.get("claim", "").strip()

    return {
        "claim": claim,
        "result": "Verified",
        "confidence": 0.95
    }


@app.get("/verify/history")
def verify_history():
    return {
        "items": []
    }


# =========================================================
# AI Summarizer
# =========================================================

@app.post("/summarize")
def summarize(data: dict):

    text = data.get("text", "").strip()

    if not text:
        return {
            "summary": "No text provided"
        }

    # Very short text does not need summarization
    if len(text.split()) < 25:
        return {
            "summary": text
        }

    model_pipeline = get_summarizer()

    result = model_pipeline(
        text[:4000],
        max_length=100,
        min_length=25,
        do_sample=False
    )

    return {
        "summary": result[0]["summary_text"]
    }


# =========================================================
# Prediction History
# =========================================================

@app.get("/history")
def history():
    return {
        "items": [
            {
                "id": 1,
                "news_text": "Sample real news article",
                "prediction": "REAL",
                "confidence": 0.94,
                "created_at": "2026-08-25T10:00:00"
            },
            {
                "id": 2,
                "news_text": "Sample fake news article",
                "prediction": "FAKE",
                "confidence": 0.87,
                "created_at": "2026-08-25T11:00:00"
            }
        ]
    }


@app.get("/history/{prediction_id}")
def history_by_id(prediction_id: int):
    return {
        "id": prediction_id,
        "news_text": "Sample article",
        "prediction": "REAL",
        "confidence": 0.94,
        "created_at": "2026-08-25T10:00:00"
    }


@app.delete("/history/{prediction_id}")
def delete_history(prediction_id: int):
    return {
        "message": "Prediction deleted",
        "id": prediction_id
    }


# =========================================================
# Admin
# =========================================================

@app.get("/admin/stats")
def admin_stats():
    return {
        "total_users": 125,
        "total_predictions": 890,
        "total_verifications": 450,
        "active_today": 34
    }


@app.get("/admin/users")
def admin_users():
    return {
        "users": [
            {
                "id": 1,
                "username": "sam",
                "role": "admin",
                "created_at": "2026-08-25T10:00:00"
            },
            {
                "id": 2,
                "username": "testuser",
                "role": "user",
                "created_at": "2026-08-24T15:30:00"
            }
        ]
    }


@app.get("/admin/activity")
def admin_activity():
    return {
        "logs": [
            {
                "action": "Login",
                "details": "Admin logged in",
                "created_at": "2026-08-25T10:30:00"
            },
            {
                "action": "Prediction",
                "details": "Fake news prediction executed",
                "created_at": "2026-08-25T11:00:00"
            }
        ]
    }