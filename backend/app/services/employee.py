
from fastapi import HTTPException

from app.models.employee import Employee
from app.repositories.employee import EmployeeRepository
from app.schemas.employee import (
    CurrentSalary,
    EmployeeCreate,
    EmployeeRead,
    EmployeeUpdate,
    PaginatedResponse,
)


class EmployeeService:
    def __init__(self, repo: EmployeeRepository) -> None:
        self._repo = repo

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

        return self._map_row(dict(active_emp))

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
        items = [self._map_row(dict(row)) for row in rows]
        return PaginatedResponse.build(items=items, total=total, offset=offset, limit=limit)

    def _map_row(self, row_dict: dict) -> EmployeeRead:
        salary_minor_units = row_dict.get("salary_minor_units")
        if salary_minor_units is not None:
            current_salary = CurrentSalary(
                salary_minor_units=salary_minor_units,
                currency=row_dict["currency"],
                salary_usd_minor_units=row_dict["salary_usd_minor_units"],
                valid_from=row_dict["valid_from"],
            )
        else:
            current_salary = None

        return EmployeeRead(
            id=row_dict["id"],
            first_name=row_dict["first_name"],
            last_name=row_dict["last_name"],
            email=row_dict["email"],
            department=row_dict["department"],
            country=row_dict["country"],
            current_salary=current_salary,
            created_at=row_dict["created_at"],
            updated_at=row_dict["updated_at"],
        )
