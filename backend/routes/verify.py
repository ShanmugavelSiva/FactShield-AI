"""Fact verification routes."""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Request

from database.connection import get_db
from middleware.rate_limit import limiter
from models.schemas import VerifyRequest, VerifyResponse
from services.verification_service import verify_claim
from utils.auth import get_current_user
from utils.logger import log_activity

router = APIRouter()


@router.post("", response_model=VerifyResponse)
@limiter.limit("20/minute")
async def verify_fact(
    request: Request,
    body: VerifyRequest,
    current_user: dict = Depends(get_current_user),
):
    result = verify_claim(body.claim)

    db = get_db()
    doc = {
        "user_id": current_user["_id"],
        "claim": body.claim,
        "status": result["status"],
        "verification_result": result["verification_result"],
        "sources": result["sources"],
        "created_at": datetime.now(timezone.utc),
    }
    inserted = await db.verifications.insert_one(doc)

    await log_activity(str(current_user["_id"]), "verify", f"Claim verified: {result['status']}")

    return VerifyResponse(
        status=result["status"],
        verification_result=result["verification_result"],
        sources=result["sources"],
        id=str(inserted.inserted_id),
    )


@router.get("/history")
async def verification_history(current_user: dict = Depends(get_current_user)):
    db = get_db()
    cursor = db.verifications.find(
        {"user_id": current_user["_id"]}
    ).sort("created_at", -1).limit(50)

    items = []
    async for doc in cursor:
        items.append({
            "id": str(doc["_id"]),
            "claim": doc["claim"],
            "status": doc["status"],
            "verification_result": doc["verification_result"],
            "created_at": doc["created_at"],
        })

    return {"items": items, "total": len(items)}
