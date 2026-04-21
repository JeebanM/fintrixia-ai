from pydantic import BaseModel, Field
from typing import Literal
from datetime import datetime
import uuid

NOTIF_TYPE = Literal["info", "warning", "danger", "success"]


class NotificationInDB(BaseModel):
    notif_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: NOTIF_TYPE = "info"
    title: str
    message: str
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)


class NotificationResponse(NotificationInDB):
    pass
