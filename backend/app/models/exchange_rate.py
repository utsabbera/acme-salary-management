from sqlalchemy import Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ExchangeRate(Base):
    __tablename__ = "exchange_rates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    currency: Mapped[str] = mapped_column(String(3), index=True, unique=True)
    rate: Mapped[float] = mapped_column(Numeric(10, 4))
