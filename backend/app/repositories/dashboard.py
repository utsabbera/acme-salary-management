from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.employee import Employee, active_employees
from app.models.exchange_rate import ExchangeRate
from app.models.salary import Salary
from app.schemas.dashboard import (
    ComponentTotals,
    CountryTotal,
    DashboardStats,
    DepartmentAverage,
    EmployeeSalaryPoint,
)


class DashboardRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_stats(self) -> DashboardStats:
        stmt_dept = select(
            active_employees.c.department,
            func.round(func.avg(active_employees.c.salary_usd_minor_units)).label("avg_salary"),
        ).group_by(active_employees.c.department)
        result_dept = await self._session.execute(stmt_dept)

        department_averages = [
            DepartmentAverage(
                department=row.department, average_salary_usd_minor_units=int(row.avg_salary or 0)
            )
            for row in result_dept.all()
        ]

        stmt_country = select(
            active_employees.c.country,
            func.sum(active_employees.c.salary_usd_minor_units).label("total_salary"),
        ).group_by(active_employees.c.country)
        result_country = await self._session.execute(stmt_country)

        country_totals = [
            CountryTotal(
                country=row.country, total_salary_usd_minor_units=int(row.total_salary or 0)
            )
            for row in result_country.all()
        ]

        stmt_components = (
            select(
                func.sum(Salary.base_salary_minor_units * ExchangeRate.rate).label("base"),
                func.sum(
                    func.coalesce(Salary.housing_allowance_minor_units, 0) * ExchangeRate.rate
                ).label("housing"),
                func.sum(func.coalesce(Salary.equity_minor_units, 0) * ExchangeRate.rate).label(
                    "equity"
                ),
                func.sum(
                    func.coalesce(Salary.other_allowance_minor_units, 0) * ExchangeRate.rate
                ).label("other"),
            )
            .select_from(Salary)
            .join(ExchangeRate, Salary.exchange_rate_id == ExchangeRate.id)
            .join(Employee, Salary.employee_id == Employee.id)
            .where(Employee.is_active, Salary.valid_to.is_(None))
        )
        result_components = await self._session.execute(stmt_components)
        row_components = result_components.first()

        component_totals = ComponentTotals(
            base_salary_usd_minor_units=int(row_components.base or 0) if row_components else 0,
            housing_allowance_usd_minor_units=int(row_components.housing or 0)
            if row_components
            else 0,
            equity_usd_minor_units=int(row_components.equity or 0) if row_components else 0,
            other_allowance_usd_minor_units=int(row_components.other or 0) if row_components else 0,
        )

        stmt_dist = select(
            active_employees.c.department,
            active_employees.c.salary_usd_minor_units,
        ).where(active_employees.c.salary_usd_minor_units.is_not(None))
        result_dist = await self._session.execute(stmt_dist)

        salary_distribution = [
            EmployeeSalaryPoint(
                department=row.department, salary_usd_minor_units=int(row.salary_usd_minor_units)
            )
            for row in result_dist.all()
        ]

        return DashboardStats(
            department_averages=department_averages,
            country_totals=country_totals,
            component_totals=component_totals,
            salary_distribution=salary_distribution,
        )
