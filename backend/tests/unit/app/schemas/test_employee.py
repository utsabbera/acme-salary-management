from datetime import date, datetime

import pytest
from pydantic import ValidationError

from app.schemas.employee import (
    EmployeeCreate,
    EmployeeDetailRead,
    PaginatedResponse,
    SalaryBase,
    SalaryHistoryItem,
)
from app.schemas.reference import CountryRead, CurrencyRead, DepartmentRead


class TestPaginatedResponse:
    def test_build_basic(self) -> None:
        items = [1, 2, 3]
        response = PaginatedResponse.build(items=items, total=15, offset=0, limit=5)

        assert response.items == items
        assert response.total == 15
        assert response.offset == 0
        assert response.limit == 5


def test_salary_minor_units_calculation() -> None:
    salary = SalaryBase(
        base_salary_minor_units=1000,
        housing_allowance_minor_units=500,
        equity_minor_units=None,
        other_allowance_minor_units=200,
        currency=CurrencyRead(id=1, code="USD", name="US Dollar"),
    )
    assert salary.salary_minor_units == 1700


def test_employee_create_validation() -> None:
    with pytest.raises(ValidationError):
        EmployeeCreate(
            first_name="Jane",
            last_name="Doe",
            email="not-an-email",  # Invalid email
            department_id=1,
            country_code="US",
        )

    with pytest.raises(ValidationError):
        EmployeeCreate(
            first_name="Jane",
            last_name="Doe",
            email="jane@example.com",
            department_id=1,
            country_code="USA",  # Invalid country code length
        )

    with pytest.raises(ValidationError):
        EmployeeCreate(
            first_name="",  # Empty first name
            last_name="Doe",
            email="jane@example.com",
            department_id=1,
            country_code="US",
        )


class TestEmployeeDetailRead:
    def test_employee_detail_read_validation(self) -> None:
        history_item = SalaryHistoryItem(
            base_salary_minor_units=100000,
            currency=CurrencyRead(id=1, code="USD", name="US Dollar"),
            valid_from=date(2023, 1, 1),
            valid_to=date(2023, 12, 31),
        )

        detail = EmployeeDetailRead(
            id=1,
            first_name="Jane",
            last_name="Doe",
            email="jane@example.com",
            department=DepartmentRead(id=1, name="Engineering"),
            country=CountryRead(
                id=1,
                code="US",
                name="United States",
                default_currency=CurrencyRead(id=1, code="USD", name="US Dollar"),
            ),
            current_salary=None,
            created_at=datetime(2023, 1, 1),
            updated_at=datetime(2023, 1, 1),
            salary_history=[history_item],
        )

        assert detail.id == 1
        assert len(detail.salary_history) == 1
        assert detail.salary_history[0].currency.code == "USD"
