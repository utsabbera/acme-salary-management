import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.employee import Employee
from app.models.exchange_rate import ExchangeRate
from app.models.reference import Country, Currency, Department
from app.models.salary import Salary
from scripts.seed.employee import seed_employees
from scripts.seed.fx import seed_fx
from scripts.seed.reference import seed_reference


@pytest.mark.asyncio
class TestSeedScripts:
    async def test_seed_scripts_with_samples(self, db_session: AsyncSession) -> None:
        countries_csv = "scripts/seed/samples/countries.csv"
        departments_csv = "scripts/seed/samples/departments.csv"
        fx_csv = "scripts/seed/samples/fx.csv"
        employee_csv = "scripts/seed/samples/employee.csv"

        await seed_reference(countries_csv, departments_csv, verbose=False, session=db_session)

        countries = (await db_session.execute(select(Country))).scalars().all()
        assert len(countries) > 0

        departments = (await db_session.execute(select(Department))).scalars().all()
        assert len(departments) > 0

        currencies = (await db_session.execute(select(Currency))).scalars().all()
        assert len(currencies) > 0

        await seed_fx(fx_csv, verbose=False, session=db_session)

        rates = (await db_session.execute(select(ExchangeRate))).scalars().all()
        assert len(rates) > 0

        await seed_employees(
            csv_path=employee_csv, random_flag=False, verbose=False, session=db_session
        )

        employees = (await db_session.execute(select(Employee))).scalars().all()
        assert len(employees) > 0

        salaries = (await db_session.execute(select(Salary))).scalars().all()
        assert len(salaries) > 0

        alice = (
            await db_session.execute(
                select(Employee).where(Employee.email == "alice.smith@acme.com")
            )
        ).scalar_one_or_none()
        assert alice is not None
        assert alice.first_name == "Alice"

    async def test_seed_employees_random(self, db_session: AsyncSession) -> None:
        countries_csv = "scripts/seed/samples/countries.csv"
        departments_csv = "scripts/seed/samples/departments.csv"
        fx_csv = "scripts/seed/samples/fx.csv"

        await seed_reference(countries_csv, departments_csv, verbose=False, session=db_session)
        await seed_fx(fx_csv, verbose=False, session=db_session)

        await seed_employees(
            csv_path=None, random_flag=True, count=5, verbose=False, session=db_session
        )

        employees = (await db_session.execute(select(Employee))).scalars().all()
        assert len(employees) == 5

        salaries = (await db_session.execute(select(Salary))).scalars().all()
        assert len(salaries) > 0

        for emp in employees:
            assert emp.email.endswith("@acme.com")
