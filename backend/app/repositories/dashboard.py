from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.employee import active_employees
from app.schemas.dashboard import CountryTotal, DashboardStats, DepartmentAverage


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
                department=row.department, average_salary_usd_minor_units=int(row.avg_salary)
            )
            for row in result_dept.all()
        ]

        stmt_country = select(
            active_employees.c.country,
            func.sum(active_employees.c.salary_usd_minor_units).label("total_salary"),
        ).group_by(active_employees.c.country)
        result_country = await self._session.execute(stmt_country)

        country_totals = [
            CountryTotal(country=row.country, total_salary_usd_minor_units=int(row.total_salary))
            for row in result_country.all()
        ]

        return DashboardStats(
            department_averages=department_averages, country_totals=country_totals
        )
