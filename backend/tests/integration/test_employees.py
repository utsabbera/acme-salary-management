from datetime import date

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.employee import Employee
from app.models.salary import Salary

pytestmark = pytest.mark.asyncio


EMPLOYEES = [
    {
        "first_name": "Alice",
        "last_name": "Anderson",
        "email": "alice@example.com",
        "department": "Engineering",
        "country": "US",
        "salary_minor_units": 12000000,
        "salary_usd_minor_units": 12000000,
        "currency": "USD",
    },
    {
        "first_name": "Bob",
        "last_name": "Brown",
        "email": "bob@example.com",
        "department": "Engineering",
        "country": "UK",
        "salary_minor_units": 9500000,
        "salary_usd_minor_units": 11900000,
        "currency": "GBP",
    },
    {
        "first_name": "Carol",
        "last_name": "Chen",
        "email": "carol@example.com",
        "department": "HR",
        "country": "US",
        "salary_minor_units": 8000000,
        "salary_usd_minor_units": 8000000,
        "currency": "USD",
    },
    {
        "first_name": "David",
        "last_name": "Davis",
        "email": "david@example.com",
        "department": "Marketing",
        "country": "US",
        "salary_minor_units": 9000000,
        "salary_usd_minor_units": 9000000,
        "currency": "USD",
    },
    {
        "first_name": "Eve",
        "last_name": "Evans",
        "email": "eve@example.com",
        "department": "HR",
        "country": "UK",
        "salary_minor_units": 7500000,
        "salary_usd_minor_units": 9400000,
        "currency": "GBP",
    },
]


@pytest.fixture
async def seeded_client(client: AsyncClient, db_session: AsyncSession) -> AsyncClient:
    """Seed deterministic employees then return the test client."""
    for data in EMPLOYEES:
        emp = Employee(
            first_name=data["first_name"],
            last_name=data["last_name"],
            email=data["email"],
            department=data["department"],
            country=data["country"],
        )
        db_session.add(emp)
        await db_session.flush()

        salary = Salary(
            employee_id=emp.id,
            salary_minor_units=data["salary_minor_units"],
            currency=data["currency"],
            salary_usd_minor_units=data["salary_usd_minor_units"],
            valid_from=date(2023, 1, 1),
            valid_to=None,
        )
        db_session.add(salary)

    await db_session.flush()
    return client


class TestEmployeePagination:
    async def test_pagination_defaults(self, seeded_client: AsyncClient) -> None:
        r = await seeded_client.get("/employees")
        assert r.status_code == 200
        body = r.json()
        assert body["offset"] == 0
        assert body["limit"] == 20
        assert body["total"] == 5
        assert len(body["items"]) == 5

    async def test_pagination_page_size(self, seeded_client: AsyncClient) -> None:
        r = await seeded_client.get("/employees?offset=0&limit=2")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] == 5
        assert len(body["items"]) == 2

        r2 = await seeded_client.get("/employees?offset=2&limit=2")
        assert r2.status_code == 200
        body2 = r2.json()
        assert len(body2["items"]) == 2
        page1_ids = {item["id"] for item in body["items"]}
        page2_ids = {item["id"] for item in body2["items"]}
        assert page1_ids.isdisjoint(page2_ids)

    async def test_pagination_last_page(self, seeded_client: AsyncClient) -> None:
        r = await seeded_client.get("/employees?offset=4&limit=2")
        assert r.status_code == 200
        body = r.json()
        assert len(body["items"]) == 1  # 5 employees, last page has 1

    async def test_pagination_out_of_bounds(self, seeded_client: AsyncClient) -> None:
        r = await seeded_client.get("/employees?offset=9990&limit=20")
        assert r.status_code == 200
        body = r.json()
        assert body["items"] == []
        assert body["total"] == 5


