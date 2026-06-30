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
        employee.current_salary = salary2

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
        from app.core.exceptions import NotFoundError

        mock_repo = AsyncMock()
        mock_repo.get_by_id_with_salaries.return_value = None

        service = EmployeeService(repo=mock_repo)
        with pytest.raises(NotFoundError):
            await service.get_employee(999)

    @pytest.mark.asyncio
    async def test_create_employee_success(self) -> None:
        from datetime import datetime

        from app.models.employee import Employee
        from app.models.reference import Country
        from app.schemas.employee import EmployeeCreate
        from app.schemas.reference import CountryRead, CurrencyRead, DepartmentRead

        mock_repo = AsyncMock()
        mock_repo.get_by_email.return_value = None

        mock_country = Country(id=1, code="US")
        from unittest.mock import MagicMock

        mock_country_result = MagicMock()
        mock_country_result.scalar_one_or_none.return_value = mock_country
        mock_repo._session.execute.return_value = mock_country_result

        mock_created_employee = Employee(
            id=1, first_name="John", last_name="Doe", email="john@example.com"
        )
        mock_repo.create.return_value = mock_created_employee

        mock_active_emp = EmployeeRead(
            id=1,
            first_name="John",
            last_name="Doe",
            email="john@example.com",
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
        mock_repo.get_active_employee.return_value = mock_active_emp

        service = EmployeeService(repo=mock_repo)
        data = EmployeeCreate(
            first_name="John",
            last_name="Doe",
            email="john@example.com",
            department_id=1,
            country_code="US",
        )
        result = await service.create_employee(data)

        assert result.id == 1
        assert result.email == "john@example.com"
        mock_repo.create.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_create_employee_email_conflict(self) -> None:
        from app.core.exceptions import ConflictError
        from app.schemas.employee import EmployeeCreate

        mock_repo = AsyncMock()
        mock_repo.get_by_email.return_value = True  # Email exists

        service = EmployeeService(repo=mock_repo)
        data = EmployeeCreate(
            first_name="John",
            last_name="Doe",
            email="john@example.com",
            department_id=1,
            country_code="US",
        )

        with pytest.raises(ConflictError):
            await service.create_employee(data)

    @pytest.mark.asyncio
    async def test_delete_employee_success(self) -> None:
        mock_repo = AsyncMock()

        from app.models.employee import Employee

        mock_emp = Employee(id=1, is_active=True)
        mock_repo.get_by_id_with_salaries.return_value = mock_emp

        service = EmployeeService(repo=mock_repo)
        await service.delete_employee(1)

        assert mock_emp.is_active is False
        mock_repo.commit.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_delete_employee_not_found(self) -> None:
        from app.core.exceptions import NotFoundError

        mock_repo = AsyncMock()
        mock_repo.get_by_id_with_salaries.return_value = None

        service = EmployeeService(repo=mock_repo)
        with pytest.raises(NotFoundError):
            await service.delete_employee(999)
