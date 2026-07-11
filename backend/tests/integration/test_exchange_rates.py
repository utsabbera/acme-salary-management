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


class TestGetExchangeRates:
    async def test_get_exchange_rates_includes_seed(self, client: AsyncClient) -> None:
        response = await client.get("/exchange-rates")
        assert response.status_code == 200
        data = response.json()
        currencies = {item["currency"]: item["rate"] for item in data}
        assert "USD" in currencies
        assert currencies["USD"] == 1.0

    async def test_get_exchange_rates_multiple(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        db_session.add_all(
            [
                ExchangeRate(currency="CAD", rate=Decimal("1.35")),
                ExchangeRate(currency="JPY", rate=Decimal("150.0")),
            ]
        )
        await db_session.commit()

        response = await client.get("/exchange-rates")
        assert response.status_code == 200
        data = response.json()
        currencies = {item["currency"]: item["rate"] for item in data}
        assert currencies["CAD"] == 1.35
        assert currencies["JPY"] == 150.0
        assert currencies["USD"] == 1.0
