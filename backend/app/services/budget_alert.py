from app.models.notification import NotificationInDB
from datetime import datetime


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
