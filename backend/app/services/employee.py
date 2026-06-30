from datetime import timedelta

from sqlalchemy import select

from app.core.exceptions import (
    BusinessRuleError,
    ConflictError,
    DomainError,
    NotFoundError,
)
from app.models.employee import Employee
from app.models.reference import Country, Currency
from app.models.salary import Salary
from app.repositories.employee import EmployeeRepository
from app.schemas.employee import (
    CurrentSalary,
    EmployeeCreate,
    EmployeeDetailRead,
    EmployeeRead,
    EmployeeUpdate,
    PaginatedResponse,
    SalaryCreate,
    SalaryHistoryItem,
)
from app.schemas.reference import CountryRead, CurrencyRead, DepartmentRead


class EmployeeService:
    def __init__(self, repo: EmployeeRepository) -> None:
        self._repo = repo

    async def get_employee(self, employee_id: int) -> EmployeeDetailRead:
        employee = await self._repo.get_by_id_with_salaries(employee_id)
        if not employee:
            raise NotFoundError("Employee not found")

        history = sorted(employee.salaries, key=lambda s: (s.valid_from, s.id), reverse=True)

        salary_history = [
            SalaryHistoryItem(
                base_salary_minor_units=s.base_salary_minor_units,
                housing_allowance_minor_units=s.housing_allowance_minor_units,
                equity_minor_units=s.equity_minor_units,
                other_allowance_minor_units=s.other_allowance_minor_units,
                currency=CurrencyRead(
                    id=s.currency.id,
                    code=s.currency.code,
                    name=s.currency.name,
                ),
                valid_from=s.valid_from,
                valid_to=s.valid_to,
            )
            for s in history
        ]

        current_salary = None
        active_salary = next((s for s in history if s.valid_to is None), None)
        if active_salary:
            current_salary = CurrentSalary(
                base_salary_minor_units=active_salary.base_salary_minor_units,
                housing_allowance_minor_units=active_salary.housing_allowance_minor_units,
                equity_minor_units=active_salary.equity_minor_units,
                other_allowance_minor_units=active_salary.other_allowance_minor_units,
                currency=CurrencyRead(
                    id=active_salary.currency.id,
                    code=active_salary.currency.code,
                    name=active_salary.currency.name,
                ),
                valid_from=active_salary.valid_from,
            )

        return EmployeeDetailRead(
            id=employee.id,
            first_name=employee.first_name,
            last_name=employee.last_name,
            email=employee.email,
            department=DepartmentRead(
                id=employee.department.id,
                name=employee.department.name,
            ),
            country=CountryRead(
                id=employee.country.id,
                code=employee.country.code,
                name=employee.country.name,
                default_currency=CurrencyRead(
                    id=employee.country.default_currency.id,
                    code=employee.country.default_currency.code,
                    name=employee.country.default_currency.name,
                ),
            ),
            current_salary=current_salary,
            created_at=employee.created_at,
            updated_at=employee.updated_at,
            salary_history=salary_history,
        )

    async def create_employee(self, data: EmployeeCreate) -> EmployeeRead:
        if await self._repo.get_by_email(data.email):
            raise ConflictError("Email already registered")

        country = await self._repo._session.execute(
            select(Country).where(Country.code == data.country_code)
        )
        country_obj = country.scalar_one_or_none()
        if not country_obj:
            raise NotFoundError("Country code not found")
        employee = Employee(
            first_name=data.first_name,
            last_name=data.last_name,
            email=data.email,
            department_id=data.department_id,
            country_id=country_obj.id,
        )

        created = await self._repo.create(employee)

        active_emp = await self._repo.get_active_employee(created.id)
        if not active_emp:
            raise DomainError("Failed to retrieve created employee")

        return active_emp

    async def update_employee(self, employee_id: int, data: EmployeeUpdate) -> EmployeeRead:

        employee = await self._repo.get_by_id_with_salaries(employee_id)
        if not employee:
            raise NotFoundError("Employee not found")

        update_data = data.model_dump(exclude_unset=True)

        if (
            "email" in update_data
            and update_data["email"] != employee.email
            and await self._repo.get_by_email(update_data["email"])
        ):
            raise ConflictError("Email already registered")

        for field in ["first_name", "last_name", "email", "department_id", "country_code"]:
            if field in update_data:
                if field == "country_code":
                    country = await self._repo._session.execute(
                        select(Country).where(Country.code == update_data[field])
                    )
                    country_obj = country.scalar_one_or_none()
                    if not country_obj:
                        raise NotFoundError("Country code not found")
                    employee.country_id = country_obj.id
                else:
                    setattr(employee, field, update_data[field])

        await self._repo.commit()

        active_emp = await self._repo.get_active_employee(employee_id)
        if not active_emp:
            raise NotFoundError("Employee not found")

        return active_emp

    async def delete_employee(self, employee_id: int) -> None:
        employee = await self._repo.get_by_id_with_salaries(employee_id)
        if not employee:
            raise NotFoundError("Employee not found")

        employee.is_active = False
        await self._repo.commit()

    async def list_employees(
        self,
        offset: int,
        limit: int,
        search: str | None = None,
        department_id: int | None = None,
        country_code: str | None = None,
    ) -> PaginatedResponse[EmployeeRead]:
        items, total = (
            await self._repo.list_paginated(
                offset=offset,
                limit=limit,
                search=search,
                department_id=department_id,
                country_code=country_code,
            ),
            await self._repo.count(
                search=search,
                department_id=department_id,
                country_code=country_code,
            ),
        )
        return PaginatedResponse.build(items=items, total=total, offset=offset, limit=limit)

    async def add_salary_adjustment(
        self, employee_id: int, data: SalaryCreate
    ) -> EmployeeDetailRead:
        employee = await self._repo.get_by_id_with_salaries(employee_id)
        if not employee:
            raise NotFoundError("Employee not found")

        active_salary = next((s for s in employee.salaries if s.valid_to is None), None)
        if active_salary:
            if data.valid_from <= active_salary.valid_from:
                raise BusinessRuleError(
                    "New salary valid_from must be after current salary valid_from"
                )
            active_salary.valid_to = data.valid_from - timedelta(days=1)

        # Resolve ISO currency_code to internal ID
        currency = await self._repo._session.execute(
            select(Currency).where(Currency.code == data.currency_code)
        )
        currency_obj = currency.scalar_one_or_none()
        if not currency_obj:
            raise NotFoundError("Currency code not found")
        new_salary = Salary(
            employee_id=employee_id,
            base_salary_minor_units=data.base_salary_minor_units,
            housing_allowance_minor_units=data.housing_allowance_minor_units,
            equity_minor_units=data.equity_minor_units,
            other_allowance_minor_units=data.other_allowance_minor_units,
            currency_id=currency_obj.id,
            valid_from=data.valid_from,
        )
        employee.salaries.append(new_salary)
        await self._repo.commit()

        return await self.get_employee(employee_id)
