from pydantic import BaseModel


class CurrencyRead(BaseModel):
    id: int
    code: str
    name: str

    model_config = {"from_attributes": True}


class CountryRead(BaseModel):
    id: int
    code: str
    name: str
    default_currency: CurrencyRead

    model_config = {"from_attributes": True}


class DepartmentRead(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}
