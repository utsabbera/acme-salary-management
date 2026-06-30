from pydantic import BaseModel, Field


class ExchangeRateCreate(BaseModel):
    currency: str = Field(min_length=3, max_length=3, pattern=r"^[A-Z]{3}$")
    rate: float = Field(gt=0)


class ExchangeRateRead(BaseModel):
    id: int
    currency: str
    rate: float

    model_config = {"from_attributes": True}
