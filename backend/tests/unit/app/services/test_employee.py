from unittest.mock import AsyncMock

import pytest

from app.schemas.employee import EmployeeRead
from app.services.employee import EmployeeService


class TestEmployeeService:
    @pytest.mark.asyncio
    async def test_list_employees_orchestration(self) -> None:
        mock_repo = AsyncMock()

        mock_row = {
            "id": "123e4567-e89b-12d3-a456-426614174000",
            "first_name": "Test",
            "last_name": "User",
            "email": "test@example.com",
            "department": "IT",
            "country": "US",
            "salary": "1000",
            "currency": "USD",
            "salary_usd": "1000",
            "valid_from": "2023-01-01",
            "created_at": "2023-01-01T00:00:00Z",
            "updated_at": "2023-01-01T00:00:00Z",
        }
        mock_repo.list_paginated.return_value = [mock_row]
        mock_repo.count.return_value = 42

        service = EmployeeService(repo=mock_repo)

        result = await service.list_employees(
            page=2, size=10, search="test", department="IT", country="US"
        )

        mock_repo.list_paginated.assert_awaited_once_with(
            page=2, size=10, search="test", department="IT", country="US"
        )
        mock_repo.count.assert_awaited_once_with(search="test", department="IT", country="US")

        assert result.total == 42
        assert result.page == 2
        assert result.size == 10
        assert result.total_pages == 5  # ceil(42/10)

        assert len(result.items) == 1
        item = result.items[0]
        assert isinstance(item, EmployeeRead)
        assert item.first_name == "Test"
        assert item.email == "test@example.com"
