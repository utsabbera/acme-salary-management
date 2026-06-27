from datetime import date, datetime
from typing import TypeVar

from pydantic import BaseModel, computed_field

T = TypeVar("T")


class SalaryBase(BaseModel):
    base_salary_minor_units: int
    housing_allowance_minor_units: int | None = None
    equity_minor_units: int | None = None
    other_allowance_minor_units: int | None = None
    currency: str

    @computed_field  # type: ignore[prop-decorator]
    @property
    def salary_minor_units(self) -> int:
        return (
            self.base_salary_minor_units
            + (self.housing_allowance_minor_units or 0)
            + (self.equity_minor_units or 0)
            + (self.other_allowance_minor_units or 0)
        )


class SalaryCreate(SalaryBase):
    valid_from: date


class CurrentSalary(SalaryBase):
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


class SalaryHistoryItem(SalaryBase):
    salary_usd_minor_units: int
    valid_from: date
    valid_to: date | None


class EmployeeDetailRead(EmployeeRead):
    salary_history: list[SalaryHistoryItem]
