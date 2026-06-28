from collections.abc import AsyncGenerator

import pytest
from alembic.config import Config
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import StaticPool

from alembic import command
from app.core.database import get_db
from main import create_app

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


def run_alembic_upgrade(connection: Connection) -> None:
    alembic_cfg = Config("alembic.ini")
    alembic_cfg.attributes["connection"] = connection
    command.upgrade(alembic_cfg, "head")


@pytest.fixture(scope="session")
async def test_engine() -> AsyncGenerator[AsyncEngine]:
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async with engine.begin() as conn:
        await conn.run_sync(run_alembic_upgrade)

        await conn.execute(
            text(
                "INSERT INTO currencies (id, code, name) VALUES "
                "(1, 'USD', 'US Dollar'), "
                "(2, 'GBP', 'British Pound'), "
                "(3, 'CAD', 'Canadian Dollar')"
            )
        )
        await conn.execute(
            text(
                "INSERT INTO countries (id, code, name, default_currency_id) VALUES "
                "(1, 'US', 'United States', 1), "
                "(2, 'UK', 'United Kingdom', 2), "
                "(3, 'CA', 'Canada', 3)"
            )
        )
        await conn.execute(
            text(
                "INSERT INTO departments (id, name) VALUES "
                "(1, 'Engineering'), (2, 'Sales'), (3, 'Marketing'), (4, 'HR')"
            )
        )
        await conn.execute(text("INSERT INTO exchange_rates (currency, rate) VALUES ('USD', 1.0)"))
    yield engine


@pytest.fixture
async def db_session(test_engine: AsyncEngine) -> AsyncGenerator[AsyncSession]:
    session_factory = async_sessionmaker(test_engine, expire_on_commit=False)
    async with session_factory() as session:
        yield session
        await session.rollback()


@pytest.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient]:
    app = create_app()
    app.dependency_overrides[get_db] = lambda: db_session
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac
