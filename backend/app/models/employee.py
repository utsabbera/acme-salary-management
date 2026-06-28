from datetime import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.reference import Country, Department
    from app.models.salary import Salary

from sqlalchemy import Boolean, DateTime, ForeignKey, String, column, func, table
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(primary_key=True)
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    department_id: Mapped[int] = mapped_column(ForeignKey("departments.id"))
    country_id: Mapped[int] = mapped_column(ForeignKey("countries.id"))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    salaries: Mapped[list["Salary"]] = relationship(
        "Salary", back_populates="employee", cascade="all, delete-orphan"
    )
    department: Mapped["Department"] = relationship("Department")
    country: Mapped["Country"] = relationship("Country")


active_employees = table(
    "active_employees",
    column("id"),
    column("first_name"),
    column("last_name"),
    column("email"),
    column("department_id"),
    column("department_name"),
    column("country_id"),
    column("country_code"),
    column("country_name"),
    column("country_default_currency_id"),
    column("country_default_currency_code"),
    column("country_default_currency_name"),
    column("base_salary_minor_units"),
    column("housing_allowance_minor_units"),
    column("equity_minor_units"),
    column("other_allowance_minor_units"),
    column("salary_minor_units"),
    column("currency_id"),
    column("currency_code"),
    column("currency_name"),
    column("salary_usd_minor_units"),
    column("valid_from"),
    column("created_at"),
    column("updated_at"),
)
