from datetime import date
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.employee import Employee

from sqlalchemy import BigInteger, Date, ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Salary(Base):
    __tablename__ = "salaries"

    __table_args__ = (Index("ix_salaries_employee_id_valid_to", "employee_id", "valid_to"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id"))

    base_salary_minor_units: Mapped[int] = mapped_column(BigInteger)
    housing_allowance_minor_units: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    equity_minor_units: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    other_allowance_minor_units: Mapped[int | None] = mapped_column(BigInteger, nullable=True)

    currency: Mapped[str] = mapped_column(String(3))

    valid_from: Mapped[date] = mapped_column(Date)
    valid_to: Mapped[date | None] = mapped_column(Date, nullable=True)

    employee: Mapped["Employee"] = relationship("Employee", back_populates="salaries")
