from pydantic import BaseModel, Field
from typing import Literal
from datetime import datetime

CATEGORIES = Literal["Food", "Fuel", "Shopping", "Entertainment", "Travel", "Health", "Bills", "Others"]


class BudgetCreate(BaseModel):
    category: CATEGORIES
    monthly_limit: float = Field(..., gt=0)


class BudgetInDB(BaseModel):
    user_id: str
    category: CATEGORIES
    monthly_limit: float
    current_spend: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class BudgetResponse(BudgetInDB):
    usage_percent: float = 0.0
    status: str = "safe"  # safe | warning | danger
