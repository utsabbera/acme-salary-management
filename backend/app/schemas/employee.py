from datetime import date, datetime
from typing import TypeVar

from pydantic import BaseModel, computed_field

from app.schemas.reference import CountryRead, CurrencyRead, DepartmentRead

T = TypeVar("T")


class SalaryBase(BaseModel):
    base_salary_minor_units: int
    housing_allowance_minor_units: int | None = None
    equity_minor_units: int | None = None
    other_allowance_minor_units: int | None = None
    currency: CurrencyRead

    @computed_field  # type: ignore[prop-decorator]
    @property
    def salary_minor_units(self) -> int:
        return (
            self.base_salary_minor_units
            + (self.housing_allowance_minor_units or 0)
            + (self.equity_minor_units or 0)
            + (self.other_allowance_minor_units or 0)
        )


class SalaryCreate(BaseModel):
    base_salary_minor_units: int
    housing_allowance_minor_units: int | None = None
    equity_minor_units: int | None = None
    other_allowance_minor_units: int | None = None
    currency_code: str
    valid_from: date


class CurrentSalary(SalaryBase):
    valid_from: date


class EmployeeRead(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    department: DepartmentRead
    country: CountryRead
    current_salary: CurrentSalary | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class EmployeeCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    department_id: int
    country_code: str


class EmployeeUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: str | None = None
    department_id: int | None = None
    country_code: str | None = None


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
    valid_from: date
    valid_to: date | None


class EmployeeDetailRead(EmployeeRead):
    salary_history: list[SalaryHistoryItem]
