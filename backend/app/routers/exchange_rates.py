from fastapi import APIRouter

from app.core.deps import DbDep
from app.repositories.exchange_rate import ExchangeRateRepository
from app.schemas.exchange_rate import ExchangeRateCreate, ExchangeRateRead

router = APIRouter(prefix="/exchange-rates", tags=["exchange-rates"])


@router.post("", response_model=ExchangeRateRead)
async def create_exchange_rate(
    data: ExchangeRateCreate,
    session: DbDep,
) -> ExchangeRateRead:
    repo = ExchangeRateRepository(session)
    rate = await repo.add_rate(currency=data.currency, rate=data.rate)
    await session.commit()
    return ExchangeRateRead.model_validate(rate)


@router.get("", response_model=list[ExchangeRateRead])
async def get_exchange_rates(
    session: DbDep,
) -> list[ExchangeRateRead]:
    repo = ExchangeRateRepository(session)
    rates = await repo.get_all_rates()
    return [ExchangeRateRead.model_validate(r) for r in rates]
