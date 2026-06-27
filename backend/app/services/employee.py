from datetime import date

from fastapi import HTTPException

from app.models.employee import Employee
from app.models.salary import Salary
from app.repositories.employee import EmployeeRepository
from app.schemas.employee import EmployeeCreate, EmployeeRead, EmployeeUpdate, PaginatedResponse
from app.services.currency import convert_to_usd


class EmployeeService:
    def __init__(self, repo: EmployeeRepository) -> None:
        self._repo = repo

    async def create_employee(self, data: EmployeeCreate) -> EmployeeRead:
        if await self._repo.get_by_email(data.email):
            raise HTTPException(status_code=409, detail="Email already registered")

        try:
            salary_usd = await convert_to_usd(data.salary, data.currency, self._repo._session)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e)) from e

        valid_from = data.valid_from or date.today()

        employee = Employee(
            first_name=data.first_name,
            last_name=data.last_name,
            email=data.email,
            department=data.department,
            country=data.country,
            salaries=[
                Salary(
                    salary=data.salary,
                    currency=data.currency,
                    salary_usd=salary_usd,
                    valid_from=valid_from,
                )
            ],
        )

        created = await self._repo.create(employee)

        return EmployeeRead(
            id=created.id,
            first_name=created.first_name,
            last_name=created.last_name,
            email=created.email,
            department=created.department,
            country=created.country,
            salary=data.salary,
            currency=data.currency,
            salary_usd=salary_usd,
            valid_from=valid_from,
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

        return EmployeeRead.model_validate(dict(active_emp))

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
        rows, total = (
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
        items = [EmployeeRead.model_validate(dict(row)) for row in rows]
        return PaginatedResponse.build(items=items, total=total, offset=offset, limit=limit)
