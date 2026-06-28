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
from app.models.reference import Country, Currency, Department
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

COUNTRY_NAMES = {
    "USD": "United States",
    "EUR": "Germany",
    "GBP": "United Kingdom",
    "INR": "India",
    "CAD": "Canada",
    "AUD": "Australia",
    "JPY": "Japan",
    "BRL": "Brazil",
    "SGD": "Singapore",
    "MXN": "Mexico",
}

CURRENCY_NAMES = {
    "USD": "US Dollar",
    "EUR": "Euro",
    "GBP": "British Pound",
    "INR": "Indian Rupee",
    "CAD": "Canadian Dollar",
    "AUD": "Australian Dollar",
    "JPY": "Japanese Yen",
    "BRL": "Brazilian Real",
    "SGD": "Singapore Dollar",
    "MXN": "Mexican Peso",
}


def generate_salaries(
    employee: Employee, country_currency_id: int, currency_map: dict[str, int]
) -> list[Salary]:
    num_records = random.randint(1, 5)
    salaries = []

    current_date = date.today() - timedelta(days=random.randint(365, 3650))

    base_salary_usd = Decimal(random.randint(40_000, 150_000))
    currency_id = country_currency_id

    currency_code = [k for k, v in currency_map.items() if v == currency_id][0]
    rate = MOCK_FX_RATES[currency_code]

    current_salary_local = base_salary_usd / rate

    for i in range(num_records):
        is_last = i == num_records - 1
        next_date = current_date + timedelta(days=random.randint(365, 730))
        if next_date > date.today():
            is_last = True

        valid_to = next_date if not is_last else None

        total_salary_minor_units = int(current_salary_local * 100)

        base = int(total_salary_minor_units * 0.70)
        housing = int(total_salary_minor_units * 0.15)
        equity = int(total_salary_minor_units * 0.10)
        other = total_salary_minor_units - base - housing - equity

        salaries.append(
            Salary(
                employee_id=employee.id,
                base_salary_minor_units=base,
                housing_allowance_minor_units=housing,
                equity_minor_units=equity,
                other_allowance_minor_units=other,
                currency_id=currency_id,
                valid_from=current_date,
                valid_to=valid_to,
            )
        )

        if is_last:
            break

        raise_pct = Decimal(random.uniform(1.03, 1.15))
        current_salary_local = current_salary_local * raise_pct
        current_date = next_date

    return salaries


async def main(num_employees: int, verbose: bool = False) -> None:
    if not verbose:
        engine.echo = False
        if hasattr(engine, "sync_engine"):
            engine.sync_engine.echo = False
    logger.info(f"Starting seed script for {num_employees} employees...")

    async with async_session_factory() as session:
        logger.info("Clearing existing data...")
        await session.execute(delete(Salary))
        await session.execute(delete(Employee))
        await session.execute(delete(ExchangeRate))
        await session.execute(delete(Department))
        await session.execute(delete(Country))
        await session.execute(delete(Currency))
        await session.flush()

        logger.info("Inserting reference data...")
        currencies = []
        for code in COUNTRIES:
            currencies.append(
                Currency(code=code, name=CURRENCY_NAMES.get(code, f"{code} Currency"))
            )
        session.add_all(currencies)
        await session.flush()

        currency_map = {c.code: c.id for c in currencies}

        countries = []
        for code in COUNTRIES:
            countries.append(
                Country(
                    code=code[:2].upper(),
                    name=COUNTRY_NAMES.get(code, f"{code} Country"),
                    default_currency_id=currency_map[code],
                )
            )
        session.add_all(countries)
        await session.flush()

        country_map = {c.code: c.id for c in countries}
        country_currency_map = {c.id: c.default_currency_id for c in countries}

        departments = []
        for name in DEPARTMENTS:
            departments.append(Department(name=name))
        session.add_all(departments)
        await session.flush()

        department_map = {d.name: d.id for d in departments}

        logger.info("Inserting exchange rates...")
        rates = []
        for curr, rate in MOCK_FX_RATES.items():
            if curr != "USD":
                rates.append(
                    ExchangeRate(
                        currency=curr,
                        rate=rate,
                    )
                )
        session.add_all(rates)
        await session.flush()

        logger.info("Generating employee data...")
        employees_to_insert = []
        total_salaries = 0
        for _ in range(num_employees):
            country_code = random.choice(COUNTRIES)[:2].upper()
            country_id = country_map[country_code]

            employee = Employee(
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                email=fake.unique.email(),
                department_id=department_map[random.choice(DEPARTMENTS)],
                country_id=country_id,
                is_active=True,
            )
            employees_to_insert.append(employee)

        session.add_all(employees_to_insert)
        await session.flush()

        salaries = []
        for employee in employees_to_insert:
            employee_sals = generate_salaries(
                employee, country_currency_map[employee.country_id], currency_map
            )
            salaries.extend(employee_sals)
            total_salaries += len(employee_sals)

        logger.info(
            f"Generated {len(employees_to_insert)} employees and {total_salaries} salary records."
        )

        logger.info("Inserting salaries...")
        chunk_size = 2000
        for i in range(0, len(salaries), chunk_size):
            session.add_all(salaries[i : i + chunk_size])
            await session.flush()

        await session.commit()

    logger.info("Seeding complete!")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed the database with mock data.")
    parser.add_argument("--count", type=int, default=10000, help="Number of employees to generate")
    parser.add_argument("-v", "--verbose", action="store_true", help="Enable verbose SQL logging")
    args = parser.parse_args()
    asyncio.run(main(args.count, args.verbose))
