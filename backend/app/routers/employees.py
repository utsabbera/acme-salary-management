from fastapi import APIRouter, Query

from app.core.deps import DbDep
from app.repositories.employee import EmployeeRepository
from app.schemas.employee import (
    EmployeeCreate,
    EmployeeDetailRead,
    EmployeeRead,
    EmployeeUpdate,
    PaginatedResponse,
    SalaryCreate,
)
from app.services.employee import EmployeeService

router = APIRouter(prefix="/employees", tags=["employees"])


@router.get("", response_model=PaginatedResponse[EmployeeRead])
async def list_employees(
    db: DbDep,
    offset: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(20, ge=1, le=100, description="Max items to return (max 100)"),
    search: str | None = Query(None, description="Search by name or email"),
    department_id: int | None = Query(None, description="Filter by department ID"),
    country_id: int | None = Query(None, description="Filter by country ID"),
) -> PaginatedResponse[EmployeeRead]:
    service = EmployeeService(EmployeeRepository(db))
    return await service.list_employees(
        offset=offset,
        limit=limit,
        search=search,
        department_id=department_id,
        country_id=country_id,
    )


@router.get("/{employee_id}", response_model=EmployeeDetailRead)
async def get_employee(
    employee_id: int,
    db: DbDep,
) -> EmployeeDetailRead:
    service = EmployeeService(EmployeeRepository(db))
    return await service.get_employee(employee_id)


@router.post("", response_model=EmployeeRead, status_code=201)
async def create_employee(
    data: EmployeeCreate,
    db: DbDep,
) -> EmployeeRead:
    service = EmployeeService(EmployeeRepository(db))
    return await service.create_employee(data)


@router.patch("/{employee_id}", response_model=EmployeeRead)
async def update_employee(
    employee_id: int,
    data: EmployeeUpdate,
    db: DbDep,
) -> EmployeeRead:
    service = EmployeeService(EmployeeRepository(db))
    return await service.update_employee(employee_id, data)


@router.delete("/{employee_id}", status_code=204)
async def delete_employee(
    employee_id: int,
    db: DbDep,
) -> None:
    service = EmployeeService(EmployeeRepository(db))
    await service.delete_employee(employee_id)


@router.post("/{employee_id}/salaries", response_model=EmployeeDetailRead, status_code=201)
async def add_salary_adjustment(
    employee_id: int,
    data: SalaryCreate,
    db: DbDep,
) -> EmployeeDetailRead:
    service = EmployeeService(EmployeeRepository(db))
    return await service.add_salary_adjustment(employee_id, data)
