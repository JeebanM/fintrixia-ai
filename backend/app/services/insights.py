from datetime import datetime, timedelta
from app.database import get_db


async def get_insights(user_id: str) -> list[dict]:
    db = get_db()
    now = datetime.utcnow()
    this_week = now - timedelta(days=7)
    last_week_start = now - timedelta(days=14)

    txns_30d = await db.transactions.find({
        "user_id": user_id,
        "status": "success",
        "timestamp": {"$gte": now - timedelta(days=30)}
    }).to_list(500)

    this_week_txns = [t for t in txns_30d if t["timestamp"] >= this_week]
    last_week_txns = [t for t in txns_30d if last_week_start <= t["timestamp"] < this_week]

    this_week_total = sum(t["amount"] for t in this_week_txns)
    last_week_total = sum(t["amount"] for t in last_week_txns)
    avg_daily = sum(t["amount"] for t in txns_30d) / 30

    insights = []

    # Weekly comparison
    if last_week_total > 0:
        pct = ((this_week_total - last_week_total) / last_week_total) * 100
        if pct > 20:
            insights.append({
                "type": "warning",
                "icon": "📈",
                "message": f"Spending up {pct:.0f}% this week vs last week",
                "detail": f"₹{this_week_total:,.0f} this week vs ₹{last_week_total:,.0f} last week"
            })
        elif pct < -10:
            insights.append({
                "type": "success",
                "icon": "📉",
                "message": f"Great! Spending down {abs(pct):.0f}% this week",
                "detail": f"You saved ₹{last_week_total - this_week_total:,.0f} compared to last week"
            })

    # Anomaly detection: single txn > 3x daily avg
    for t in this_week_txns:
        if t["amount"] > avg_daily * 3:
            insights.append({
                "type": "warning",
                "icon": "⚠️",
                "message": f"Large transaction detected at {t['merchant']}",
                "detail": f"₹{t['amount']:,.0f} — {t['amount'] / avg_daily:.1f}× your daily average"
            })
            break

    # Budget overspend detection
    budgets = await db.budgets.find({"user_id": user_id}).to_list(20)
    for b in budgets:
        if b["monthly_limit"] > 0:
            pct = (b["current_spend"] / b["monthly_limit"]) * 100
            if pct >= 100:
                insights.append({
                    "type": "danger",
                    "icon": "🔴",
                    "message": f"Budget exceeded for {b['category']}",
                    "detail": f"Spent ₹{b['current_spend']:,.0f} of ₹{b['monthly_limit']:,.0f} limit"
                })
            elif pct >= 80:
                insights.append({
                    "type": "warning",
                    "icon": "🟡",
                    "message": f"{b['category']} budget at {pct:.0f}%",
                    "detail": f"₹{b['monthly_limit'] - b['current_spend']:,.0f} remaining"
                })

    # Top category insight
    cat_totals = {}
    for t in txns_30d:
        cat_totals[t.get("category", "Others")] = cat_totals.get(t.get("category", "Others"), 0) + t["amount"]

    if cat_totals:
        top_cat, top_val = max(cat_totals.items(), key=lambda x: x[1])
        total = sum(cat_totals.values())
        pct = (top_val / total * 100) if total else 0
        if pct > 40:
            insights.append({
                "type": "info",
                "icon": "💡",
                "message": f"{top_cat} is {pct:.0f}% of your spending",
                "detail": f"₹{top_val:,.0f} out of ₹{total:,.0f} total"
            })

    return insights[:4]  # Max 4 insights


async def get_recommendations(user_id: str) -> list[dict]:
    db = get_db()
    txns = await db.transactions.find({
        "user_id": user_id,
        "status": "success",
        "timestamp": {"$gte": datetime.utcnow() - timedelta(days=30)}
    }).to_list(500)

    cat_totals = {}
    for t in txns:
        cat = t.get("category", "Others")
        cat_totals[cat] = cat_totals.get(cat, 0) + t["amount"]

    recs = []

    # Recommend reducing top 2 categories
    top_cats = sorted(cat_totals.items(), key=lambda x: x[1], reverse=True)[:2]
    for cat, amount in top_cats:
        recs.append({
            "action": f"Set a budget for {cat}",
            "category": cat,
            "impact": f"Reducing {cat} by 20% saves ₹{amount * 0.2:,.0f}/month",
            "priority": "high"
        })

    # Flag if no budgets set
    budget_count = await db.budgets.count_documents({"user_id": user_id})
    if budget_count == 0:
        recs.append({
            "action": "Set up category budgets",
            "category": "All",
            "impact": "Budgets help you stay on track and get alerts before overspending",
            "priority": "high"
        })

    return recs
