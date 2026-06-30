from datetime import date

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.employee import Employee
from app.models.exchange_rate import ExchangeRate
from app.models.reference import Country, Currency, Department
from app.models.salary import Salary

pytestmark = pytest.mark.asyncio


@pytest.fixture
async def seeded_dashboard_client(client: AsyncClient, db_session: AsyncSession) -> AsyncClient:
    """Seed employees with different countries, departments, and active/inactive status."""

    from sqlalchemy import select

    currencies = {c.code: c for c in (await db_session.execute(select(Currency))).scalars().all()}
    countries = {c.code: c for c in (await db_session.execute(select(Country))).scalars().all()}
    departments = {
        d.name: d for d in (await db_session.execute(select(Department))).scalars().all()
    }

    exchange_rates = {
        "GBP": ExchangeRate(currency="GBP", rate=1.25),
        "CAD": ExchangeRate(currency="CAD", rate=0.74),
    }
    for er in exchange_rates.values():
        db_session.add(er)
    await db_session.flush()

    employees_data = [
        # Active employees
        {
            "first": "A",
            "last": "A",
            "email": "a@ex.com",
            "dept": "Engineering",
            "country": "US",
            "salary_usd": 12000000,
            "base": 10000000,
            "housing": 1000000,
            "equity": 1000000,
            "other": 0,
            "active": True,
            "valid_to": None,
            "currency": "USD",
        },
        {
            "first": "B",
            "last": "B",
            "email": "b@ex.com",
            "dept": "Engineering",
            "country": "UK",
            "salary_usd": 11000000,
            "base": 9000000,
            "housing": 1000000,
            "equity": 500000,
            "other": 500000,
            "active": True,
            "valid_to": None,
            "currency": "GBP",
        },
        {
            "first": "C",
            "last": "C",
            "email": "c@ex.com",
            "dept": "HR",
            "country": "US",
            "salary_usd": 8000000,
            "base": 8000000,
            "housing": 0,
            "equity": 0,
            "other": 0,
            "active": True,
            "valid_to": None,
            "currency": "USD",
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
            "currency": "USD",
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
            "currency": "GBP",
        },
        # Active employee with NO valid salaries
        {
            "first": "F",
            "last": "F",
            "email": "f@ex.com",
            "dept": "Sales",
            "country": "CA",
            "salary_usd": 7000000,
            "active": True,
            "valid_to": date(2022, 12, 31),
            "currency": "CAD",
        },
    ]

    for data in employees_data:
        emp = Employee(
            first_name=data["first"],
            last_name=data["last"],
            email=data["email"],
            department_id=departments[str(data["dept"])].id,
            country_id=countries[str(data["country"])].id,
            is_active=data["active"],
        )
        db_session.add(emp)
        await db_session.flush()

        if "base" in data:
            salary = Salary(
                employee_id=emp.id,
                base_salary_minor_units=data.get("base", 0),
                housing_allowance_minor_units=data.get("housing", 0),
                equity_minor_units=data.get("equity", 0),
                other_allowance_minor_units=data.get("other", 0),
                currency_id=currencies[str(data["currency"])].id,
                valid_from=date(2022, 1, 1),
                valid_to=data.get("valid_to"),
            )
            db_session.add(salary)

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
        assert averages["Engineering"] == 12875000
        assert averages["HR"] == 8000000
        assert averages["Sales"] == 0

        # Country totals
        # US: A (12m) + C (8m) = 20m. D is inactive.
        # UK: B (11m). E is expired.
        # CA: F is expired.
        totals = {
            d["country"]: {
                "total": d["total_salary_usd_minor_units"],
                "headcount": d.get("headcount", -1),
            }
            for d in data["country_totals"]
        }
        assert len(totals) == 3
        assert totals["United States"]["total"] == 20000000
        assert totals["United States"]["headcount"] == 2
        assert totals["United Kingdom"]["total"] == 13750000
        assert totals["United Kingdom"]["headcount"] == 2
        assert totals["Canada"]["total"] == 0
        assert totals["Canada"]["headcount"] == 1

    async def test_get_dashboard_stats_components(
        self, seeded_dashboard_client: AsyncClient
    ) -> None:
        """Verify total spend is correctly broken down by component type."""
        response = await seeded_dashboard_client.get("/dashboard/stats")

        assert response.status_code == 200
        data = response.json()

        assert "component_totals" in data
        totals = data["component_totals"]

        # Only A, B, C are active and valid.
        # Base: A(10m) + B(9m) + C(8m) = 27m
        # Housing: A(1m) + B(1m) = 2m
        # Equity: A(1m) + B(0.5m) = 1.5m
        # Other: B(0.5m) = 0.5m
        assert totals["base_salary_usd_minor_units"] == 29250000
        assert totals["housing_allowance_usd_minor_units"] == 2250000
        assert totals["equity_usd_minor_units"] == 1625000
        assert totals["other_allowance_usd_minor_units"] == 625000

    async def test_get_dashboard_stats_distribution(
        self, seeded_dashboard_client: AsyncClient
    ) -> None:
        """Verify pay distribution returns all active employee salaries by department."""
        response = await seeded_dashboard_client.get("/dashboard/stats")

        assert response.status_code == 200
        data = response.json()

        assert "salary_distribution" in data
        distribution = data["salary_distribution"]

        # A (Engineering, 12m), B (Engineering, 11m), C (HR, 8m)
        # D is inactive, E is expired, F is expired

        assert len(distribution) == 2

        dept_names = [d["department"] for d in distribution]
        assert "Engineering" in dept_names
        assert "HR" in dept_names

        eng_dist = next(d for d in distribution if d["department"] == "Engineering")
        assert "p25_salary_usd_minor_units" in eng_dist
        assert "p50_salary_usd_minor_units" in eng_dist
        assert "p75_salary_usd_minor_units" in eng_dist

        eng_dist = next(d for d in distribution if d["department"] == "Engineering")
        assert eng_dist["p25_salary_usd_minor_units"] == 12437500
        assert eng_dist["p50_salary_usd_minor_units"] == 12875000
        assert eng_dist["p75_salary_usd_minor_units"] == 13312500

        hr_dist = next(d for d in distribution if d["department"] == "HR")
        assert hr_dist["p50_salary_usd_minor_units"] == 8000000
