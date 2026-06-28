from collections.abc import Sequence

from fastapi import APIRouter
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.deps import DbDep
from app.models.reference import Country, Currency, Department
from app.schemas.reference import CountryRead, CurrencyRead, DepartmentRead

router = APIRouter(tags=["reference"])


@router.get("/departments", response_model=list[DepartmentRead])
async def get_departments(session: DbDep) -> Sequence[Department]:
    stmt = select(Department).order_by(Department.name)
    result = await session.execute(stmt)
    return result.scalars().all()


@router.get("/currencies", response_model=list[CurrencyRead])
async def get_currencies(session: DbDep) -> Sequence[Currency]:
    stmt = select(Currency).order_by(Currency.code)
    result = await session.execute(stmt)
    return result.scalars().all()


@router.get("/countries", response_model=list[CountryRead])
async def get_countries(session: DbDep) -> Sequence[Country]:
    stmt = select(Country).options(selectinload(Country.default_currency)).order_by(Country.name)
    result = await session.execute(stmt)
    return result.scalars().all()
