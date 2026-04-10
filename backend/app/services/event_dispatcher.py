from loguru import logger
from arq import create_pool
from app.worker import redis_settings

class RedisEventDispatcher:
    """
    Hybrid Event Dispatcher:
    - Durable events via Redis (ARQ)
    - Local in-memory subscribers (backward compatibility)
    """

    def __init__(self):
        self._redis = None
        self._subscribers = {}  # 🔥 local event handlers

    async def init_redis(self):
        if not self._redis:
            self._redis = await create_pool(redis_settings)
            logger.info("✅ Connected to Redis ARQ Pool")

    async def close(self):
        if self._redis:
            await self._redis.close()

    # =========================
    # 🔥 LOCAL SUBSCRIBE SYSTEM
    # =========================
    def subscribe(self, event_name: str, handler):
        """Register local event handler (backward compatibility)"""
        if event_name not in self._subscribers:
            self._subscribers[event_name] = []
        self._subscribers[event_name].append(handler)
        logger.info(f"📡 Subscribed handler to event: {event_name}")

    async def _notify_local(self, event_name: str, payload: dict):
        """Trigger local subscribers"""
        handlers = self._subscribers.get(event_name, [])
        for handler in handlers:
            try:
                await handler(payload)
            except Exception as e:
                logger.error(f"❌ Error in local handler: {e}")

    # =========================
    # 🚀 EMIT EVENT
    # =========================
    async def emit(self, event_name: str, payload: dict):
        """Emit event (both local + Redis durable queue)"""
        await self.init_redis()

        logger.info(f"🚀 Dispatching event: {event_name} | Payload: {payload}")

        # 🔥 1. Trigger local handlers (optional)
        await self._notify_local(event_name, payload)

        # 🔥 2. Send to Redis queue (durable processing)
        if event_name == "transaction_success":
            # await self._redis.enqueue_job("process_transaction_success", payload)
        # else:
            logger.warning(f"⚠️ Unknown event emitted: {event_name}")


# 🔥 Global instance
dispatcher = RedisEventDispatcher()


# 🔥 Backward compatible helper
async def emit_event(event_name: str, payload: dict):
    await dispatcher.emit(event_name, payload)