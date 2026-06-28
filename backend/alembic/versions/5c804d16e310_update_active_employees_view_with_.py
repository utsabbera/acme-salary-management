"""update active_employees view with relationships

Revision ID: 5c804d16e310
Revises: ae989c4a3a9b
Create Date: 2026-06-28 22:47:10.915265

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "5c804d16e310"
down_revision: str | None = "ae989c4a3a9b"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Drop view first
    op.execute("DROP VIEW IF EXISTS active_employees")

    # Alter salaries table
    with op.batch_alter_table("salaries", schema=None) as batch_op:
        batch_op.add_column(sa.Column("currency_id", sa.Integer(), nullable=True))
        batch_op.drop_column("currency")
        batch_op.create_foreign_key(
            "fk_salaries_currency_id", "currencies", ["currency_id"], ["id"]
        )

    # Alter employees table
    with op.batch_alter_table("employees", schema=None) as batch_op:
        batch_op.add_column(sa.Column("department_id", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("country_id", sa.Integer(), nullable=True))
        batch_op.drop_column("department")
        batch_op.drop_column("country")
        batch_op.create_foreign_key(
            "fk_employees_department_id", "departments", ["department_id"], ["id"]
        )
        batch_op.create_foreign_key("fk_employees_country_id", "countries", ["country_id"], ["id"])

    # Recreate view
    op.execute("""
        CREATE VIEW active_employees AS
        SELECT
            e.id,
            e.first_name,
            e.last_name,
            e.email,
            e.department_id,
            d.name AS department_name,
            e.country_id,
            c.code AS country_code,
            c.name AS country_name,
            c.default_currency_id AS country_default_currency_id,
            ccurr.code AS country_default_currency_code,
            ccurr.name AS country_default_currency_name,
            s.base_salary_minor_units,
            s.housing_allowance_minor_units,
            s.equity_minor_units,
            s.other_allowance_minor_units,
            s.base_salary_minor_units + 
                COALESCE(s.housing_allowance_minor_units, 0) + 
                COALESCE(s.equity_minor_units, 0) + 
                COALESCE(s.other_allowance_minor_units, 0) AS salary_minor_units,
            s.currency_id,
            curr.code AS currency_code,
            curr.name AS currency_name,
            CASE 
                WHEN curr.code = 'USD' THEN 
                    (s.base_salary_minor_units + COALESCE(s.housing_allowance_minor_units, 0) + COALESCE(s.equity_minor_units, 0) + COALESCE(s.other_allowance_minor_units, 0))
                WHEN er.rate IS NOT NULL THEN
                    CAST(
                        (s.base_salary_minor_units + 
                        COALESCE(s.housing_allowance_minor_units, 0) + 
                        COALESCE(s.equity_minor_units, 0) + 
                        COALESCE(s.other_allowance_minor_units, 0)) / er.rate
                    AS INTEGER)
                ELSE NULL
            END AS salary_usd_minor_units,
            s.valid_from,
            e.created_at,
            e.updated_at
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN countries c ON e.country_id = c.id
        LEFT JOIN currencies ccurr ON c.default_currency_id = ccurr.id
        LEFT JOIN salaries s ON e.id = s.employee_id AND s.valid_to IS NULL
        LEFT JOIN currencies curr ON s.currency_id = curr.id
        LEFT JOIN exchange_rates er ON curr.code = er.currency 
            AND er.valid_to IS NULL 
            AND curr.code != 'USD'
        WHERE e.is_active = TRUE
    """)


def downgrade() -> None:
    pass
