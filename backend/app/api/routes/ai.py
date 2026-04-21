from fastapi import APIRouter, Depends
from app.auth import get_current_user
from app.database import get_db
from app.ai.orchestrator import process_query
from app.services.insights import get_insights, get_recommendations
from pydantic import BaseModel
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/ai", tags=["ai"])


class QueryRequest(BaseModel):
    query: str


@router.post("/query")
async def ai_query(body: QueryRequest, current_user: dict = Depends(get_current_user)):
    result = await process_query(current_user["user_id"], body.query)
    return result


@router.get("/insights")
async def insights(current_user: dict = Depends(get_current_user)):
    return await get_insights(current_user["user_id"])


@router.get("/recommendations")
async def recommendations(current_user: dict = Depends(get_current_user)):
    return await get_recommendations(current_user["user_id"])
