from app.schemas.employee import PaginatedResponse


class TestPaginatedResponse:
    def test_build_basic(self) -> None:
        items = [1, 2, 3]
        response = PaginatedResponse.build(items=items, total=15, offset=0, limit=5)

        assert response.items == items
        assert response.total == 15
        assert response.offset == 0
        assert response.limit == 5


class TestEmployeeDetailRead:
    def test_employee_detail_read_validation(self) -> None:
        from datetime import date, datetime

        from app.schemas.employee import EmployeeDetailRead, SalaryHistoryItem

        history_item = SalaryHistoryItem(
            base_salary_minor_units=100000,
            currency="USD",
            salary_usd_minor_units=100000,
            valid_from=date(2023, 1, 1),
            valid_to=date(2023, 12, 31),
        )

        detail = EmployeeDetailRead(
            id=1,
            first_name="Jane",
            last_name="Doe",
            email="jane@example.com",
            department="Engineering",
            country="US",
            current_salary=None,
            created_at=datetime(2023, 1, 1),
            updated_at=datetime(2023, 1, 1),
            salary_history=[history_item],
        )

        assert len(detail.salary_history) == 1
        assert detail.salary_history[0].currency == "USD"
