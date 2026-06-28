from datetime import timedelta

from fastapi import HTTPException

from app.models.employee import Employee
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


class EmployeeService:
    def __init__(self, repo: EmployeeRepository) -> None:
        self._repo = repo

    async def get_employee(self, employee_id: int) -> EmployeeDetailRead:
        employee = await self._repo.get_by_id_with_salaries(employee_id)
        if not employee:
            raise HTTPException(status_code=404, detail="Not Found")

        history = sorted(employee.salaries, key=lambda s: (s.valid_from, s.id), reverse=True)

        salary_history = [
            SalaryHistoryItem(
                base_salary_minor_units=s.base_salary_minor_units,
                housing_allowance_minor_units=s.housing_allowance_minor_units,
                equity_minor_units=s.equity_minor_units,
                other_allowance_minor_units=s.other_allowance_minor_units,
                currency=s.currency,
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
                currency=active_salary.currency,
                valid_from=active_salary.valid_from,
            )

        return EmployeeDetailRead(
            id=employee.id,
            first_name=employee.first_name,
            last_name=employee.last_name,
            email=employee.email,
            department=employee.department,
            country=employee.country,
            current_salary=current_salary,
            created_at=employee.created_at,
            updated_at=employee.updated_at,
            salary_history=salary_history,
        )

    async def create_employee(self, data: EmployeeCreate) -> EmployeeRead:
        if await self._repo.get_by_email(data.email):
            raise HTTPException(status_code=409, detail="Email already registered")

        employee = Employee(
            first_name=data.first_name,
            last_name=data.last_name,
            email=data.email,
            department=data.department,
            country=data.country,
        )

        created = await self._repo.create(employee)

        return EmployeeRead(
            id=created.id,
            first_name=created.first_name,
            last_name=created.last_name,
            email=created.email,
            department=created.department,
            country=created.country,
            current_salary=None,
            created_at=created.created_at,
            updated_at=created.updated_at,
        )

    async def update_employee(self, employee_id: int, data: EmployeeUpdate) -> EmployeeRead:

        employee = await self._repo.get_by_id_with_salaries(employee_id)
        if not employee:
            raise HTTPException(status_code=404, detail="Not Found")

        update_data = data.model_dump(exclude_unset=True)

        if (
            "email" in update_data
            and update_data["email"] != employee.email
            and await self._repo.get_by_email(update_data["email"])
        ):
            raise HTTPException(status_code=409, detail="Email already registered")

        for field in ["first_name", "last_name", "email", "department", "country"]:
            if field in update_data:
                setattr(employee, field, update_data[field])

        await self._repo.commit()

        active_emp = await self._repo.get_active_employee(employee_id)
        if not active_emp:
            raise HTTPException(status_code=404, detail="Not Found")

        return active_emp

    async def delete_employee(self, employee_id: int) -> None:
        employee = await self._repo.get_by_id_with_salaries(employee_id)
        if not employee:
            raise HTTPException(status_code=404, detail="Not Found")

        employee.is_active = False
        await self._repo.commit()

    async def list_employees(
        self,
        offset: int,
        limit: int,
        search: str | None = None,
        department: str | None = None,
        country: str | None = None,
    ) -> PaginatedResponse[EmployeeRead]:
        items, total = (
            await self._repo.list_paginated(
                offset=offset,
                limit=limit,
                search=search,
                department=department,
                country=country,
            ),
            await self._repo.count(
                search=search,
                department=department,
                country=country,
            ),
        )
        return PaginatedResponse.build(items=items, total=total, offset=offset, limit=limit)

    async def add_salary_adjustment(
        self, employee_id: int, data: SalaryCreate
    ) -> EmployeeDetailRead:
        employee = await self._repo.get_by_id_with_salaries(employee_id)
        if not employee:
            raise HTTPException(status_code=404, detail="Not Found")

        active_salary = next((s for s in employee.salaries if s.valid_to is None), None)
        if active_salary:
            if data.valid_from <= active_salary.valid_from:
                raise HTTPException(
                    status_code=400,
                    detail="New salary valid_from must be after current salary valid_from",
                )
            active_salary.valid_to = data.valid_from - timedelta(days=1)

        new_salary = Salary(
            employee_id=employee_id,
            base_salary_minor_units=data.base_salary_minor_units,
            housing_allowance_minor_units=data.housing_allowance_minor_units,
            equity_minor_units=data.equity_minor_units,
            other_allowance_minor_units=data.other_allowance_minor_units,
            currency=data.currency,
            valid_from=data.valid_from,
        )
        employee.salaries.append(new_salary)
        await self._repo.commit()

        return await self.get_employee(employee_id)
