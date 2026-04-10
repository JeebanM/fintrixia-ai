from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.services.google_auth import verify_google_token
from app.auth import create_access_token
from app.database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])


class GoogleTokenRequest(BaseModel):
    token: str


@router.post("/google")
async def google_login(body: GoogleTokenRequest):
    user_info = verify_google_token(body.token)
    db = get_db()

    # Upsert user in MongoDB
    existing = await db.users.find_one({"google_id": user_info["google_id"]})
    if existing:
        user_id = str(existing["_id"])
        await db.users.update_one(
            {"_id": existing["_id"]},
            {"$set": {"name": user_info["name"], "picture": user_info["picture"], "email": user_info["email"]}}
        )
    else:
        from datetime import datetime
        result = await db.users.insert_one({
            "google_id": user_info["google_id"],
            "email": user_info["email"],
            "name": user_info["name"],
            "picture": user_info["picture"],
            "avg_daily_spend": 0.0,
            "top_categories": [],
            "frequent_merchants": [],
            "created_at": datetime.utcnow(),
        })
        user_id = str(result.inserted_id)

    token = create_access_token({"sub": user_id, "email": user_info["email"]})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": user_info["email"],
            "name": user_info["name"],
            "picture": user_info["picture"],
        }
    }


@router.get("/me")
async def get_me(current_user: dict = Depends(__import__("app.auth", fromlist=["get_current_user"]).get_current_user)):
    db = get_db()
    from bson import ObjectId
    user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "name": user["name"],
        "picture": user.get("picture"),
    }
