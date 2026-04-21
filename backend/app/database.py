from motor.motor_asyncio import AsyncIOMotorClient
from app.config import get_settings

settings = get_settings()

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client.fintrixia
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.transactions.create_index([("user_id", 1), ("timestamp", -1)])
    await db.budgets.create_index([("user_id", 1), ("category", 1)], unique=True)
    await db.notifications.create_index([("user_id", 1), ("created_at", -1)])
    print("✅ Connected to MongoDB Atlas")


async def close_db():
    global client
    if client:
        client.close()
        print("🔌 MongoDB connection closed")


def get_db():
    return db
