from unittest.mock import AsyncMock

import pytest

from app.schemas.employee import EmployeeRead
from app.services.employee import EmployeeService


class TestEmployeeService:
    @pytest.mark.asyncio
    async def test_list_employees_orchestration(self) -> None:
        mock_repo = AsyncMock()

        from datetime import datetime

        from app.schemas.reference import CountryRead, CurrencyRead, DepartmentRead

        mock_row = EmployeeRead(
            id=1,
            first_name="Test",
            last_name="User",
            email="test@example.com",
            department=DepartmentRead(id=1, name="IT"),
            country=CountryRead(
                id=1,
                code="US",
                name="United States",
                default_currency=CurrencyRead(id=1, code="USD", name="US Dollar"),
            ),
            current_salary=None,
            created_at=datetime(2023, 1, 1),
            updated_at=datetime(2023, 1, 1),
        )
        mock_repo.list_paginated.return_value = [mock_row]
        mock_repo.count.return_value = 42

        service = EmployeeService(repo=mock_repo)

        result = await service.list_employees(
            offset=10, limit=10, search="test", department_id=1, country_code="US"
        )

        mock_repo.list_paginated.assert_awaited_once_with(
            offset=10, limit=10, search="test", department_id=1, country_code="US"
        )
        mock_repo.count.assert_awaited_once_with(search="test", department_id=1, country_code="US")

        assert result.total == 42
        assert result.offset == 10
        assert result.limit == 10

        assert len(result.items) == 1
        item = result.items[0]
        assert isinstance(item, EmployeeRead)
        assert item.first_name == "Test"
        assert item.email == "test@example.com"

    @pytest.mark.asyncio
    async def test_get_employee_success(self) -> None:
        mock_repo = AsyncMock()

        from datetime import date, datetime

        from app.models.employee import Employee
        from app.models.reference import Country, Currency, Department
        from app.models.salary import Salary

        mock_currency = Currency(id=1, code="USD", name="US Dollar")
        mock_country = Country(
            id=1, code="US", name="United States", default_currency=mock_currency
        )
        mock_department = Department(id=1, name="Engineering")

        employee = Employee(
            id=1,
            first_name="Jane",
            last_name="Doe",
            email="jane@example.com",
            department_id=1,
            department=mock_department,
            country_id=1,
            country=mock_country,
            created_at=datetime(2023, 1, 1),
            updated_at=datetime(2023, 1, 1),
        )

        salary1 = Salary(
            base_salary_minor_units=9000000,
            currency_id=1,
            currency=mock_currency,
            valid_from=date(2022, 1, 1),
            valid_to=date(2023, 1, 1),
        )

        salary2 = Salary(
            base_salary_minor_units=10000000,
            currency_id=1,
            currency=mock_currency,
            valid_from=date(2023, 1, 2),
            valid_to=None,
        )
        employee.salaries = [salary1, salary2]

        mock_repo.get_by_id_with_salaries.return_value = employee

        service = EmployeeService(repo=mock_repo)
        result = await service.get_employee(1)

        mock_repo.get_by_id_with_salaries.assert_awaited_once_with(1)

        assert result.id == 1
        assert result.current_salary is not None
        assert result.current_salary.salary_minor_units == 10000000

        assert len(result.salary_history) == 2
        assert result.salary_history[0].salary_minor_units == 10000000
        assert result.salary_history[1].salary_minor_units == 9000000

    @pytest.mark.asyncio
    async def test_get_employee_not_found(self) -> None:
        from fastapi import HTTPException

        mock_repo = AsyncMock()
        mock_repo.get_by_id_with_salaries.return_value = None

        service = EmployeeService(repo=mock_repo)
        with pytest.raises(HTTPException) as exc:
            await service.get_employee(999)

        assert exc.value.status_code == 404
