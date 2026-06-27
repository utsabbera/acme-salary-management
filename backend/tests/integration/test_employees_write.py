import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


class TestEmployeeCreation:
    async def test_create_employee(self, client: AsyncClient) -> None:
        payload = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com",
            "department": "Engineering",
            "country": "US",
        }
        response = await client.post("/employees", json=payload)
        assert response.status_code == 201, response.text

        data = response.json()
        assert data["first_name"] == "John"
        assert data["last_name"] == "Doe"
        assert data["email"] == "john.doe@example.com"
        assert data["current_salary"] is None
        assert "id" in data

    async def test_create_employee_duplicate_email(self, client: AsyncClient) -> None:
        payload = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "jane.doe@example.com",
            "department": "Engineering",
            "country": "US",
        }
        resp1 = await client.post("/employees", json=payload)
        assert resp1.status_code == 201

        resp2 = await client.post("/employees", json=payload)
        assert resp2.status_code == 409
        assert resp2.json()["detail"] == "Email already registered"

    async def test_create_employee_missing_fields(self, client: AsyncClient) -> None:
        payload = {
            "first_name": "Missing",
            # missing last_name, email, etc.
        }
        response = await client.post("/employees", json=payload)
        assert response.status_code == 422

        detail = response.json()["detail"]
        missing_fields = [
            error["loc"][-1]
            for error in detail
            if error["type"] in ("value_error.missing", "missing")
        ]
        assert "last_name" in missing_fields
        assert "email" in missing_fields


class TestEmployeeUpdate:
    async def test_update_employee_basic_fields(self, client: AsyncClient) -> None:
        payload = {
            "first_name": "Bob",
            "last_name": "Smith",
            "email": "bob.smith@example.com",
            "department": "Sales",
            "country": "US",
        }
        create_resp = await client.post("/employees", json=payload)
        emp_id = create_resp.json()["id"]

        update_payload = {"first_name": "Robert", "department": "Marketing"}
        patch_resp = await client.patch(f"/employees/{emp_id}", json=update_payload)
        assert patch_resp.status_code == 200, patch_resp.text

        data = patch_resp.json()
        assert data["first_name"] == "Robert"
        assert data["last_name"] == "Smith"  # Unchanged
        assert data["department"] == "Marketing"
        assert data["current_salary"] is None  # Unchanged


class TestEmployeeDelete:
    async def test_soft_delete_employee(self, client: AsyncClient) -> None:
        payload = {
            "first_name": "Charlie",
            "last_name": "Brown",
            "email": "charlie.brown@example.com",
            "department": "Engineering",
            "country": "US",
        }
        create_resp = await client.post("/employees", json=payload)
        emp_id = create_resp.json()["id"]

        delete_resp = await client.delete(f"/employees/{emp_id}")
        assert delete_resp.status_code == 204

        patch_resp = await client.patch(f"/employees/{emp_id}", json={"first_name": "Charles"})
        assert patch_resp.status_code == 404

        delete_again_resp = await client.delete(f"/employees/{emp_id}")
        assert delete_again_resp.status_code == 404


class TestSalaryAdjustment:
    async def test_add_salary_adjustment(self, client: AsyncClient) -> None:
        payload = {
            "first_name": "Salary",
            "last_name": "Test",
            "email": "salary.test@example.com",
            "department": "Engineering",
            "country": "US",
        }
        create_resp = await client.post("/employees", json=payload)
        emp_id = create_resp.json()["id"]

        salary_payload = {
            "base_salary_minor_units": 10000000,
            "currency": "USD",
            "valid_from": "2024-01-01",
        }

        salary_resp = await client.post(f"/employees/{emp_id}/salaries", json=salary_payload)
        assert salary_resp.status_code == 201, salary_resp.text

        data = salary_resp.json()
        assert data["current_salary"] is not None
        assert data["current_salary"]["base_salary_minor_units"] == 10000000
        assert data["current_salary"]["salary_usd_minor_units"] == 10000000
        assert len(data["salary_history"]) == 1

        # Test validation on valid_from
        invalid_salary_payload = {
            "base_salary_minor_units": 11000000,
            "currency": "USD",
            "valid_from": "2023-12-31",  # Before existing
        }
        invalid_resp = await client.post(
            f"/employees/{emp_id}/salaries", json=invalid_salary_payload
        )
        assert invalid_resp.status_code == 400
        assert "after current salary valid_from" in invalid_resp.json()["detail"]

        # Add another salary adjustment
        new_salary_payload = {
            "base_salary_minor_units": 12000000,
            "currency": "USD",
            "valid_from": "2024-06-01",
        }
        new_resp = await client.post(f"/employees/{emp_id}/salaries", json=new_salary_payload)
        assert new_resp.status_code == 201

        new_data = new_resp.json()
        assert new_data["current_salary"]["base_salary_minor_units"] == 12000000
        assert len(new_data["salary_history"]) == 2
        # Verify the old salary is closed out
        history = new_data["salary_history"]
        active = next(s for s in history if s["valid_to"] is None)
        closed = next(s for s in history if s["valid_to"] is not None)
        assert active["valid_from"] == "2024-06-01"
        assert closed["valid_to"] == "2024-05-31"
