from datetime import date, datetime
from typing import TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class CurrentSalary(BaseModel):
    salary_minor_units: int
    currency: str
    salary_usd_minor_units: int
    valid_from: date


class EmployeeRead(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    department: str
    country: str
    current_salary: CurrentSalary | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class EmployeeCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    department: str
    country: str


class EmployeeUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: str | None = None
    department: str | None = None
    country: str | None = None


class PaginatedResponse[T](BaseModel):
    items: list[T]
    total: int
    offset: int
    limit: int

    @classmethod
    def build(cls, items: list[T], total: int, offset: int, limit: int) -> "PaginatedResponse[T]":
        return cls(
            items=items,
            total=total,
            offset=offset,
            limit=limit,
        )


class SalaryHistoryItem(BaseModel):
    salary_minor_units: int
    currency: str
    salary_usd_minor_units: int
    valid_from: date
    valid_to: date | None


class EmployeeDetailRead(EmployeeRead):
    salary_history: list[SalaryHistoryItem]
