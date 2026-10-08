"""MongoDB connection manager."""
import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from config.settings import settings

logger = logging.getLogger(__name__)

client: AsyncIOMotorClient | None = None
db: AsyncIOMotorDatabase | None = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.database_name]
    await create_indexes()
    logger.info(f"Connected to MongoDB: {settings.database_name}")


async def close_db():
    global client
    if client:
        client.close()
        logger.info("MongoDB connection closed")


def get_db() -> AsyncIOMotorDatabase:
    if db is None:
        raise RuntimeError("Database not initialized")
    return db


async def create_indexes():
    """Create optimized indexes for all collections."""
    database = get_db()

    await database.users.create_index("email", unique=True)
    await database.users.create_index("username", unique=True)

    await database.predictions.create_index([("user_id", 1), ("created_at", -1)])
    await database.predictions.create_index("prediction")

    await database.verifications.create_index([("user_id", 1), ("created_at", -1)])
    await database.verifications.create_index("status")

    await database.analytics.create_index([("user_id", 1), ("date", -1)])

    await database.notifications.create_index([("user_id", 1), ("read", 1)])

    await database.activity_logs.create_index([("user_id", 1), ("created_at", -1)])

    logger.info("Database indexes created")
