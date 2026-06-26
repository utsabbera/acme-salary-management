from app.repositories.employee import EmployeeRepository
from app.schemas.employee import EmployeeRead, PaginatedResponse


class EmployeeService:
    def __init__(self, repo: EmployeeRepository) -> None:
        self._repo = repo

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
