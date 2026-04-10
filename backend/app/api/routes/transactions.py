from fastapi import APIRouter, Depends, HTTPException, Query
from app.auth import get_current_user
from app.database import get_db
from app.models.transaction import TransactionCreate, TransactionUpdate, TransactionInDB
from app.services.categorizer import categorize
from app.services.budget_alert import check_budget_alerts
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/transactions", tags=["transactions"])


@router.post("", status_code=201)
async def create_transaction(
    body: TransactionCreate,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    category = body.category or categorize(body.merchant, body.notes or "")
    txn = {
        "txn_id": str(uuid.uuid4()),
        "user_id": current_user["user_id"],
        "amount": body.amount,
        "merchant": body.merchant,
        "notes": body.notes,
        "category": category,
        "status": "pending",
        "timestamp": datetime.utcnow(),
    }
    await db.transactions.insert_one(txn)
    txn["id"] = str(txn.pop("_id", ""))
    return txn


@router.get("")
async def list_transactions(
    current_user: dict = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    category: str = Query(None),
    status: str = Query(None),
):
    db = get_db()
    query = {"user_id": current_user["user_id"]}
    if category:
        query["category"] = category
    if status:
        query["status"] = status

    skip = (page - 1) * limit
    cursor = db.transactions.find(query).sort("timestamp", -1).skip(skip).limit(limit)
    txns = await cursor.to_list(limit)
    total = await db.transactions.count_documents(query)

    for t in txns:
        t["id"] = str(t.pop("_id", ""))

    return {"transactions": txns, "total": total, "page": page, "limit": limit}


@router.patch("/{txn_id}")
async def update_transaction(
    txn_id: str,
    body: TransactionUpdate,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    txn = await db.transactions.find_one({"txn_id": txn_id, "user_id": current_user["user_id"]})
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    update_data = {k: v for k, v in body.model_dump().items() if v is not None}
    if update_data:
        await db.transactions.update_one({"txn_id": txn_id}, {"$set": update_data})

    # If confirmed as success, emit event to handle downstream updates decoupled
    if body.status == "success":
        from app.services.event_dispatcher import emit_event
        from fastapi import BackgroundTasks
        # We don't have background tasks in standard dependency here, but we can await it directly or leave it to standard fastAPI execution if emit_event generates a task.
        # emit_event uses asyncio.create_task which is fire-and-forget in the event loop.
        await emit_event(
            "transaction_success", 
            {"user_id": current_user["user_id"], "amount": txn["amount"], "category": txn.get("category", "Others"), "txn_id": txn_id}
        )

    updated = await db.transactions.find_one({"txn_id": txn_id})
    updated["id"] = str(updated.pop("_id", ""))
    return updated


@router.delete("/{txn_id}", status_code=204)
async def delete_transaction(
    txn_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    result = await db.transactions.delete_one({"txn_id": txn_id, "user_id": current_user["user_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Transaction not found")
