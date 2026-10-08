"""Prediction history routes."""
from fastapi import APIRouter, Depends, HTTPException

from bson import ObjectId
from database.connection import get_db
from models.schemas import HistoryListResponse, HistoryItem
from utils.auth import get_current_user

router = APIRouter()


@router.get("", response_model=HistoryListResponse)
async def get_history(current_user: dict = Depends(get_current_user)):
    db = get_db()
    cursor = db.predictions.find(
        {"user_id": current_user["_id"]}
    ).sort("created_at", -1).limit(100)

    items = []
    async for doc in cursor:
        items.append(HistoryItem(
            id=str(doc["_id"]),
            news_text=doc.get("news_text", ""),
            prediction=doc["prediction"],
            confidence=doc["confidence"],
            keywords=doc.get("keywords", []),
            explanation=doc.get("explanation", ""),
            created_at=doc["created_at"],
        ))

    total = await db.predictions.count_documents({"user_id": current_user["_id"]})
    return HistoryListResponse(items=items, total=total)


@router.get("/{prediction_id}", response_model=HistoryItem)
async def get_history_item(
    prediction_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    doc = await db.predictions.find_one({
        "_id": ObjectId(prediction_id),
        "user_id": current_user["_id"],
    })
    if not doc:
        raise HTTPException(status_code=404, detail="Prediction not found")

    return HistoryItem(
        id=str(doc["_id"]),
        news_text=doc.get("news_text", ""),
        prediction=doc["prediction"],
        confidence=doc["confidence"],
        keywords=doc.get("keywords", []),
        explanation=doc.get("explanation", ""),
        created_at=doc["created_at"],
    )


@router.delete("/{prediction_id}")
async def delete_history_item(
    prediction_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    result = await db.predictions.delete_one({
        "_id": ObjectId(prediction_id),
        "user_id": current_user["_id"],
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return {"message": "Deleted successfully"}
