from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.employee import Employee, active_employees
from app.models.exchange_rate import ExchangeRate
from app.models.reference import Currency
from app.models.salary import Salary
from app.schemas.dashboard import (
    ComponentTotals,
    CountryTotal,
    DashboardStats,
    DepartmentAverage,
    DepartmentSalaryDistribution,
)


class DashboardRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_stats(self) -> DashboardStats:
        stmt_dept = select(
            active_employees.c.department_name.label("department"),
            func.round(func.avg(active_employees.c.salary_usd_minor_units)).label("avg_salary"),
        ).group_by(active_employees.c.department_name)
        result_dept = await self._session.execute(stmt_dept)

        department_averages = [
            DepartmentAverage(
                department=row.department, average_salary_usd_minor_units=int(row.avg_salary or 0)
            )
            for row in result_dept.all()
        ]

        stmt_country = select(
            active_employees.c.country_name.label("country"),
            func.sum(active_employees.c.salary_usd_minor_units).label("total_salary"),
        ).group_by(active_employees.c.country_name)
        result_country = await self._session.execute(stmt_country)

        country_totals = [
            CountryTotal(
                country=row.country, total_salary_usd_minor_units=int(row.total_salary or 0)
            )
            for row in result_country.all()
        ]

        stmt_components = (
            select(
                func.sum(
                    case(
                        (Currency.code == "USD", Salary.base_salary_minor_units),
                        (
                            ExchangeRate.rate.is_not(None),
                            Salary.base_salary_minor_units / ExchangeRate.rate,
                        ),
                        else_=None,
                    )
                ).label("base"),
                func.sum(
                    case(
                        (
                            Currency.code == "USD",
                            func.coalesce(Salary.housing_allowance_minor_units, 0),
                        ),
                        (
                            ExchangeRate.rate.is_not(None),
                            func.coalesce(Salary.housing_allowance_minor_units, 0)
                            / ExchangeRate.rate,
                        ),
                        else_=None,
                    )
                ).label("housing"),
                func.sum(
                    case(
                        (Currency.code == "USD", func.coalesce(Salary.equity_minor_units, 0)),
                        (
                            ExchangeRate.rate.is_not(None),
                            func.coalesce(Salary.equity_minor_units, 0) / ExchangeRate.rate,
                        ),
                        else_=None,
                    )
                ).label("equity"),
                func.sum(
                    case(
                        (
                            Currency.code == "USD",
                            func.coalesce(Salary.other_allowance_minor_units, 0),
                        ),
                        (
                            ExchangeRate.rate.is_not(None),
                            func.coalesce(Salary.other_allowance_minor_units, 0)
                            / ExchangeRate.rate,
                        ),
                        else_=None,
                    )
                ).label("other"),
            )
            .select_from(Salary)
            .join(Employee, Salary.employee_id == Employee.id)
            .join(Currency, Salary.currency_id == Currency.id)
            .outerjoin(ExchangeRate, (Currency.code == ExchangeRate.currency))
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
            active_employees.c.department_name.label("department"),
            active_employees.c.salary_usd_minor_units,
        ).where(active_employees.c.salary_usd_minor_units.is_not(None))

        result_dist = await self._session.execute(stmt_dist)

        from collections import defaultdict

        salaries_by_dept = defaultdict(list)
        for row in result_dist.all():
            salaries_by_dept[row.department].append(row.salary_usd_minor_units)

        def get_percentile(sorted_data: list[int], percentile: float) -> int:
            if not sorted_data:
                return 0
            index = percentile * (len(sorted_data) - 1)
            lower = int(index)
            upper = lower + 1 if lower < len(sorted_data) - 1 else lower
            weight = index - lower
            return int(sorted_data[lower] * (1 - weight) + sorted_data[upper] * weight)

        salary_distribution = []
        for dept, salaries in salaries_by_dept.items():
            salaries.sort()
            salary_distribution.append(
                DepartmentSalaryDistribution(
                    department=dept,
                    p25_salary_usd_minor_units=get_percentile(salaries, 0.25),
                    p50_salary_usd_minor_units=get_percentile(salaries, 0.50),
                    p75_salary_usd_minor_units=get_percentile(salaries, 0.75),
                )
            )

        return DashboardStats(
            department_averages=department_averages,
            country_totals=country_totals,
            component_totals=component_totals,
            salary_distribution=salary_distribution,
        )
