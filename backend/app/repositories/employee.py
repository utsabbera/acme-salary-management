from sqlalchemy import RowMapping, text
from sqlalchemy.ext.asyncio import AsyncSession


class EmployeeRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def _where_clause(
        self,
        search: str | None,
        department: str | None,
        country: str | None,
    ) -> tuple[str, dict[str, str]]:
        """Build a WHERE clause string and matching params dict."""
        conditions: list[str] = []
        params: dict[str, str] = {}

        if search:
            conditions.append("(first_name || ' ' || last_name LIKE :search OR email LIKE :search)")
            params["search"] = f"%{search}%"

        if department:
            conditions.append("department = :department")
            params["department"] = department

        if country:
            conditions.append("country = :country")
            params["country"] = country

        where = ("WHERE " + " AND ".join(conditions)) if conditions else ""
        return where, params

    async def list_paginated(
        self,
        offset: int,
        limit: int,
        search: str | None = None,
        department: str | None = None,
        country: str | None = None,
    ) -> list[RowMapping]:
        where, params = self._where_clause(search, department, country)
        params["limit"] = str(limit)
        params["offset"] = str(offset)

        sql = text(
            f"""
            SELECT *
            FROM active_employees
            {where}
            ORDER BY last_name, first_name
            LIMIT :limit OFFSET :offset
            """
        )
        result = await self._session.execute(sql, params)
        return list(result.mappings())

    async def count(
        self,
        search: str | None = None,
        department: str | None = None,
        country: str | None = None,
    ) -> int:
        where, params = self._where_clause(search, department, country)
        sql = text(f"SELECT COUNT(*) FROM active_employees {where}")
        result = await self._session.execute(sql, params)
        return int(result.scalar_one())
