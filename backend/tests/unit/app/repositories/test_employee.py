from unittest.mock import AsyncMock

from app.repositories.employee import EmployeeRepository


class TestEmployeeRepository:
    def test_where_clause_empty_filters(self) -> None:
        repo = EmployeeRepository(session=AsyncMock())

        where, params = repo._where_clause(search=None, department=None, country=None)

        assert where == ""
        assert params == {}

    def test_where_clause_only_search(self) -> None:
        repo = EmployeeRepository(session=AsyncMock())

        where, params = repo._where_clause(search="Alice", department=None, country=None)

        assert "LIKE :search" in where
        assert "department" not in where
        assert "country" not in where
        assert params["search"] == "%Alice%"

    def test_where_clause_only_department(self) -> None:
        repo = EmployeeRepository(session=AsyncMock())

        where, params = repo._where_clause(search=None, department="Engineering", country=None)

        assert "LIKE" not in where
        assert "department = :department" in where
        assert "country" not in where
        assert params["department"] == "Engineering"

    def test_where_clause_all_filters(self) -> None:
        repo = EmployeeRepository(session=AsyncMock())

        where, params = repo._where_clause(search="Bob", department="HR", country="UK")

        assert where.startswith("WHERE ")
        assert where.count(" AND ") == 2

        assert "LIKE :search" in where
        assert "department = :department" in where
        assert "country = :country" in where

        assert params["search"] == "%Bob%"
        assert params["department"] == "HR"
        assert params["country"] == "UK"
