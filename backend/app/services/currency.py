from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.exchange_rate import ExchangeRate


async def convert_to_usd(
    amount_minor_units: int, currency: str, session: AsyncSession
) -> tuple[int, int]:
    """
    Convert a given amount in a specific currency to USD minor units.
    Returns (usd_amount_minor_units, exchange_rate_id).
    Raises ValueError if the currency is not supported.
    """
    stmt = select(ExchangeRate).where(
        ExchangeRate.currency == currency.upper(), ExchangeRate.valid_to.is_(None)
    )
    result = await session.execute(stmt)
    rate_record = result.scalar_one_or_none()

    if not rate_record:
        raise ValueError(f"Unsupported currency: {currency}")

    return int(amount_minor_units * rate_record.rate), rate_record.id
