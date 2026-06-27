from typing import Any

from sqlalchemy import Select, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.employee import Employee, active_employees
from app.schemas.employee import CurrentSalary, EmployeeRead


class EmployeeRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_email(self, email: str) -> Employee | None:
        stmt = select(Employee).where(Employee.email == email)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, employee: Employee) -> Employee:
        self._session.add(employee)
        await self._session.commit()
        await self._session.refresh(employee)
        return employee

    async def get_by_id_with_salaries(self, employee_id: int) -> Employee | None:
        stmt = (
            select(Employee)
            .options(selectinload(Employee.salaries))
            .where(Employee.id == employee_id, Employee.is_active.is_(True))
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_active_employee(self, employee_id: int) -> EmployeeRead | None:
        stmt = select(active_employees).where(active_employees.c.id == employee_id)
        result = await self._session.execute(stmt)
        row = result.mappings().first()
        return self._map_row(dict(row)) if row else None

    async def commit(self) -> None:
        await self._session.commit()

    def _apply_filters(
        self, stmt: Select[Any], search: str | None, department: str | None, country: str | None
    ) -> Select[Any]:
        if search:
            stmt = stmt.where(
                or_(
                    (active_employees.c.first_name + " " + active_employees.c.last_name).ilike(
                        f"%{search}%"
                    ),
                    active_employees.c.email.ilike(f"%{search}%"),
                )
            )
        if department:
            stmt = stmt.where(active_employees.c.department == department)
        if country:
            stmt = stmt.where(active_employees.c.country == country)
        return stmt

    async def list_paginated(
        self,
        offset: int,
        limit: int,
        search: str | None = None,
        department: str | None = None,
        country: str | None = None,
    ) -> list[EmployeeRead]:
        stmt = select(active_employees)
        stmt = self._apply_filters(stmt, search, department, country)
        stmt = stmt.order_by(active_employees.c.last_name, active_employees.c.first_name)
        stmt = stmt.offset(offset).limit(limit)

        result = await self._session.execute(stmt)
        return [self._map_row(dict(row)) for row in result.mappings()]

    async def count(
        self,
        search: str | None = None,
        department: str | None = None,
        country: str | None = None,
    ) -> int:
        stmt = select(func.count()).select_from(active_employees)
        stmt = self._apply_filters(stmt, search, department, country)
        result = await self._session.execute(stmt)
        return int(result.scalar_one())

    def _map_row(self, row_dict: dict[str, Any]) -> EmployeeRead:
        current_salary = None
        base_salary_minor_units = row_dict.get("base_salary_minor_units")

        if base_salary_minor_units is not None:
            current_salary = CurrentSalary(
                base_salary_minor_units=base_salary_minor_units,
                housing_allowance_minor_units=row_dict.get("housing_allowance_minor_units"),
                equity_minor_units=row_dict.get("equity_minor_units"),
                other_allowance_minor_units=row_dict.get("other_allowance_minor_units"),
                currency=row_dict["currency"],
                salary_usd_minor_units=row_dict["salary_usd_minor_units"],
                valid_from=row_dict["valid_from"],
            )

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
