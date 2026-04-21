from fastapi import APIRouter, Depends
from app.auth import get_current_user
from app.database import get_db

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("")
async def list_notifications(current_user: dict = Depends(get_current_user)):
    db = get_db()
    notifs = await db.notifications.find(
        {"user_id": current_user["user_id"]}
    ).sort("created_at", -1).limit(20).to_list(20)
    for n in notifs:
        n["id"] = str(n.pop("_id", ""))
    return notifs


@router.patch("/{notif_id}/read")
async def mark_read(notif_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    await db.notifications.update_one(
        {"notif_id": notif_id, "user_id": current_user["user_id"]},
        {"$set": {"is_read": True}}
    )
    return {"success": True}


@router.delete("/clear", status_code=204)
async def clear_read(current_user: dict = Depends(get_current_user)):
    db = get_db()
    await db.notifications.delete_many(
        {"user_id": current_user["user_id"], "is_read": True}
    )
