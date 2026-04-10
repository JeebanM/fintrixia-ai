from fastapi import APIRouter, Depends, HTTPException
from app.auth import get_current_user
from app.database import get_db
from app.models.user import UserResponse, UserPreferences
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/user", tags=["users"])

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    preferences: Optional[UserPreferences] = None

@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Retrieve the current user's profile and preferences."""
    db = get_db()
    user = await db.users.find_one({"id": current_user["user_id"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Map to schema
    return UserResponse(**user)


@router.patch("/profile", response_model=UserResponse)
async def update_profile(
    body: UserProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update user profile defaults and preferences."""
    db = get_db()
    user = await db.users.find_one({"id": current_user["user_id"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = {}
    if body.name is not None:
        update_data["name"] = body.name
        
    if body.preferences is not None:
        update_data["preferences"] = body.preferences.model_dump()
        
    if update_data:
        await db.users.update_one(
            {"id": current_user["user_id"]},
            {"$set": update_data}
        )

    updated_user = await db.users.find_one({"id": current_user["user_id"]})
    return UserResponse(**updated_user)
