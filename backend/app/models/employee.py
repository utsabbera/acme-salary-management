from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID

from uuid6 import uuid7

if TYPE_CHECKING:
    from app.models.salary import Salary

from sqlalchemy import Boolean, DateTime, String, column, func, table
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid7)
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    department: Mapped[str] = mapped_column(String(100))
    country: Mapped[str] = mapped_column(String(100))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    salaries: Mapped[list["Salary"]] = relationship(
        "Salary", back_populates="employee", cascade="all, delete-orphan"
    )


active_employees = table(
    "active_employees",
    column("id"),
    column("first_name"),
    column("last_name"),
    column("email"),
    column("department"),
    column("country"),
    column("salary"),
    column("currency"),
    column("salary_usd"),
    column("valid_from"),
    column("created_at"),
    column("updated_at"),
)
