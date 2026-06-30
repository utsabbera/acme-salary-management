import argparse
import asyncio
import csv
import sys
from decimal import Decimal
from pathlib import Path

import structlog
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session_factory, engine
from app.core.logger import setup_logging
from app.models.exchange_rate import ExchangeRate

setup_logging()
logger = structlog.get_logger(__name__)


async def seed_fx(
    csv_path: str, verbose: bool = False, session: AsyncSession | None = None
) -> None:
    if not verbose:
        engine.echo = False
        if hasattr(engine, "sync_engine"):
            engine.sync_engine.echo = False

    logger.info("Starting FX rates seed script...")

    path = Path(csv_path)
    if not path.exists():
        logger.error(f"FX CSV not found: {csv_path}")
        sys.exit(1)

    rates_data = {}
    with open(path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rates_data[row["currency_code"]] = Decimal(row["rate"])

    if session is None:
        async with async_session_factory() as new_session:
            await _run_seed_fx(new_session, rates_data)
    else:
        await _run_seed_fx(session, rates_data)

    logger.info("FX rates seeding complete!")


async def _run_seed_fx(session: AsyncSession, rates_data: dict[str, Decimal]) -> None:
    logger.info("Clearing existing exchange rates...")
    await session.execute(delete(ExchangeRate))
    await session.flush()

    logger.info("Inserting exchange rates...")
    rates = []
    for curr, rate in rates_data.items():
        if curr != "USD":
            rates.append(
                ExchangeRate(
                    currency=curr,
                    rate=rate,
                )
            )
    session.add_all(rates)
    await session.commit()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed the database with exchange rates.")
    parser.add_argument("csv_path", type=str, help="Path to FX CSV file")
    parser.add_argument("-v", "--verbose", action="store_true", help="Enable verbose SQL logging")
    args = parser.parse_args()
    asyncio.run(seed_fx(args.csv_path, args.verbose))
