from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
import uuid


CATEGORIES = Literal["Food", "Fuel", "Shopping", "Entertainment", "Travel", "Health", "Bills", "Others"]
STATUS = Literal["pending", "success", "failed"]


class TransactionCreate(BaseModel):
    amount: float = Field(..., gt=0, description="Amount in INR")
    merchant: str = Field(..., min_length=1, max_length=100)
    notes: Optional[str] = None
    category: Optional[CATEGORIES] = None  # Auto-assigned if not provided


class TransactionUpdate(BaseModel):
    status: Optional[STATUS] = None
    category: Optional[CATEGORIES] = None


class TransactionInDB(BaseModel):
    txn_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    amount: float
    merchant: str
    notes: Optional[str] = None
    category: CATEGORIES = "Others"
    status: STATUS = "pending"
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class TransactionResponse(TransactionInDB):
    pass
