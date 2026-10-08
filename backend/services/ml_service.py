"""ML prediction service with explainable AI."""
import logging
import os
from pathlib import Path

import joblib
import numpy as np

from config.settings import settings

logger = logging.getLogger(__name__)

_model = None
_vectorizer = None


def _get_model_paths():
    base = Path(__file__).resolve().parent.parent / settings.ml_model_path
    return base / "classifier.pkl", base / "vectorizer.pkl"


def load_ml_models():
    global _model, _vectorizer
    model_path, vectorizer_path = _get_model_paths()

    if not model_path.exists() or not vectorizer_path.exists():
        logger.warning("ML model files not found. Run ml_model/train.py first.")
        return False

    _model = joblib.load(model_path)
    _vectorizer = joblib.load(vectorizer_path)
    logger.info("ML models loaded successfully")
    return True


def predict_news(text: str) -> dict:
    if _model is None or _vectorizer is None:
        if not load_ml_models():
            return _fallback_predict(text)

    from services.preprocessing import preprocess_text
    cleaned = preprocess_text(text)
    features = _vectorizer.transform([cleaned])

    prediction_proba = _model.predict_proba(features)[0]
    prediction_idx = int(np.argmax(prediction_proba))
    confidence = float(prediction_proba[prediction_idx])
    label = "real" if prediction_idx == 1 else "fake"

    keywords = _extract_keywords(features, prediction_idx)
    explanation = _generate_explanation(label, keywords, confidence)

    return {
        "prediction": label,
        "confidence": confidence,
        "keywords": keywords,
        "explanation": explanation,
    }


def _extract_keywords(features, prediction_idx: int, top_n: int = 8) -> list:
    if _model is None or _vectorizer is None:
        return []

    feature_names = _vectorizer.get_feature_names_out()
    coefficients = _model.coef_[0]

    if prediction_idx == 1:
        top_indices = np.argsort(coefficients)[-top_n:][::-1]
    else:
        top_indices = np.argsort(coefficients)[:top_n]

    feature_array = features.toarray()[0]
    keywords = []
    for idx in top_indices:
        if feature_array[idx] > 0:
            keywords.append({
                "word": feature_names[idx],
                "influence": float(coefficients[idx]),
            })

    return keywords[:top_n]


def _generate_explanation(label: str, keywords: list, confidence: float) -> str:
    conf_pct = confidence * 100
    if not keywords:
        return f"This article is classified as {label.upper()} with {conf_pct:.1f}% confidence based on linguistic patterns."

    top_words = [kw["word"] for kw in keywords[:5]]
    words_str = ", ".join(top_words)

    if label == "fake":
        return (
            f"Classified as FAKE with {conf_pct:.1f}% confidence. "
            f"Suspicious language patterns detected. Key influential words: {words_str}. "
            f"These terms are commonly associated with misleading or sensationalized content."
        )
    return (
        f"Classified as REAL with {conf_pct:.1f}% confidence. "
        f"The article uses language patterns consistent with credible journalism. "
        f"Key supporting terms: {words_str}."
    )


def _fallback_predict(text: str) -> dict:
    """Rule-based fallback when ML model is not trained yet."""
    fake_indicators = [
        "breaking", "shocking", "secret", "miracle", "they don't want you to know",
        "click here", "you won't believe", "exclusive", "bombshell", " leaked ",
        "conspiracy", "hoax", "fake news", "viral", "share this",
    ]
    text_lower = text.lower()
    fake_score = sum(1 for w in fake_indicators if w in text_lower)
    total_words = len(text.split())
    fake_ratio = fake_score / max(total_words / 50, 1)

    if fake_ratio > 0.5:
        label, confidence = "fake", min(0.65 + fake_ratio * 0.1, 0.92)
        keywords = [{"word": w.strip(), "influence": -0.5} for w in fake_indicators if w in text_lower][:5]
    else:
        label, confidence = "real", min(0.70 + (1 - fake_ratio) * 0.1, 0.95)
        keywords = []

    explanation = _generate_explanation(label, keywords, confidence)
    return {
        "prediction": label,
        "confidence": confidence,
        "keywords": keywords,
        "explanation": explanation + " (Using fallback heuristic — train ML model for accurate results)",
    }
