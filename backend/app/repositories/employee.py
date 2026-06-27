from typing import Any

from sqlalchemy import RowMapping, Select, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.employee import Employee, active_employees


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

    async def get_active_employee(self, employee_id: int) -> RowMapping | None:
        stmt = select(active_employees).where(active_employees.c.id == employee_id)
        result = await self._session.execute(stmt)
        return result.mappings().first()

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
    ) -> list[RowMapping]:
        stmt = select(active_employees)
        stmt = self._apply_filters(stmt, search, department, country)
        stmt = stmt.order_by(active_employees.c.last_name, active_employees.c.first_name)
        stmt = stmt.offset(offset).limit(limit)

        result = await self._session.execute(stmt)
        return list(result.mappings())

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
