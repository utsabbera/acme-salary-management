import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


class TestReferenceAPI:
    async def test_get_departments(self, client: AsyncClient) -> None:
        response = await client.get("/departments")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 4
        names = [d["name"] for d in data]
        assert "HR" in names
        assert "Engineering" in names

    async def test_get_currencies(self, client: AsyncClient) -> None:
        response = await client.get("/currencies")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 3
        codes = [c["code"] for c in data]
        assert "USD" in codes
        assert "GBP" in codes

    async def test_get_countries(self, client: AsyncClient) -> None:
        response = await client.get("/countries")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 3

        uk = next(c for c in data if c["code"] == "UK")
        assert uk["name"] == "United Kingdom"
        assert uk["default_currency"]["code"] == "GBP"
