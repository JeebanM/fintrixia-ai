from fastapi import APIRouter, Depends
from app.auth import get_current_user
from app.database import get_db
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary")
async def get_summary(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = current_user["user_id"]
    now = datetime.utcnow()
    this_week = now - timedelta(days=7)
    last_week_start = now - timedelta(days=14)
    month_start = now - timedelta(days=30)

    txns_30d = await db.transactions.find({
        "user_id": user_id, "status": "success",
        "timestamp": {"$gte": month_start}
    }).to_list(20)

    this_week_txns = [t for t in txns_30d if t["timestamp"] >= this_week]
    last_week_txns = [t for t in txns_30d if last_week_start <= t["timestamp"] < this_week]

    total_spend = sum(t["amount"] for t in txns_30d)
    this_week_total = sum(t["amount"] for t in this_week_txns)
    last_week_total = sum(t["amount"] for t in last_week_txns)

    # Budget usage
    budgets = await db.budgets.find({"user_id": user_id}).to_list(20)
    total_limit = sum(b["monthly_limit"] for b in budgets)
    total_spent_budgeted = sum(b["current_spend"] for b in budgets)
    budget_usage_pct = round((total_spent_budgeted / total_limit * 100) if total_limit > 0 else 0, 1)

    # Savings estimate (limit - spend)
    savings = max(0, total_limit - total_spent_budgeted)

    # Trend
    trend_pct = round(((this_week_total - last_week_total) / last_week_total * 100) if last_week_total > 0 else 0, 1)
    trend_direction = "up" if trend_pct > 0 else "down"

    return {
        "total_spend": total_spend,
        "budget_usage_pct": budget_usage_pct,
        "savings": savings,
        "trend_pct": trend_pct,
        "trend_direction": trend_direction,
        "this_week_total": this_week_total,
        "last_week_total": last_week_total,
        "txn_count": len(txns_30d),
    }


@router.get("/category-breakdown")
async def category_breakdown(current_user: dict = Depends(get_current_user)):
    db = get_db()
    txns = await db.transactions.find({
        "user_id": current_user["user_id"],
        "status": "success",
        "timestamp": {"$gte": datetime.utcnow() - timedelta(days=30)}
    }).to_list(20)

    cat_totals = {}
    for t in txns:
        cat = t.get("category", "Others")
        cat_totals[cat] = cat_totals.get(cat, 0) + t["amount"]

    return [{"category": k, "amount": round(v, 2)} for k, v in sorted(cat_totals.items(), key=lambda x: x[1], reverse=True)]


@router.get("/spending-over-time")
async def spending_over_time(current_user: dict = Depends(get_current_user)):
    db = get_db()
    txns = await db.transactions.find({
        "user_id": current_user["user_id"],
        "status": "success",
        "timestamp": {"$gte": datetime.utcnow() - timedelta(days=30)}
    }).to_list(20)

    daily = {}
    for t in txns:
        day = t["timestamp"].strftime("%Y-%m-%d")
        daily[day] = daily.get(day, 0) + t["amount"]

    # Fill missing days with 0
    result = []
    for i in range(29, -1, -1):
        day = (datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d")
        result.append({"date": day, "amount": round(daily.get(day, 0), 2)})

    return result
