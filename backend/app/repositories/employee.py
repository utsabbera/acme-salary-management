from typing import Any

from sqlalchemy import RowMapping, Select, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.employee import active_employees


class EmployeeRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

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
