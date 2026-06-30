import argparse
import asyncio
import csv
import sys
from pathlib import Path

import structlog
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session_factory, engine
from app.core.logger import setup_logging
from app.models.employee import Employee
from app.models.exchange_rate import ExchangeRate
from app.models.reference import Country, Currency, Department
from app.models.salary import Salary

setup_logging()
logger = structlog.get_logger(__name__)


async def seed_reference(
    countries_csv: str,
    departments_csv: str,
    verbose: bool = False,
    session: AsyncSession | None = None,
) -> None:
    if not verbose:
        engine.echo = False
        if hasattr(engine, "sync_engine"):
            engine.sync_engine.echo = False

    logger.info("Starting reference data seed script...")

    countries_path = Path(countries_csv)
    departments_path = Path(departments_csv)

    if not countries_path.exists():
        logger.error(f"Countries CSV not found: {countries_csv}")
        sys.exit(1)

    if not departments_path.exists():
        logger.error(f"Departments CSV not found: {departments_csv}")
        sys.exit(1)

    countries_data = []
    currencies_dict = {}
    with open(countries_path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            currencies_dict[row["currency_code"]] = row["currency_name"]
            countries_data.append(
                {
                    "code": row["country_code"].upper(),
                    "name": row["country_name"],
                    "currency_code": row["currency_code"],
                }
            )

    departments_data = []
    with open(departments_path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            departments_data.append(row["name"])

    if session is None:
        async with async_session_factory() as new_session:
            await _run_seed(new_session, countries_data, currencies_dict, departments_data)
    else:
        await _run_seed(session, countries_data, currencies_dict, departments_data)

    logger.info("Reference data seeding complete!")


async def _run_seed(
    session: AsyncSession,
    countries_data: list[dict[str, str]],
    currencies_dict: dict[str, str],
    departments_data: list[str],
) -> None:
    logger.info("Clearing all existing data to prevent foreign key violations...")
    await session.execute(delete(Salary))
    await session.execute(delete(Employee))
    await session.execute(delete(ExchangeRate))
    await session.execute(delete(Department))
    await session.execute(delete(Country))
    await session.execute(delete(Currency))
    await session.flush()

    logger.info("Inserting currencies...")
    currencies = []
    for code, name in currencies_dict.items():
        currencies.append(Currency(code=code, name=name))
    session.add_all(currencies)
    await session.flush()

    currency_map = {c.code: c.id for c in currencies}

    logger.info("Inserting countries...")
    countries_models = []
    for data in countries_data:
        countries_models.append(
            Country(
                code=data["code"],
                name=data["name"],
                default_currency_id=currency_map[data["currency_code"]],
            )
        )
    session.add_all(countries_models)

    logger.info("Inserting departments...")
    departments_models = []
    for name in departments_data:
        departments_models.append(Department(name=name))
    session.add_all(departments_models)

    await session.commit()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Seed the database with reference data (Countries, Currencies, Departments)."
    )
    parser.add_argument("countries_csv", type=str, help="Path to countries CSV file")
    parser.add_argument("departments_csv", type=str, help="Path to departments CSV file")
    parser.add_argument("-v", "--verbose", action="store_true", help="Enable verbose SQL logging")
    args = parser.parse_args()
    asyncio.run(seed_reference(args.countries_csv, args.departments_csv, args.verbose))
