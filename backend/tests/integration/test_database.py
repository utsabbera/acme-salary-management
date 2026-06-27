from datetime import date

import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.employee import Employee
from app.models.salary import Salary

pytestmark = pytest.mark.asyncio


class TestDatabaseBehaviors:
    async def test_scd_type2_resolution(self, db_session: AsyncSession) -> None:
        employee = Employee(
            first_name="John",
            last_name="Doe",
            email="john@example.com",
            department="Engineering",
            country="USD",
        )
        db_session.add(employee)
        await db_session.flush()

        old_salary = Salary(
            employee_id=employee.id,
            exchange_rate_id=1,
            salary_minor_units=10000000,
            currency="USD",
            salary_usd_minor_units=10000000,
            valid_from=date(2020, 1, 1),
            valid_to=date(2022, 1, 1),
        )
        new_salary = Salary(
            employee_id=employee.id,
            exchange_rate_id=1,
            salary_minor_units=12000000,
            currency="USD",
            salary_usd_minor_units=12000000,
            valid_from=date(2022, 1, 1),
            valid_to=None,
        )
        db_session.add_all([old_salary, new_salary])
        await db_session.flush()

        result = await db_session.execute(
            text("SELECT * FROM active_employees WHERE id = :id"), {"id": employee.id}
        )
        active_record = result.mappings().one()

        assert active_record["salary_minor_units"] == 12000000
        assert "valid_to" not in active_record

    async def test_soft_deletes(self, db_session: AsyncSession) -> None:
        employee = Employee(
            first_name="Jane",
            last_name="Doe",
            email="jane@example.com",
            department="Engineering",
            country="USD",
            is_active=False,
        )
        db_session.add(employee)
        await db_session.flush()

        salary = Salary(
            employee_id=employee.id,
            exchange_rate_id=1,
            salary_minor_units=10000000,
            currency="USD",
            salary_usd_minor_units=10000000,
            valid_from=date(2020, 1, 1),
            valid_to=None,
        )
        db_session.add(salary)
        await db_session.flush()

        result = await db_session.execute(
            text("SELECT * FROM active_employees WHERE id = :id"), {"id": employee.id}
        )
        rows = result.mappings().all()
        assert len(rows) == 0

    async def test_cascade_deletes(self, db_session: AsyncSession) -> None:
        employee = Employee(
            first_name="Bob",
            last_name="Smith",
            email="bob@example.com",
            department="HR",
            country="USD",
        )
        db_session.add(employee)
        await db_session.flush()

        salary = Salary(
            employee_id=employee.id,
            exchange_rate_id=1,
            salary_minor_units=8000000,
            currency="USD",
            salary_usd_minor_units=8000000,
            valid_from=date(2020, 1, 1),
            valid_to=None,
        )
        db_session.add(salary)
        await db_session.flush()

        await db_session.delete(employee)
        await db_session.flush()

        result = await db_session.execute(
            text("SELECT * FROM salaries WHERE employee_id = :id"), {"id": employee.id}
        )
        salaries = result.mappings().all()
        assert len(salaries) == 0
