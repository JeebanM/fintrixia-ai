import asyncio
from loguru import logger
from arq import create_pool
from arq.connections import RedisSettings
from app.database import get_db
import os

# To match standard deployments, defaulting to localhost:6379 unless specified
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# Parse redis url properly for arq
from urllib.parse import urlparse
try:
    parsed = urlparse(REDIS_URL)
    redis_settings = RedisSettings(host=parsed.hostname or 'localhost', port=parsed.port or 6379)
except Exception:
    redis_settings = RedisSettings()

async def process_transaction_success(ctx, event_payload: dict):
    """
    Decoupled task handler for transaction_success.
    This routes cleanly to the budget service or other subsystems.
    """
    user_id = event_payload.get("user_id")
    txn_id = event_payload.get("txn_id")
    
    logger.info(f"Worker Processing transaction_success for {txn_id} (user: {user_id})")
    
    # Import locally to avoid circular dependencies in the worker
    from app.services.budget_alert import process_budget_alert_for_transaction
    
    try:
        await process_budget_alert_for_transaction(event_payload)
        logger.info(f"Worker Successfully handled budget logic for txn {txn_id}")
    except Exception as e:
        logger.error(f"Worker task failed: {e}")
        raise e

async def on_job_end(ctx, job_id, result):
    # Optional DLQ (Dead Letter Queue) hook.
    # Currently ARQ handles local retries automatically based on Worker settings.
    pass

class WorkerSettings:
    """
    Settings specifically for ARQ CLI to utilize.
    Run via `arq app.worker.WorkerSettings`
    """
    functions = [process_transaction_success]
    redis_settings = redis_settings
    # Auto retry mechanism: Will retry 3 times before finally moving to DLQ (if handled)
    max_tries = 3
    on_job_end = on_job_end
