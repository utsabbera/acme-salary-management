"""update_active_employees_view_to_left_join

Revision ID: 811e0e1f0e77
Revises: 866ab64c33a7
Create Date: 2026-06-27 22:15:54.076819

"""

from collections.abc import Sequence

from alembic import op

revision: str = "811e0e1f0e77"
down_revision: str | None = "866ab64c33a7"
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
        sh.salary_minor_units, sh.currency, sh.salary_usd_minor_units,
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
        sh.salary_minor_units, sh.currency, sh.salary_usd_minor_units,
        sh.valid_from
    FROM employees e
    JOIN salaries sh
        ON sh.employee_id = e.id
        AND sh.valid_to IS NULL
    WHERE e.is_active = TRUE
    """)
