from datetime import date, datetime
from decimal import Decimal
from typing import TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class EmployeeRead(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    department: str
    country: str
    salary: Decimal
    currency: str
    salary_usd: Decimal
    valid_from: date
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


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
