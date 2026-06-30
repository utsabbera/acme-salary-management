import argparse
import asyncio
import csv
import random
from datetime import date, datetime, timedelta
from decimal import Decimal

import structlog
from faker import Faker
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session_factory, engine
from app.core.logger import setup_logging
from app.models.employee import Employee
from app.models.exchange_rate import ExchangeRate
from app.models.reference import Country, Currency, Department
from app.models.salary import Salary

setup_logging()
logger = structlog.get_logger(__name__)

fake = Faker()


def get_salary_range_for_department(department_name: str) -> tuple[int, int]:
    ranges = {
        "Engineering": (60_000, 160_000),
        "Sales": (50_000, 150_000),
        "Operations": (40_000, 120_000),
        "Finance": (50_000, 140_000),
        "Marketing": (45_000, 130_000),
        "HR": (45_000, 125_000),
    }
    return ranges.get(department_name, (40_000, 150_000))


def generate_salaries(
    employee: Employee,
    department_name: str,
    country_currency_id: int,
    currency_map: dict[str, int],
    fx_rates: dict[str, Decimal],
) -> list[Salary]:
    num_records = random.randint(1, 5)
    salaries = []

    current_date = date.today() - timedelta(days=random.randint(365, 3650))
    min_sal, max_sal = get_salary_range_for_department(department_name)
    base_salary_usd = Decimal(random.randint(min_sal, max_sal))
    currency_id = country_currency_id

    currency_code = [k for k, v in currency_map.items() if v == currency_id][0]
    rate = fx_rates.get(currency_code, Decimal("1.0"))

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


async def seed_employees(
    csv_path: str | None = None,
    random_flag: bool = False,
    count: int = 10000,
    verbose: bool = False,
    session: AsyncSession | None = None,
) -> None:
    if not csv_path and not random_flag:
        logger.error("You must provide a CSV path or use the --random flag.")
        sys.exit(1)

    if not verbose:
        engine.echo = False
        if hasattr(engine, "sync_engine"):
            engine.sync_engine.echo = False

    logger.info("Starting employee seed script...")

    if session is None:
        async with async_session_factory() as new_session:
            await _run_seed_employees(new_session, csv_path, random_flag, count)
    else:
        await _run_seed_employees(session, csv_path, random_flag, count)


async def _run_seed_employees(
    session: AsyncSession, csv_path: str | None, random_flag: bool, count: int
) -> None:
    departments_res = await session.execute(select(Department))
    department_map = {d.name: d.id for d in departments_res.scalars().all()}

    countries_res = await session.execute(select(Country))
    countries = list(countries_res.scalars().all())
    country_map = {c.code: c.id for c in countries}
    country_currency_map = {c.id: c.default_currency_id for c in countries}

    currencies_res = await session.execute(select(Currency))
    currency_map = {c.code: c.id for c in currencies_res.scalars().all()}

    fx_res = await session.execute(select(ExchangeRate))
    fx_rates: dict[str, Decimal] = {
        fx.currency: Decimal(str(fx.rate)) for fx in fx_res.scalars().all()
    }
    fx_rates["USD"] = Decimal("1.0")

    if not department_map or not country_map:
        logger.error(
            "Reference data missing. Please run 'uv run python scripts/seed/reference.py' first."
        )
        return

    logger.info("Clearing existing employees and salaries...")
    await session.execute(delete(Salary))
    await session.execute(delete(Employee))
    await session.flush()

    if not random_flag and csv_path:
        logger.info(f"Importing employees from {csv_path}...")
        employees_to_insert: list[Employee] = []

        with open(csv_path, encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                dept_id = department_map.get(row["department_name"])
                country_id = country_map.get(row["country_code"].upper())

                if not dept_id or not country_id:
                    logger.warning(f"Skipping row due to invalid department or country: {row}")
                    continue

                employee = Employee(
                    first_name=row["first_name"],
                    last_name=row["last_name"],
                    email=row["email"],
                    department_id=dept_id,
                    country_id=country_id,
                    is_active=True,
                )
                session.add(employee)
                await session.flush()

                curr_id = country_currency_map[country_id]
                valid_from_date = datetime.strptime(row["valid_from"], "%Y-%m-%d").date()

                salary = Salary(
                    employee_id=employee.id,
                    base_salary_minor_units=int(float(row["base_salary_local"]) * 100),
                    housing_allowance_minor_units=int(
                        float(row.get("housing_allowance_local", 0)) * 100
                    ),
                    equity_minor_units=int(float(row.get("equity_local", 0)) * 100),
                    other_allowance_minor_units=int(
                        float(row.get("other_allowance_local", 0)) * 100
                    ),
                    currency_id=curr_id,
                    valid_from=valid_from_date,
                    valid_to=None,
                )
                session.add(salary)

        await session.commit()
        logger.info("CSV import complete!")
    elif random_flag:
        logger.info(f"Generating {count} fake employees...")
        employees_to_insert = []
        total_salaries = 0

        country_codes = list(country_map.keys())
        department_names = list(department_map.keys())
        generated_emails = set()

        for _ in range(count):
            country_code = random.choice(country_codes)
            country_id = country_map[country_code]

            first_name = fake.first_name()
            last_name = fake.last_name()

            base_email_prefix = f"{first_name.lower()}.{last_name.lower()}"
            email_prefix = base_email_prefix
            counter = 1
            while f"{email_prefix}@acme.com" in generated_emails:
                email_prefix = f"{base_email_prefix}{counter}"
                counter += 1

            email = f"{email_prefix}@acme.com"
            generated_emails.add(email)

            employee = Employee(
                first_name=first_name,
                last_name=last_name,
                email=email,
                department_id=department_map[random.choice(department_names)],
                country_id=country_id,
                is_active=True,
            )
            employees_to_insert.append(employee)

        session.add_all(employees_to_insert)
        await session.flush()

        department_id_to_name = {v: k for k, v in department_map.items()}

        salaries = []
        for employee in employees_to_insert:
            employee_sals = generate_salaries(
                employee,
                department_id_to_name[employee.department_id],
                country_currency_map[employee.country_id],
                currency_map,
                fx_rates,
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
        logger.info("Fake data generation complete!")


if __name__ == "__main__":
    import sys

    parser = argparse.ArgumentParser(description="Seed the database with employee data.")
    parser.add_argument(
        "csv_path",
        type=str,
        nargs="?",
        default=None,
        help="Path to employee CSV file (required unless --random is used)",
    )
    parser.add_argument(
        "--random", action="store_true", help="Generate random data instead of using a CSV"
    )
    parser.add_argument(
        "--count",
        type=int,
        default=10000,
        help="Number of employees to generate when --random is used",
    )
    parser.add_argument("-v", "--verbose", action="store_true", help="Enable verbose SQL logging")
    args = parser.parse_args()
    asyncio.run(seed_employees(args.csv_path, args.random, args.count, args.verbose))
