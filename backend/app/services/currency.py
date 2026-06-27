from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.exchange_rate import ExchangeRate


async def convert_to_usd(amount: Decimal, currency: str, session: AsyncSession) -> Decimal:
    """
    Convert a given amount in a specific currency to USD.
    Returns the usd_amount.
    Raises ValueError if the currency is not supported.
    """
    stmt = select(ExchangeRate).where(
        ExchangeRate.currency == currency.upper(), ExchangeRate.valid_to.is_(None)
    )
    result = await session.execute(stmt)
    rate_record = result.scalar_one_or_none()

    if not rate_record:
        raise ValueError(f"Unsupported currency: {currency}")

    return (amount * Decimal(str(rate_record.rate))).quantize(Decimal("0.01"))
