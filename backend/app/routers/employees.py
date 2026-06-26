from fastapi import APIRouter, Query

from app.core.deps import DbDep
from app.repositories.employee import EmployeeRepository
from app.schemas.employee import EmployeeRead, PaginatedResponse
from app.services.employee import EmployeeService

router = APIRouter(prefix="/employees", tags=["employees"])


@router.get("", response_model=PaginatedResponse[EmployeeRead])
async def list_employees(
    db: DbDep,
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    size: int = Query(20, ge=1, le=100, description="Items per page (max 100)"),
    search: str | None = Query(None, description="Search by name or email"),
    department: str | None = Query(None, description="Filter by department"),
    country: str | None = Query(None, description="Filter by country"),
) -> PaginatedResponse[EmployeeRead]:
    service = EmployeeService(EmployeeRepository(db))
    return await service.list_employees(
        page=page,
        size=size,
        search=search,
        department=department,
        country=country,
    )
