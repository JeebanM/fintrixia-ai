from fastapi import APIRouter, Depends, HTTPException
from app.auth import get_current_user
from app.database import get_db
from app.models.budget import BudgetCreate
from datetime import datetime

router = APIRouter(prefix="/api/budgets", tags=["budgets"])


@router.post("", status_code=201)
async def create_or_update_budget(
    body: BudgetCreate,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    now = datetime.utcnow()
    result = await db.budgets.find_one_and_update(
        {"user_id": current_user["user_id"], "category": body.category},
        {"$set": {"monthly_limit": body.monthly_limit, "updated_at": now},
         "$setOnInsert": {"current_spend": 0.0, "created_at": now, "user_id": current_user["user_id"], "category": body.category}},
        upsert=True,
        return_document=True
    )
    if result:
        result["id"] = str(result.pop("_id", ""))
    return result


@router.get("")
async def list_budgets(current_user: dict = Depends(get_current_user)):
    db = get_db()
    budgets = await db.budgets.find({"user_id": current_user["user_id"]}).to_list(50)
    result = []
    for b in budgets:
        b["id"] = str(b.pop("_id", ""))
        pct = (b["current_spend"] / b["monthly_limit"] * 100) if b.get("monthly_limit", 0) > 0 else 0
        b["usage_percent"] = round(pct, 1)
        b["status"] = "danger" if pct >= 100 else "warning" if pct >= 80 else "safe"
        result.append(b)
    return result


@router.delete("/{category}", status_code=204)
async def delete_budget(
    category: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    res = await db.budgets.delete_one({"user_id": current_user["user_id"], "category": category})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Budget not found")
