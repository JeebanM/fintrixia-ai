import hmac
import hashlib
from datetime import datetime
from fastapi import APIRouter, Request, HTTPException, BackgroundTasks, Header
from app.database import get_db
from app.services.event_dispatcher import emit_event
import os
from typing import Optional
from loguru import logger
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])

def verify_signature(payload: bytes, signature: str, secret: str) -> bool:
    """Verifies HMAC SHA256 signature for secure webhooks."""
    if not secret:
        return False
    expected = hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)

@router.post("/upi")
@limiter.limit("100/minute")
async def upi_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    x_webhook_signature: str = Header(None),
    x_webhook_timestamp: str = Header(None)
):
    """
    Secure endpoint to receive UPI transaction statuses (simulate Gateway).
    """
    payload_body = await request.body()
    
    # 1. Security Check & Replay Protection
    if x_webhook_timestamp:
        try:
            ts = int(x_webhook_timestamp)
            if abs(datetime.utcnow().timestamp() - ts) > 300: # 5 minutes expiry
                logger.warning("Webhook replay logic triggered. Timestamp too old or disconnected from reality.")
                raise HTTPException(status_code=400, detail="Webhook timestamp expired")
        except ValueError:
            pass
            
    secret = os.getenv("WEBHOOK_SECRET")
    if not secret:
        logger.error("WEBHOOK_SECRET not configured on backend.")
        raise HTTPException(status_code=500, detail="Server misconfiguration")

    if not x_webhook_signature or not verify_signature(payload_body, x_webhook_signature, secret):
        logger.warning("Unverified webhook attempt.")
        raise HTTPException(status_code=401, detail="Invalid signature")

    try:
        data = json.loads(payload_body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    webhook_id = data.get("webhook_id")
    txn_id = data.get("txn_id")
    new_status = data.get("status")

    if not txn_id or not new_status:
        raise HTTPException(status_code=400, detail="Missing txn_id or status")

    logger.info(f"Webhook received for txn {txn_id} with status {new_status} (webhook_id: {webhook_id})")

    db = get_db()
    
    # Check Replay Protection (Optional but good practice if webhook_id provided)
    if webhook_id:
        processed = await db.processed_webhooks.find_one({"webhook_id": webhook_id})
        if processed:
            logger.info("Webhook already processed via replay protection.")
            return {"message": "Already processed", "status": "ignored"}

    # 2. Find Transaction
    txn = await db.transactions.find_one({"txn_id": txn_id})
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # 3. Idempotency Check
    if txn.get("status") == "success" and new_status == "success":
        logger.info(f"Idempotency hit: txn {txn_id} is already success.")
        return {"message": "Already processed"}

    # 4. Update Status (Transaction Logic)
    if new_status in ["success", "failed"]:
        await db.transactions.update_one(
            {"txn_id": txn_id},
            {"$set": {"status": new_status}}
        )
        txn["status"] = new_status
        logger.info(f"Transaction {txn_id} updated to {new_status}")

        # 5. Emit Event (Decoupled Logic)
        if new_status == "success":
            background_tasks.add_task(
                emit_event, 
                "transaction_success", 
                {"user_id": txn["user_id"], "amount": txn["amount"], "category": txn.get("category", "Others"), "txn_id": txn_id}
            )

    # Store Webhook ID for replay protection
    if webhook_id:
        await db.processed_webhooks.insert_one({"webhook_id": webhook_id})

    return {"message": "Webhook processed successfully"}