class TestEmployeeSearch:
    async def test_search_by_first_name(self, seeded_client: AsyncClient) -> None:
        r = await seeded_client.get("/employees?search=Alice")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] == 1
        assert body["items"][0]["first_name"] == "Alice"

    async def test_search_by_last_name(self, seeded_client: AsyncClient) -> None:
        r = await seeded_client.get("/employees?search=Anderson")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] == 1
        assert body["items"][0]["last_name"] == "Anderson"

    async def test_search_by_email(self, seeded_client: AsyncClient) -> None:
        r = await seeded_client.get("/employees?search=@example.com")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] == 5  # all employees share the same email domain

    async def test_search_no_match(self, seeded_client: AsyncClient) -> None:
        r = await seeded_client.get("/employees?search=zzz_nomatch")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] == 0
        assert body["items"] == []

    async def test_search_case_insensitive(self, seeded_client: AsyncClient) -> None:
        """SQLite LIKE is case-insensitive for ASCII characters."""
        r_lower = await seeded_client.get("/employees?search=alice")
        r_upper = await seeded_client.get("/employees?search=ALICE")
        assert r_lower.json()["total"] == 1
        assert r_upper.json()["total"] == 1

    async def test_search_partial_match(self, seeded_client: AsyncClient) -> None:
        """A partial substring should match employees whose name contains it."""
        r = await seeded_client.get("/employees?search=anders")
        assert r.json()["total"] == 1
        assert r.json()["items"][0]["last_name"] == "Anderson"

    async def test_search_full_name(self, seeded_client: AsyncClient) -> None:
        """'Alice Anderson' should match via the concatenated name search."""
        r = await seeded_client.get("/employees?search=Alice Anderson")
        assert r.status_code == 200
        assert r.json()["total"] == 1
        assert r.json()["items"][0]["email"] == "alice@example.com"

    async def test_search_empty_string_returns_all(self, seeded_client: AsyncClient) -> None:
        """An empty search string should behave like no filter (returns all)."""
        r = await seeded_client.get("/employees?search=")
        assert r.status_code == 200
        assert r.json()["total"] == 5


class TestEmployeeFilters:
    async def test_filter_department(self, seeded_client: AsyncClient) -> None:
        r = await seeded_client.get("/employees?department=Engineering")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] == 2
        assert all(item["department"] == "Engineering" for item in body["items"])

    async def test_filter_country(self, seeded_client: AsyncClient) -> None:
        r = await seeded_client.get("/employees?country=US")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] == 3
        assert all(item["country"] == "US" for item in body["items"])

    async def test_combined_filters(self, seeded_client: AsyncClient) -> None:
        r = await seeded_client.get("/employees?department=HR&country=US")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] == 1
        assert body["items"][0]["first_name"] == "Carol"

    async def test_combined_search_and_department(self, seeded_client: AsyncClient) -> None:
        r = await seeded_client.get("/employees?search=Alice&department=Engineering")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] == 1
        assert body["items"][0]["email"] == "alice@example.com"

    async def test_three_way_combined_filter_match(self, seeded_client: AsyncClient) -> None:
        r = await seeded_client.get("/employees?search=Eve&department=HR&country=UK")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] == 1
        assert body["items"][0]["email"] == "eve@example.com"

    async def test_three_way_combined_filter_no_match(self, seeded_client: AsyncClient) -> None:
        """A valid combination that matches no employee returns empty."""
        r = await seeded_client.get("/employees?search=Alice&department=HR&country=US")
        assert r.status_code == 200
        assert r.json()["total"] == 0

    async def test_filter_nonexistent_department(self, seeded_client: AsyncClient) -> None:
        r = await seeded_client.get("/employees?department=Nonexistent")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] == 0
        assert body["items"] == []

    async def test_filter_nonexistent_country(self, seeded_client: AsyncClient) -> None:
        r = await seeded_client.get("/employees?country=XX")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] == 0
        assert body["items"] == []


class TestEmployeeValidation:
    async def test_invalid_offset_negative(self, client: AsyncClient) -> None:
        r = await client.get("/employees?offset=-1")
        assert r.status_code == 422

    async def test_invalid_offset_highly_negative(self, client: AsyncClient) -> None:
        r = await client.get("/employees?offset=-2")
        assert r.status_code == 422

    async def test_invalid_size_zero(self, client: AsyncClient) -> None:
        r = await client.get("/employees?limit=0")
        assert r.status_code == 422

    async def test_invalid_size_exceeds_max(self, client: AsyncClient) -> None:
        r = await client.get("/employees?limit=101")
        assert r.status_code == 422

    async def test_valid_size_boundary_max(self, seeded_client: AsyncClient) -> None:
        """size=100 is the maximum allowed and must succeed."""
        r = await seeded_client.get("/employees?limit=100")
        assert r.status_code == 200
        assert r.json()["limit"] == 100

    async def test_valid_size_one(self, seeded_client: AsyncClient) -> None:
        """size=1 returns exactly one item."""
        r = await seeded_client.get("/employees?limit=1")
        assert r.status_code == 200
        assert len(r.json()["items"]) == 1


class TestEmployeeOrdering:
    async def test_results_ordered_by_name(self, seeded_client: AsyncClient) -> None:
        """Results must be sorted by (last_name, first_name) ascending."""
        r = await seeded_client.get("/employees")
        assert r.status_code == 200
        items = r.json()["items"]
        full_names = [f"{i['last_name']} {i['first_name']}" for i in items]
        assert full_names == sorted(full_names)

    async def test_ordering_stable_across_pages(self, seeded_client: AsyncClient) -> None:
        """Concatenating pages must reproduce the same order as a single full fetch."""
        full = (await seeded_client.get("/employees")).json()["items"]
        page1 = (await seeded_client.get("/employees?offset=0&limit=3")).json()["items"]
        page2 = (await seeded_client.get("/employees?offset=3&limit=3")).json()["items"]
        assert [i["id"] for i in full] == [i["id"] for i in page1 + page2]


