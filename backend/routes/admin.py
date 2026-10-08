"""Admin routes."""
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends

from database.connection import get_db
from models.schemas import SystemStats, UserResponse, ActivityLog
from utils.auth import get_current_admin, user_to_response

router = APIRouter()


@router.get("/stats", response_model=SystemStats)
async def get_system_stats(_admin: dict = Depends(get_current_admin)):
    db = get_db()
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    total_users = await db.users.count_documents({})
    total_predictions = await db.predictions.count_documents({})
    total_verifications = await db.verifications.count_documents({})
    active_today = await db.activity_logs.count_documents({
        "created_at": {"$gte": today_start},
    })

    return SystemStats(
        total_users=total_users,
        total_predictions=total_predictions,
        total_verifications=total_verifications,
        active_today=active_today,
    )


@router.get("/users")
async def get_all_users(_admin: dict = Depends(get_current_admin)):
    db = get_db()
    cursor = db.users.find({}, {"hashed_password": 0}).sort("created_at", -1).limit(100)

    users = []
    async for doc in cursor:
        users.append(user_to_response(doc))

    return {"users": users, "total": len(users)}


@router.get("/activity")
async def get_activity_logs(_admin: dict = Depends(get_current_admin)):
    db = get_db()
    cursor = db.activity_logs.find({}).sort("created_at", -1).limit(50)

    logs = []
    async for doc in cursor:
        logs.append(ActivityLog(
            action=doc["action"],
            details=doc.get("details", ""),
            created_at=doc["created_at"],
        ))

    return {"logs": logs}
