from pydantic import BaseModel, ConfigDict


class DepartmentAverage(BaseModel):
    department: str
    average_salary_usd_minor_units: int

    model_config = ConfigDict(from_attributes=True)


class CountryTotal(BaseModel):
    country: str
    total_salary_usd_minor_units: int

    model_config = ConfigDict(from_attributes=True)


class ComponentTotals(BaseModel):
    base_salary_usd_minor_units: int
    housing_allowance_usd_minor_units: int
    equity_usd_minor_units: int
    other_allowance_usd_minor_units: int

    model_config = ConfigDict(from_attributes=True)


class DepartmentSalaryDistribution(BaseModel):
    department: str
    p25_salary_usd_minor_units: int
    p50_salary_usd_minor_units: int
    p75_salary_usd_minor_units: int

    model_config = ConfigDict(from_attributes=True)


class DashboardStats(BaseModel):
    department_averages: list[DepartmentAverage]
    country_totals: list[CountryTotal]
    component_totals: ComponentTotals
    salary_distribution: list[DepartmentSalaryDistribution]
