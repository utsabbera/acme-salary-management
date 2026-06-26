from fastapi import APIRouter, Query

from app.core.deps import DbDep
from app.repositories.employee import EmployeeRepository
from app.schemas.employee import EmployeeRead, PaginatedResponse
from app.services.employee import EmployeeService

router = APIRouter(prefix="/employees", tags=["employees"])


@router.get("", response_model=PaginatedResponse[EmployeeRead])
async def list_employees(
    db: DbDep,
    offset: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(20, ge=1, le=100, description="Max items to return (max 100)"),
    search: str | None = Query(None, description="Search by name or email"),
    department: str | None = Query(None, description="Filter by department"),
    country: str | None = Query(None, description="Filter by country"),
) -> PaginatedResponse[EmployeeRead]:
    service = EmployeeService(EmployeeRepository(db))
    return await service.list_employees(
        offset=offset,
        limit=limit,
        search=search,
        department=department,
        country=country,
    )
