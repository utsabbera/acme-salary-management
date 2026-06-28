from datetime import date

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.employee import Employee
from app.models.salary import Salary

pytestmark = pytest.mark.asyncio


@pytest.fixture
async def seeded_dashboard_client(client: AsyncClient, db_session: AsyncSession) -> AsyncClient:
    """Seed employees with different countries, departments, and active/inactive status."""
    employees_data = [
        # Active employees
        {
            "first": "A",
            "last": "A",
            "email": "a@ex.com",
            "dept": "Engineering",
            "country": "US",
            "salary_usd": 12000000,
            "active": True,
            "valid_to": None,
        },
        {
            "first": "B",
            "last": "B",
            "email": "b@ex.com",
            "dept": "Engineering",
            "country": "UK",
            "salary_usd": 11000000,
            "active": True,
            "valid_to": None,
        },
        {
            "first": "C",
            "last": "C",
            "email": "c@ex.com",
            "dept": "HR",
            "country": "US",
            "salary_usd": 8000000,
            "active": True,
            "valid_to": None,
        },
        # Inactive employee
        {
            "first": "D",
            "last": "D",
            "email": "d@ex.com",
            "dept": "Engineering",
            "country": "US",
            "salary_usd": 15000000,
            "active": False,
            "valid_to": None,
        },
        # Active employee but with expired salary
        {
            "first": "E",
            "last": "E",
            "email": "e@ex.com",
            "dept": "HR",
            "country": "UK",
            "salary_usd": 9000000,
            "active": True,
            "valid_to": date(2022, 12, 31),
        },
        # Active employee with NO valid salaries (triggers the NULL aggregation bug)
        {
            "first": "F",
            "last": "F",
            "email": "f@ex.com",
            "dept": "Sales",
            "country": "CA",
            "salary_usd": 7000000,
            "active": True,
            "valid_to": date(2022, 12, 31),
        },
    ]

    for data in employees_data:
        emp = Employee(
            first_name=data["first"],
            last_name=data["last"],
            email=data["email"],
            department=data["dept"],
            country=data["country"],
            is_active=data["active"],
        )
        db_session.add(emp)
        await db_session.flush()

        sal = Salary(
            employee_id=emp.id,
            exchange_rate_id=1,
            base_salary_minor_units=data["salary_usd"],
            currency="USD",
            salary_usd_minor_units=data["salary_usd"],
            valid_from=date(2022, 1, 1),
            valid_to=data["valid_to"],
        )
        db_session.add(sal)

    await db_session.flush()
    return client


class TestDashboardStats:
    async def test_get_dashboard_stats_empty(self, client: AsyncClient) -> None:
        """Dashboard stats should return empty lists when there are no employees."""
        response = await client.get("/dashboard/stats")

        assert response.status_code == 200
        data = response.json()
        assert data["department_averages"] == []
        assert data["country_totals"] == []

    async def test_get_dashboard_stats_aggregations(
        self, seeded_dashboard_client: AsyncClient
    ) -> None:
        """Verify average salary by department and total by country, ignoring inactive."""
        response = await seeded_dashboard_client.get("/dashboard/stats")

        assert response.status_code == 200
        data = response.json()

        # Department averages
        # Engineering: Only A & B are active (12m + 11m) / 2 = 11.5m. D is inactive.
        # HR: Only C is active (8m). E is active but salary is expired.
        averages = {
            d["department"]: d["average_salary_usd_minor_units"]
            for d in data["department_averages"]
        }
        assert len(averages) == 3
        assert averages["Engineering"] == 11500000
        assert averages["HR"] == 8000000
        assert averages["Sales"] == 0

        # Country totals
        # US: A (12m) + C (8m) = 20m. D is inactive.
        # UK: B (11m). E is expired.
        # CA: F is expired.
        totals = {d["country"]: d["total_salary_usd_minor_units"] for d in data["country_totals"]}
        assert len(totals) == 3
        assert totals["US"] == 20000000
        assert totals["UK"] == 11000000
        assert totals["CA"] == 0
