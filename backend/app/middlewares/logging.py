import time
from collections.abc import Awaitable, Callable

import structlog
from fastapi import Request, Response
from uuid6 import uuid7

logger = structlog.get_logger()


async def logging_middleware(
    request: Request, call_next: Callable[[Request], Awaitable[Response]]
) -> Response:
    request_id = str(uuid7())
    structlog.contextvars.clear_contextvars()
    structlog.contextvars.bind_contextvars(
        request_id=request_id,
        method=request.method,
        path=request.url.path,
    )

    start_time = time.time()
    logger.info("request_started")

    response = await call_next(request)

    process_time = time.time() - start_time
    structlog.contextvars.bind_contextvars(
        status_code=response.status_code,
        duration=round(process_time, 4),
    )
    logger.info("request_finished")

    response.headers["X-Request-ID"] = request_id
    return response
