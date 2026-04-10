from app.models.notification import NotificationInDB
from datetime import datetime
from app.database import get_db
from app.services.event_dispatcher import dispatcher
from loguru import logger

async def check_budget_alerts(user_id: str, category: str, db):
    """Check budget thresholds and create notifications."""
    budget = await db.budgets.find_one({"user_id": user_id, "category": category})
    if not budget or budget["monthly_limit"] == 0:
        return

    pct = (budget["current_spend"] / budget["monthly_limit"]) * 100

    notif = None
    if pct >= 100:
        notif = {
            "notif_id": __import__("uuid").uuid4().__str__(),
            "user_id": user_id,
            "type": "danger",
            "title": f"Budget Exceeded: {category}",
            "message": f"You've exceeded your {category} budget of ₹{budget['monthly_limit']:,.0f}!",
            "is_read": False,
            "created_at": datetime.utcnow(),
        }
    elif pct >= 80:
        notif = {
            "notif_id": __import__("uuid").uuid4().__str__(),
            "user_id": user_id,
            "type": "warning",
            "title": f"Budget Warning: {category}",
            "message": f"You've used {pct:.0f}% of your {category} budget.",
            "is_read": False,
            "created_at": datetime.utcnow(),
        }

    if notif:
        # Avoid duplicate notifications (same type today)
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0)
        existing = await db.notifications.find_one({
            "user_id": user_id,
            "title": notif["title"],
            "created_at": {"$gte": today_start}
        })
        if not existing:
            await db.notifications.insert_one(notif)


async def on_transaction_success(payload: dict):
    """Event listener for successful transactions to update budget actuals."""
    user_id = payload.get("user_id")
    category = payload.get("category", "Others")
    amount = payload.get("amount", 0)
    
    if not user_id or amount <= 0:
        return

    db = get_db()
    
    try:
        # Advance the spent budget
        await db.budgets.update_one(
            {"user_id": user_id, "category": category},
            {"$inc": {"current_spend": amount}},
        )
        # Check alerts
        await check_budget_alerts(user_id, category, db)
        logger.info(f"Successfully processed budget update for User: {user_id}, Category: {category}")
    except Exception as e:
        logger.error(f"Failed to update budget for txn payload {payload}: {str(e)}")


def subscribe_budget_events():
    """Register budget events to the global dispatcher."""
    dispatcher.subscribe("transaction_success", on_transaction_success)

