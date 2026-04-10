from datetime import datetime, timedelta
from app.database import get_db

async def get_user_context(user_id: str) -> dict:
    """Build financial context for AI orchestrator securely and efficiently."""
    db = get_db()
    now = datetime.utcnow()
    thirty_days_ago = now - timedelta(days=30)
    ninety_days_ago = now - timedelta(days=90)
    seven_days_ago = now - timedelta(days=7)
    fourteen_days_ago = now - timedelta(days=14)

    # 1. Fetch Transactions (Token Opt: Enforce 100 limit max)
    cursor = db.transactions.find({
        "user_id": user_id,
        "status": "success",
        "timestamp": {"$gte": ninety_days_ago}
    }).sort("timestamp", -1).limit(100)
    txns = await cursor.to_list(100)

    # Filter temporal structures
    txns_30d = [t for t in txns if t["timestamp"] >= thirty_days_ago]
    txns_90d = txns  # All fetched are within 90 days

    # 2. Category Aggregations
    category_totals_30d = {}
    for t in txns_30d:
        cat = t.get("category", "Others")
        category_totals_30d[cat] = category_totals_30d.get(cat, 0) + t["amount"]

    # 3. Weekly Trajectory
    this_week_txns = [t for t in txns if t["timestamp"] >= seven_days_ago]
    last_week_txns = [t for t in txns if fourteen_days_ago <= t["timestamp"] < seven_days_ago]
    
    this_week_total = sum(t["amount"] for t in this_week_txns)
    last_week_total = sum(t["amount"] for t in last_week_txns)

    # 4. Day of Week Patterns
    dow_map = {0: "Monday", 1: "Tuesday", 2: "Wednesday", 3: "Thursday", 4: "Friday", 5: "Saturday", 6: "Sunday"}
    dow_spend = {day: 0.0 for day in dow_map.values()}
    for t in txns_90d:
        day_str = dow_map[t["timestamp"].weekday()]
        dow_spend[day_str] += t["amount"]
        
    highest_spend_day = max(dow_spend, key=dow_spend.get) if any(dow_spend.values()) else "N/A"

    # 5. Top Merchants
    merchant_counts = {}
    for t in txns_30d:
        m = t.get("merchant", "Unknown")
        merchant_counts[m] = merchant_counts.get(m, 0) + 1
    top_merchants = sorted(merchant_counts, key=merchant_counts.get, reverse=True)[:5]

    # 6. Budget & Anomalies
    budgets = await db.budgets.find({"user_id": user_id}).to_list(50)
    budget_summary = {b["category"]: {"limit": b["monthly_limit"], "spent": b["current_spend"]} for b in budgets}
    
    anomalies = []
    for cat, total in category_totals_30d.items():
        if cat in budget_summary and total > budget_summary[cat]["limit"] * 1.5:
            anomalies.append(f"Spending in {cat} is 50%+ over budget constraints.")

    total_spend_30d = sum(t["amount"] for t in txns_30d)
    total_spend_90d = sum(t["amount"] for t in txns_90d)

    return {
        "metrics": {
            "total_spend_30d": total_spend_30d,
            "total_spend_90d": total_spend_90d,
            "this_week_total": this_week_total,
            "last_week_total": last_week_total,
            "week_change_pct": round(((this_week_total - last_week_total) / last_week_total * 100) if last_week_total else 0, 1),
            "txn_count_included": len(txns_90d),
            "highest_spend_day": highest_spend_day
        },
        "category_totals_30d": category_totals_30d,
        "top_merchants": top_merchants,
        "budget_summary": budget_summary,
        "anomalies": anomalies,
    }
