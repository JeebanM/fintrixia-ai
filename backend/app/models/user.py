from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    name: str
    picture: Optional[str] = None


class UserCreate(UserBase):
    google_id: str


class UserInDB(UserBase):
    id: str
    google_id: str
    avg_daily_spend: float = 0.0
    top_categories: list[str] = []
    frequent_merchants: list[str] = []
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None
