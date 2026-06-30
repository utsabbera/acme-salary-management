from datetime import date, datetime
from typing import TypeVar

from pydantic import BaseModel, EmailStr, Field, computed_field, model_validator

from app.schemas.reference import CountryRead, CurrencyRead, DepartmentRead

T = TypeVar("T")


class SalaryBase(BaseModel):
    base_salary_minor_units: int = Field(gt=0)
    housing_allowance_minor_units: int | None = Field(default=None, ge=0)
    equity_minor_units: int | None = Field(default=None, ge=0)
    other_allowance_minor_units: int | None = Field(default=None, ge=0)
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
    base_salary_minor_units: int = Field(gt=0)
    housing_allowance_minor_units: int | None = Field(default=None, ge=0)
    equity_minor_units: int | None = Field(default=None, ge=0)
    other_allowance_minor_units: int | None = Field(default=None, ge=0)
    currency_code: str = Field(min_length=3, max_length=3, pattern=r"^[A-Z]{3}$")
    valid_from: date

    @model_validator(mode="after")
    def validate_valid_from(self) -> "SalaryCreate":
        if self.valid_from < date(2000, 1, 1):
            raise ValueError("valid_from cannot be before company founding date (2000-01-01)")
        return self


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
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    department_id: int = Field(gt=0)
    country_code: str = Field(min_length=2, max_length=2, pattern=r"^[A-Z]{2}$")


class EmployeeUpdate(BaseModel):
    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    email: EmailStr | None = None
    department_id: int | None = Field(default=None, gt=0)
    country_code: str | None = Field(
        default=None,
        min_length=2,
        max_length=2,
        pattern=r"^[A-Z]{2}$",
    )


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
