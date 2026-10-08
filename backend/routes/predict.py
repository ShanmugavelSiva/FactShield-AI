"""Prediction routes."""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from bson import ObjectId

from database.connection import get_db
from middleware.rate_limit import limiter
from models.schemas import PredictRequest, PredictUrlRequest, PredictResponse
from services.ml_service import predict_news
from services.url_service import extract_article_from_url
from utils.auth import get_current_user
from utils.logger import log_activity

router = APIRouter()


@router.post("", response_model=PredictResponse)
@limiter.limit("30/minute")
async def predict(
    request: Request,
    body: PredictRequest,
    current_user: dict = Depends(get_current_user),
):
    result = predict_news(body.news_text)

    db = get_db()
    doc = {
        "user_id": current_user["_id"],
        "news_text": body.news_text[:5000],
        "prediction": result["prediction"],
        "confidence": result["confidence"],
        "keywords": result["keywords"],
        "explanation": result["explanation"],
        "created_at": datetime.now(timezone.utc),
    }
    inserted = await db.predictions.insert_one(doc)

    await _update_analytics(db, current_user["_id"], result["prediction"])
    await log_activity(str(current_user["_id"]), "predict", f"Prediction: {result['prediction']}")

    return PredictResponse(
        prediction=result["prediction"],
        confidence=result["confidence"],
        keywords=result["keywords"],
        explanation=result["explanation"],
        id=str(inserted.inserted_id),
    )


@router.post("/url", response_model=PredictResponse)
@limiter.limit("15/minute")
async def predict_from_url(
    request: Request,
    body: PredictUrlRequest,
    current_user: dict = Depends(get_current_user),
):
    try:
        text = await extract_article_from_url(body.url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to extract article: {str(e)}")

    result = predict_news(text)

    db = get_db()
    doc = {
        "user_id": current_user["_id"],
        "news_text": text[:5000],
        "source_url": body.url,
        "prediction": result["prediction"],
        "confidence": result["confidence"],
        "keywords": result["keywords"],
        "explanation": result["explanation"],
        "created_at": datetime.now(timezone.utc),
    }
    inserted = await db.predictions.insert_one(doc)

    await _update_analytics(db, current_user["_id"], result["prediction"])
    await log_activity(str(current_user["_id"]), "predict_url", f"URL analyzed: {body.url[:100]}")

    return PredictResponse(
        prediction=result["prediction"],
        confidence=result["confidence"],
        keywords=result["keywords"],
        explanation=result["explanation"],
        id=str(inserted.inserted_id),
    )


async def _update_analytics(db, user_id, prediction: str):
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    field = "fake_count" if prediction == "fake" else "real_count"
    await db.analytics.update_one(
        {"user_id": user_id, "date": today},
        {"$inc": {"total": 1, field: 1}},
        upsert=True,
    )
