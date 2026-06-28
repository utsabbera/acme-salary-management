"""Migrate to minor units

Revision ID: 2235566c3b40
Revises: 11afbcb35cef
Create Date: 2026-06-27 21:15:02.414808

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "2235566c3b40"
down_revision: str | None = "11afbcb35cef"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("DROP VIEW IF EXISTS active_employees")

    with op.batch_alter_table("salaries", schema=None) as batch_op:
        batch_op.add_column(sa.Column("salary_minor_units", sa.BigInteger(), nullable=True))
        batch_op.add_column(sa.Column("salary_usd_minor_units", sa.BigInteger(), nullable=True))

    op.execute(
        "UPDATE salaries SET "
        "salary_minor_units = CAST(salary * 100 AS INTEGER), "
        "salary_usd_minor_units = CAST(salary_usd * 100 AS INTEGER)"
    )

    with op.batch_alter_table("salaries", schema=None) as batch_op:
        batch_op.alter_column("salary_minor_units", nullable=False)
        batch_op.alter_column("salary_usd_minor_units", nullable=False)
        batch_op.drop_column("salary")
        batch_op.drop_column("salary_usd")

    op.execute("""
    CREATE VIEW active_employees AS
    SELECT
        e.id, e.first_name, e.last_name, e.email,
        e.department, e.country, e.is_active,
        e.created_at, e.updated_at,
        sh.salary_minor_units, sh.currency, sh.salary_usd_minor_units,
        sh.valid_from
    FROM employees e
    JOIN salaries sh
        ON sh.employee_id = e.id
        AND sh.valid_to IS NULL
    WHERE e.is_active = TRUE
    """)


def downgrade() -> None:
    op.execute("DROP VIEW IF EXISTS active_employees")

    with op.batch_alter_table("salaries", schema=None) as batch_op:
        batch_op.add_column(sa.Column("salary", sa.NUMERIC(precision=12, scale=2), nullable=True))
        batch_op.add_column(
            sa.Column("salary_usd", sa.NUMERIC(precision=12, scale=2), nullable=True)
        )

    op.execute(
        "UPDATE salaries SET "
        "salary = CAST(salary_minor_units AS FLOAT) / 100, "
        "salary_usd = CAST(salary_usd_minor_units AS FLOAT) / 100"
    )

    with op.batch_alter_table("salaries", schema=None) as batch_op:
        batch_op.alter_column("salary", nullable=False)
        batch_op.alter_column("salary_usd", nullable=False)
        batch_op.drop_column("salary_usd_minor_units")
        batch_op.drop_column("salary_minor_units")

    op.execute("""
    CREATE VIEW active_employees AS
    SELECT
        e.id, e.first_name, e.last_name, e.email,
        e.department, e.country, e.is_active,
        e.created_at, e.updated_at,
        sh.salary, sh.currency, sh.salary_usd,
        sh.valid_from
    FROM employees e
    JOIN salaries sh
        ON sh.employee_id = e.id
        AND sh.valid_to IS NULL
    WHERE e.is_active = TRUE
    """)
