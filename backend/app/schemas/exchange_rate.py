from pydantic import BaseModel


class ExchangeRateCreate(BaseModel):
    currency: str
    rate: float


class ExchangeRateRead(BaseModel):
    id: int
    currency: str
    rate: float

    model_config = {"from_attributes": True}
