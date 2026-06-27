import argparse
import asyncio
import random
from datetime import date, timedelta
from decimal import Decimal

import structlog
from faker import Faker
from sqlalchemy import delete

from app.core.database import async_session_factory, engine
from app.core.logger import setup_logging
from app.models.employee import Employee
from app.models.exchange_rate import ExchangeRate
from app.models.salary import Salary

setup_logging()
logger = structlog.get_logger(__name__)

fake = Faker()

MOCK_FX_RATES = {
    "USD": Decimal("1.0"),
    "EUR": Decimal("1.08"),
    "GBP": Decimal("1.27"),
    "INR": Decimal("0.012"),
    "CAD": Decimal("0.74"),
    "AUD": Decimal("0.65"),
    "JPY": Decimal("0.0067"),
    "BRL": Decimal("0.19"),
    "SGD": Decimal("0.74"),
    "MXN": Decimal("0.058"),
}

DEPARTMENTS = ["Engineering", "Sales", "HR", "Finance", "Marketing", "Operations"]
COUNTRIES = list(MOCK_FX_RATES.keys())


def generate_salaries(employee: Employee) -> list[Salary]:
    num_records = random.randint(1, 5)
    salaries = []

    current_date = date.today() - timedelta(
        days=random.randint(365, 3650)
    )  # between 1 and 10 years ago

    base_salary_usd = Decimal(random.randint(40_000, 150_000))
    currency = employee.country
    rate = MOCK_FX_RATES[currency]

    current_salary_local = base_salary_usd / rate

    for i in range(num_records):
        is_last = i == num_records - 1
        next_date = current_date + timedelta(
            days=random.randint(365, 730)
        )  # 1 to 2 years after current
        if next_date > date.today():
            is_last = True

        valid_to = next_date if not is_last else None

        salary_minor_units = int(current_salary_local * 100)
        salary_usd_minor_units = int(current_salary_local * rate * 100)

        salaries.append(
            Salary(
                employee_id=employee.id,
                salary_minor_units=salary_minor_units,
                currency=currency,
                salary_usd_minor_units=salary_usd_minor_units,
                valid_from=current_date,
                valid_to=valid_to,
            )
        )

        if is_last:
            break

        assert valid_to is not None
        raise_pct = Decimal(random.uniform(1.03, 1.15))  # 3% to 15% raise
        current_salary_local = current_salary_local * raise_pct
        current_date = valid_to

    return salaries


async def main(num_employees: int, verbose: bool = False) -> None:
    if not verbose:
        engine.echo = False
        if hasattr(engine, "sync_engine"):
            engine.sync_engine.echo = False
    logger.info(f"Starting seed script for {num_employees} employees...")

    employees_to_insert = []
    total_salaries = 0

    for _ in range(num_employees):
        currency = random.choice(COUNTRIES)
        employee = Employee(
            first_name=fake.first_name(),
            last_name=fake.last_name(),
            email=fake.unique.email(),
            department=random.choice(DEPARTMENTS),
            country=currency,
        )
        employee.salaries = generate_salaries(employee)
        total_salaries += len(employee.salaries)
        employees_to_insert.append(employee)

    logger.info(
        f"Generated {len(employees_to_insert)} employees and {total_salaries} salary records."
    )

    async with async_session_factory() as session:
        logger.info("Clearing existing data...")
        await session.execute(delete(Salary))
        await session.execute(delete(Employee))
        await session.execute(delete(ExchangeRate))
        await session.flush()

        logger.info("Inserting exchange rates...")
        rates = []
        for curr, rate in MOCK_FX_RATES.items():
            rates.append(
                ExchangeRate(
                    currency=curr,
                    rate=rate,
                    valid_from=date(2020, 1, 1),
                )
            )
        session.add_all(rates)
        await session.flush()

        logger.info("Inserting employees and their salaries...")
        # Insert in chunks to avoid memory issues
        chunk_size = 2000
        for i in range(0, len(employees_to_insert), chunk_size):
            session.add_all(employees_to_insert[i : i + chunk_size])
            await session.flush()

        await session.commit()

    logger.info("Seeding complete!")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed the database with mock data.")
    parser.add_argument("--count", type=int, default=10000, help="Number of employees to generate")
    parser.add_argument("-v", "--verbose", action="store_true", help="Enable verbose SQL logging")
    args = parser.parse_args()
    asyncio.run(main(args.count, args.verbose))
