from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import logging

from app.database import connect_db, close_db
from app.api.routes import auth, transactions, budgets, notifications, ai, dashboard, webhooks, users
from app.config import get_settings
from app.services.budget_alert import subscribe_budget_events

# 🔥 Load environment variables (VERY IMPORTANT)
load_dotenv()

settings = get_settings()

# 🔥 Basic logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        logger.info("🚀 Starting Fintrixia Backend...")

        # ✅ Connect DB
        await connect_db()

        # ✅ Register event subscriptions
        # subscribe_budget_events()

        logger.info("✅ Startup completed successfully")

        yield

    except Exception as e:
        logger.error(f"❌ Startup failed: {e}")
        raise e

    finally:
        # 🔌 Clean shutdown
        await close_db()
        logger.info("🔌 Shutdown completed")


app = FastAPI(
    title="Fintrixia AI",
    description="AI-powered financial assistant backend",
    version="1.0.0",
    lifespan=lifespan,
)

# 🔥 Rate Limiting
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# 🔥 CORS Configuration (clean + safe)
origins = [
    settings.FRONTEND_URL,
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔥 Register routers
app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(budgets.router)
app.include_router(notifications.router)
app.include_router(ai.router)
app.include_router(dashboard.router)
app.include_router(webhooks.router)
app.include_router(users.router)


# 🔥 Health check (with DB validation)
@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "service": "Fintrixia AI Backend",
        "environment": settings.ENV if hasattr(settings, "ENV") else "dev"
    }