class TestEmployeeBusinessRules:
    async def test_inactive_employees_excluded(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """is_active=False employees must not appear in the list."""
        inactive = Employee(
            first_name="Ghost",
            last_name="User",
            email="ghost@example.com",
            department="Engineering",
            country="US",
            is_active=False,
        )
        db_session.add(inactive)
        await db_session.flush()

        db_session.add(
            Salary(
                employee_id=inactive.id,
                salary_minor_units=9500000,
                currency="USD",
                salary_usd_minor_units=9500000,
                valid_from=date(2023, 1, 1),
                valid_to=None,
            )
        )
        await db_session.flush()

        r = await client.get("/employees")
        assert r.status_code == 200
        emails = [i["email"] for i in r.json()["items"]]
        assert "ghost@example.com" not in emails

    async def test_employee_without_active_salary_excluded(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """An employee whose only salary row has valid_to set must not appear
        (the active_employees view requires valid_to IS NULL)."""
        emp = Employee(
            first_name="Past",
            last_name="Employee",
            email="past@example.com",
            department="Engineering",
            country="US",
        )
        db_session.add(emp)
        await db_session.flush()

        db_session.add(
            Salary(
                employee_id=emp.id,
                salary_minor_units=7000000,
                currency="USD",
                salary_usd_minor_units=7000000,
                valid_from=date(2020, 1, 1),
                valid_to=date(2022, 12, 31),  # closed salary — not active
            )
        )
        await db_session.flush()

        r = await client.get("/employees?search=past@example.com")
        assert r.status_code == 200
        assert r.json()["total"] == 0

    async def test_only_current_salary_returned(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """An employee with both a historical and a current salary row must appear
        exactly once, with the current (valid_to=None) salary values."""
        emp = Employee(
            first_name="Promoted",
            last_name="Person",
            email="promoted@example.com",
            department="Engineering",
            country="US",
        )
        db_session.add(emp)
        await db_session.flush()

        db_session.add(
            Salary(
                employee_id=emp.id,
                salary_minor_units=8000000,
                currency="USD",
                salary_usd_minor_units=8000000,
                valid_from=date(2021, 1, 1),
                valid_to=date(2023, 1, 1),  # old salary
            )
        )
        db_session.add(
            Salary(
                employee_id=emp.id,
                salary_minor_units=11000000,
                currency="USD",
                salary_usd_minor_units=11000000,
                valid_from=date(2023, 1, 1),
                valid_to=None,  # current salary
            )
        )
        await db_session.flush()

        r = await client.get("/employees?search=promoted@example.com")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] == 1
        assert body["items"][0]["salary_usd_minor_units"] == 11000000

    async def test_empty_database(self, client: AsyncClient) -> None:
        """When no employees exist the response is well-formed with zero counts."""
        r = await client.get("/employees")
        assert r.status_code == 200
        body = r.json()
        assert body["items"] == []
        assert body["total"] == 0
        assert body["offset"] == 0
        assert body["limit"] == 20

    async def test_salary_field_values(self, seeded_client: AsyncClient) -> None:
        """salary, salary_usd, and currency must match the seeded values."""
        r = await seeded_client.get("/employees?search=bob@example.com")
        assert r.status_code == 200
        item = r.json()["items"][0]
        assert item["salary_minor_units"] == 9500000
        assert item["salary_usd_minor_units"] == 11900000
        assert item["currency"] == "GBP"

    async def test_employee_field_values(self, seeded_client: AsyncClient) -> None:
        """All identity fields must match the seeded values exactly."""
        r = await seeded_client.get("/employees?search=carol@example.com")
        assert r.status_code == 200
        item = r.json()["items"][0]
        assert item["first_name"] == "Carol"
        assert item["last_name"] == "Chen"
        assert item["email"] == "carol@example.com"
        assert item["department"] == "HR"
        assert item["country"] == "US"
        assert item["valid_from"] == "2023-01-01"

    async def test_response_schema(self, seeded_client: AsyncClient) -> None:
        r = await seeded_client.get("/employees?limit=1")
        assert r.status_code == 200
        item = r.json()["items"][0]
        required_fields = {
            "id",
            "first_name",
            "last_name",
            "email",
            "department",
            "country",
            "salary_minor_units",
            "currency",
            "salary_usd_minor_units",
            "valid_from",
            "created_at",
            "updated_at",
        }
        assert required_fields.issubset(item.keys())
