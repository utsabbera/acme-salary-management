from pydantic import BaseModel, ConfigDict


class DepartmentAverage(BaseModel):
    department: str
    average_salary_usd_minor_units: int

    model_config = ConfigDict(from_attributes=True)


class CountryTotal(BaseModel):
    country: str
    total_salary_usd_minor_units: int

    model_config = ConfigDict(from_attributes=True)


class DashboardStats(BaseModel):
    department_averages: list[DepartmentAverage]
    country_totals: list[CountryTotal]
