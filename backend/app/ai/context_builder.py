from datetime import datetime, timedelta
from app.database import get_db
from bson import ObjectId


async def get_user_context(user_id: str) -> dict:
    """Build financial context for AI orchestrator."""
    db = get_db()
    now = datetime.utcnow()
    thirty_days_ago = now - timedelta(days=30)
    seven_days_ago = now - timedelta(days=7)
    fourteen_days_ago = now - timedelta(days=14)

    # All transactions last 30 days
    txns = await db.transactions.find({
        "user_id": user_id,
        "timestamp": {"$gte": thirty_days_ago},
        "status": "success"
    }).to_list(500)

    # Category totals (30 days)
    category_totals = {}
    for t in txns:
        cat = t.get("category", "Others")
        category_totals[cat] = category_totals.get(cat, 0) + t["amount"]

    # This week vs last week
    this_week_txns = [t for t in txns if t["timestamp"] >= seven_days_ago]
    last_week_txns = [t for t in txns if fourteen_days_ago <= t["timestamp"] < seven_days_ago]

    this_week_total = sum(t["amount"] for t in this_week_txns)
    last_week_total = sum(t["amount"] for t in last_week_txns)

    # Top merchants
    merchant_counts = {}
    for t in txns:
        m = t.get("merchant", "Unknown")
        merchant_counts[m] = merchant_counts.get(m, 0) + 1
    top_merchants = sorted(merchant_counts, key=merchant_counts.get, reverse=True)[:5]

    # Budgets
    budgets = await db.budgets.find({"user_id": user_id}).to_list(50)
    budget_summary = {b["category"]: {"limit": b["monthly_limit"], "spent": b["current_spend"]} for b in budgets}

    return {
        "total_spend_30d": sum(t["amount"] for t in txns),
        "category_totals": category_totals,
        "this_week_total": this_week_total,
        "last_week_total": last_week_total,
        "week_change_pct": round(((this_week_total - last_week_total) / last_week_total * 100) if last_week_total else 0, 1),
        "top_merchants": top_merchants,
        "budget_summary": budget_summary,
        "txn_count_30d": len(txns),
        "avg_daily_spend": round(sum(t["amount"] for t in txns) / 30, 2),
    }
