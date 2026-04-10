from motor.motor_asyncio import AsyncIOMotorClient
from app.config import get_settings
import certifi

settings = get_settings()

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db

    try:
        client = AsyncIOMotorClient(
            settings.MONGO_URI,
            tls=True,
            tlsCAFile=certifi.where()
        )

        db = client.fintrixia

        # 🔥 Ping test (VERY IMPORTANT)
        await client.admin.command("ping")
        print("✅ MongoDB Connected Successfully")

        # Create indexes
        await db.users.create_index("email", unique=True)
        await db.transactions.create_index([("user_id", 1), ("timestamp", -1)])
        await db.transactions.create_index("txn_id", unique=True)
        await db.budgets.create_index([("user_id", 1), ("category", 1)], unique=True)
        await db.notifications.create_index([("user_id", 1), ("created_at", -1)])
        await db.processed_webhooks.create_index(
            "webhook_id",
            unique=True,
            expireAfterSeconds=604800
        )

        print("📊 Indexes created successfully")

    except Exception as e:
        print("❌ MongoDB Connection Failed:", e)
        raise e


async def close_db():
    global client
    if client:
        client.close()
        print("🔌 MongoDB connection closed")


def get_db():
    return db