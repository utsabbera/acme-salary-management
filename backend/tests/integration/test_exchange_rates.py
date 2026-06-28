from decimal import Decimal

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.exchange_rate import ExchangeRate

pytestmark = pytest.mark.asyncio


class TestExchangeRates:
    async def test_create_exchange_rate_upserts(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        db_session.add(
            ExchangeRate(
                currency="EUR",
                rate=1.1,
            )
        )
        await db_session.commit()

        response = await client.post(
            "/exchange-rates",
            json={"currency": "EUR", "rate": 1.2},
        )

        assert response.status_code == 200

        stmt = select(ExchangeRate).where(ExchangeRate.currency == "EUR")
        result = await db_session.execute(stmt)
        rates = result.scalars().all()

        assert len(rates) == 1

        assert rates[0].rate == Decimal("1.2")
