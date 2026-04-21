import re
import httpx
from app.config import get_settings
from app.ai.context_builder import get_user_context

settings = get_settings()

RULE_PATTERNS = {
    r"(spend|spent|spending).*(this week|week)": "this_week",
    r"(spend|spent|spending).*(last week)": "last_week",
    r"(spend|spent|spending).*(this month|month)": "this_month",
    r"(compare|vs|versus).*(week)": "compare_weeks",
    r"(top|most|biggest).*(categor|spend)": "top_categories",
    r"(budget|limit)": "budget_status",
    r"(save|saving|cut|reduce)": "savings_tips",
    r"(average|avg|daily)": "daily_avg",
    r"(total|overall|how much)": "total_spend",
}


def route_query(query: str) -> str:
    query_lower = query.lower()
    for pattern, intent in RULE_PATTERNS.items():
        if re.search(pattern, query_lower):
            return intent
    return "llm"


def rule_response(intent: str, ctx: dict) -> str:
    cat = ctx["category_totals"]
    top_cat = sorted(cat, key=cat.get, reverse=True)[0] if cat else "N/A"

    if intent == "this_week":
        return f"You spent ₹{ctx['this_week_total']:,.0f} this week."
    if intent == "last_week":
        return f"You spent ₹{ctx['last_week_total']:,.0f} last week."
    if intent == "this_month":
        return f"Your total spend in the last 30 days is ₹{ctx['total_spend_30d']:,.0f}."
    if intent == "compare_weeks":
        change = ctx["week_change_pct"]
        direction = "more" if change > 0 else "less"
        return f"This week (₹{ctx['this_week_total']:,.0f}) vs last week (₹{ctx['last_week_total']:,.0f}) — you spent {abs(change):.1f}% {direction}."
    if intent == "top_categories":
        top3 = sorted(cat.items(), key=lambda x: x[1], reverse=True)[:3]
        lines = "\n".join([f"• {k}: ₹{v:,.0f}" for k, v in top3])
        return f"Your top spending categories:\n{lines}"
    if intent == "budget_status":
        if not ctx["budget_summary"]:
            return "You haven't set any budgets yet. Go to the Budget page to set limits."
        lines = []
        for cat_name, b in ctx["budget_summary"].items():
            pct = (b["spent"] / b["limit"] * 100) if b["limit"] else 0
            lines.append(f"• {cat_name}: ₹{b['spent']:,.0f} / ₹{b['limit']:,.0f} ({pct:.0f}%)")
        return "Budget status:\n" + "\n".join(lines)
    if intent == "savings_tips":
        if top_cat and cat.get(top_cat, 0) > 0:
            return f"Your biggest expense is {top_cat} at ₹{cat[top_cat]:,.0f}. Consider setting a monthly budget for it to control spending."
        return "Review your top categories and set budgets to keep spending in check."
    if intent == "daily_avg":
        return f"Your average daily spend over the last 30 days is ₹{ctx['avg_daily_spend']:,.2f}."
    if intent == "total_spend":
        return f"Your total spend in the last 30 days is ₹{ctx['total_spend_30d']:,.0f} across {ctx['txn_count_30d']} transactions."
    return None


async def llm_response(query: str, ctx: dict) -> str:
    prompt = f"""You are Fintrixia, an intelligent AI financial assistant. Answer the user's question based on their financial data below.

Financial Summary:
- Total spend (30 days): ₹{ctx['total_spend_30d']:,.0f}
- This week: ₹{ctx['this_week_total']:,.0f} | Last week: ₹{ctx['last_week_total']:,.0f}
- Average daily spend: ₹{ctx['avg_daily_spend']:,.2f}
- Top categories: {', '.join([f"{k}: ₹{v:,.0f}" for k, v in sorted(ctx['category_totals'].items(), key=lambda x: x[1], reverse=True)[:4]])}
- Top merchants: {', '.join(ctx['top_merchants'][:3]) if ctx['top_merchants'] else 'None'}

User question: {query}

Respond concisely (2-4 sentences). Be specific, data-driven, and actionable. Use ₹ for currency."""

    headers = {"Authorization": f"Bearer {settings.HF_API_KEY}"}
    payload = {
        "inputs": prompt,
        "parameters": {"max_new_tokens": 256, "temperature": 0.7, "return_full_text": False},
    }
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"https://api-inference.huggingface.co/models/{settings.HF_MODEL}",
                json=payload,
                headers=headers,
            )
            resp.raise_for_status()
            data = resp.json()
            if isinstance(data, list) and data:
                return data[0].get("generated_text", "").strip()
            return "I couldn't generate a response. Please try again."
    except Exception as e:
        return f"I'm having trouble connecting to the AI model right now. Based on your data: you've spent ₹{ctx['total_spend_30d']:,.0f} in the last 30 days."


async def process_query(user_id: str, query: str) -> dict:
    ctx = await get_user_context(user_id)
    intent = route_query(query)

    if intent != "llm":
        response = rule_response(intent, ctx)
        if response:
            return {"response": response, "source": "rule", "intent": intent}

    response = await llm_response(query, ctx)
    return {"response": response, "source": "llm", "intent": "general"}
