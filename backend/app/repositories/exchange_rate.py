from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.exchange_rate import ExchangeRate


class ExchangeRateRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def add_rate(self, currency: str, rate: float) -> ExchangeRate:
        stmt = select(ExchangeRate).where(ExchangeRate.currency == currency)
        result = await self._session.execute(stmt)
        rate_obj = result.scalar_one_or_none()

        if rate_obj:
            rate_obj.rate = rate
        else:
            rate_obj = ExchangeRate(currency=currency, rate=rate)
            self._session.add(rate_obj)

        await self._session.flush()
        return rate_obj
