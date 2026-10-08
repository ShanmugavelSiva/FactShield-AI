"""Activity logging utility."""
from datetime import datetime, timezone

from database.connection import get_db


async def log_activity(user_id: str, action: str, details: str = ""):
    db = get_db()
    from bson import ObjectId
    await db.activity_logs.insert_one({
        "user_id": ObjectId(user_id),
        "action": action,
        "details": details,
        "created_at": datetime.now(timezone.utc),
    })
