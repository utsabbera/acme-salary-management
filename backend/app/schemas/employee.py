from datetime import date, datetime
from decimal import Decimal
from math import ceil
from typing import TypeVar
from uuid import UUID

from pydantic import BaseModel

T = TypeVar("T")


class EmployeeRead(BaseModel):
    id: UUID
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
    page: int
    size: int
    total_pages: int

    @classmethod
    def build(cls, items: list[T], total: int, page: int, size: int) -> "PaginatedResponse[T]":
        return cls(
            items=items,
            total=total,
            page=page,
            size=size,
            total_pages=ceil(total / size) if size > 0 else 0,
        )
