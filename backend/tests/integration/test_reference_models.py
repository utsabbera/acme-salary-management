import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.reference import Country, Currency, Department

pytestmark = pytest.mark.asyncio


class TestReferenceModels:
    async def test_create_and_read_reference_data(self, db_session: AsyncSession) -> None:
        # Create Currency
        currency = Currency(code="EUR", name="Euro")
        db_session.add(currency)
        await db_session.flush()

        # Create Country
        country = Country(code="FR", name="France", default_currency_id=currency.id)
        db_session.add(country)

        # Create Department
        dept = Department(name="IT")
        db_session.add(dept)

        await db_session.commit()

        # Verify reading
        stmt = select(Country).where(Country.code == "FR")
        result = await db_session.execute(stmt)
        saved_country = result.scalar_one()

        assert saved_country.name == "France"
        assert saved_country.default_currency.code == "EUR"
