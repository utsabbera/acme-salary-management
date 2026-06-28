from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Currency(Base):
    __tablename__ = "currencies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(3), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100))


class Country(Base):
    __tablename__ = "countries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(2), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    default_currency_id: Mapped[int] = mapped_column(ForeignKey("currencies.id"))

    default_currency: Mapped[Currency] = relationship("Currency")


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
