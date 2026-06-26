import time
from collections.abc import Awaitable, Callable

import structlog
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from uuid6 import uuid7

from app.core.config import settings
from app.core.logger import setup_logging
from app.routers import employees, health

setup_logging()

logger = structlog.get_logger()


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version="0.1.0",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.middleware("http")
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

    app.include_router(health.router, tags=["health"])
    app.include_router(employees.router)

    return app


app = create_app()
