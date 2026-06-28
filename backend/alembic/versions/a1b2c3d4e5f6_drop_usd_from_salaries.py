"""drop salary_usd_minor_units and exchange_rate_id from salaries

Revision ID: a1b2c3d4e5f6
Revises: 4b525a5603d7
Create Date: 2026-06-28

ADR 0008: Local currency is the source of truth. USD values are now
calculated dynamically in the active_employees view via a JOIN against
the exchange_rates table, rather than being stored statically on each
salary row at time of creation.
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "a1b2c3d4e5f6"
down_revision: str | None = "4b525a5603d7"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("DROP VIEW IF EXISTS active_employees")

    with op.batch_alter_table("salaries", schema=None) as batch_op:
        batch_op.drop_constraint("fk_salaries_exchange_rate_id_exchange_rates", type_="foreignkey")
        batch_op.drop_column("exchange_rate_id")
        batch_op.drop_column("salary_usd_minor_units")

    op.execute("""
    CREATE VIEW active_employees AS
    SELECT
        e.id, e.first_name, e.last_name, e.email,
        e.department, e.country, e.is_active,
        e.created_at, e.updated_at,
        sh.base_salary_minor_units,
        sh.housing_allowance_minor_units,
        sh.equity_minor_units,
        sh.other_allowance_minor_units,
        (sh.base_salary_minor_units +
            COALESCE(sh.housing_allowance_minor_units, 0) +
            COALESCE(sh.equity_minor_units, 0) +
            COALESCE(sh.other_allowance_minor_units, 0)
        ) AS salary_minor_units,
        sh.currency,
        CAST((
            (sh.base_salary_minor_units +
                COALESCE(sh.housing_allowance_minor_units, 0) +
                COALESCE(sh.equity_minor_units, 0) +
                COALESCE(sh.other_allowance_minor_units, 0)
            ) * er.rate
        ) AS INTEGER) AS salary_usd_minor_units,
        sh.valid_from
    FROM employees e
    LEFT JOIN salaries sh
        ON sh.employee_id = e.id
        AND sh.valid_to IS NULL
    LEFT JOIN exchange_rates er
        ON er.currency = sh.currency
        AND er.valid_to IS NULL
    WHERE e.is_active
    """)


def downgrade() -> None:
    op.execute("DROP VIEW IF EXISTS active_employees")

    with op.batch_alter_table("salaries", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column(
                "salary_usd_minor_units",
                sa.Integer(),
                nullable=False,
                server_default="0",
            )
        )
        batch_op.add_column(
            sa.Column(
                "exchange_rate_id",
                sa.Integer(),
                nullable=False,
                server_default="1",
            )
        )
        batch_op.create_foreign_key(
            "fk_salaries_exchange_rate_id_exchange_rates",
            "exchange_rates",
            ["exchange_rate_id"],
            ["id"],
        )

    op.execute("""
    CREATE VIEW active_employees AS
    SELECT
        e.id, e.first_name, e.last_name, e.email,
        e.department, e.country, e.is_active,
        e.created_at, e.updated_at,
        sh.base_salary_minor_units,
        sh.housing_allowance_minor_units,
        sh.equity_minor_units,
        sh.other_allowance_minor_units,
        (sh.base_salary_minor_units +
            COALESCE(sh.housing_allowance_minor_units, 0) +
            COALESCE(sh.equity_minor_units, 0) +
            COALESCE(sh.other_allowance_minor_units, 0)
        ) AS salary_minor_units,
        sh.currency, sh.salary_usd_minor_units,
        sh.valid_from
    FROM employees e
    LEFT JOIN salaries sh
        ON sh.employee_id = e.id
        AND sh.valid_to IS NULL
    WHERE e.is_active
    """)
