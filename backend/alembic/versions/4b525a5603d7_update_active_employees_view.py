"""update active_employees view

Revision ID: 4b525a5603d7
Revises: 88f5d5a9b165
Create Date: 2026-06-28 02:08:49.174733

"""

from collections.abc import Sequence

from alembic import op

revision: str = "4b525a5603d7"
down_revision: str | None = "88f5d5a9b165"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("DROP VIEW IF EXISTS active_employees")
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
         COALESCE(sh.other_allowance_minor_units, 0)) AS salary_minor_units,
        sh.currency, sh.salary_usd_minor_units,
        sh.valid_from
    FROM employees e
    LEFT JOIN salaries sh
        ON sh.employee_id = e.id
        AND sh.valid_to IS NULL
    WHERE e.is_active = TRUE
    """)


def downgrade() -> None:
    op.execute("DROP VIEW IF EXISTS active_employees")
    op.execute("""
    CREATE VIEW active_employees AS
    SELECT
        e.id, e.first_name, e.last_name, e.email,
        e.department, e.country, e.is_active,
        e.created_at, e.updated_at,
        sh.base_salary_minor_units AS salary_minor_units,
        sh.currency, sh.salary_usd_minor_units,
        sh.valid_from
    FROM employees e
    LEFT JOIN salaries sh
        ON sh.employee_id = e.id
        AND sh.valid_to IS NULL
    WHERE e.is_active = TRUE
    """)
