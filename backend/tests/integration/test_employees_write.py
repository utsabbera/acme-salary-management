import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


class TestEmployeeCreation:
    async def test_create_employee(self, client: AsyncClient) -> None:
        payload = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com",
            "department_id": 1,
            "country_code": "US",
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
            "department_id": 1,
            "country_code": "US",
        }
        resp1 = await client.post("/employees", json=payload)
        assert resp1.status_code == 201

        resp2 = await client.post("/employees", json=payload)
        assert resp2.status_code == 409
        assert resp2.json()["error"]["message"] == "Email already registered"

    async def test_create_employee_missing_fields(self, client: AsyncClient) -> None:
        payload = {
            "first_name": "Missing",
            # missing last_name, email, etc.
        }
        response = await client.post("/employees", json=payload)
        assert response.status_code == 422

        details = response.json()["error"]["details"]
        missing_fields = [error["field"] for error in details]
        assert "last_name" in missing_fields
        assert "email" in missing_fields


class TestEmployeeUpdate:
    async def test_update_employee_basic_fields(self, client: AsyncClient) -> None:
        payload = {
            "first_name": "Bob",
            "last_name": "Smith",
            "email": "bob.smith@example.com",
            "department_id": 2,
            "country_code": "US",
        }
        create_resp = await client.post("/employees", json=payload)
        emp_id = create_resp.json()["id"]

        update_payload = {"first_name": "Robert", "department_id": 3}
        patch_resp = await client.patch(f"/employees/{emp_id}", json=update_payload)
        assert patch_resp.status_code == 200, patch_resp.text

        data = patch_resp.json()
        assert data["first_name"] == "Robert"
        assert data["last_name"] == "Smith"  # Unchanged
        assert data["department"]["name"] == "Marketing"
        assert data["current_salary"] is None  # Unchanged


class TestEmployeeDelete:
    async def test_soft_delete_employee(self, client: AsyncClient) -> None:
        payload = {
            "first_name": "Charlie",
            "last_name": "Brown",
            "email": "charlie.brown@example.com",
            "department_id": 1,
            "country_code": "US",
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
            "department_id": 1,
            "country_code": "US",
        }
        create_resp = await client.post("/employees", json=payload)
        emp_id = create_resp.json()["id"]

        salary_payload = {
            "base_salary_minor_units": 10000000,
            "currency_code": "USD",
            "valid_from": "2024-01-01",
        }

        salary_resp = await client.post(f"/employees/{emp_id}/salaries", json=salary_payload)
        assert salary_resp.status_code == 201, salary_resp.text

        data = salary_resp.json()
        assert data["current_salary"] is not None
        assert data["current_salary"]["base_salary_minor_units"] == 10000000
        assert len(data["salary_history"]) == 1

        invalid_salary_payload = {
            "base_salary_minor_units": 11000000,
            "currency_code": "USD",
            "valid_from": "2023-12-31",  # Before existing
        }
        invalid_resp = await client.post(
            f"/employees/{emp_id}/salaries", json=invalid_salary_payload
        )
        assert invalid_resp.status_code == 400
        assert "after current salary valid_from" in invalid_resp.json()["error"]["message"]

        # Add another salary adjustment
        new_salary_payload = {
            "base_salary_minor_units": 12000000,
            "currency_code": "USD",
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


class TestISOCodeValidation:
    async def test_create_employee_invalid_country_code(self, client: AsyncClient) -> None:
        payload = {
            "first_name": "Bad",
            "last_name": "Country",
            "email": "bad.country@example.com",
            "department_id": 1,
            "country_code": "ZZ",
        }
        response = await client.post("/employees", json=payload)
        assert response.status_code == 404
        assert "Country" in response.json()["error"]["message"]

    async def test_update_employee_invalid_country_code(self, client: AsyncClient) -> None:
        create_resp = await client.post(
            "/employees",
            json={
                "first_name": "Valid",
                "last_name": "Person",
                "email": "valid.person@example.com",
                "department_id": 1,
                "country_code": "US",
            },
        )
        emp_id = create_resp.json()["id"]

        patch_resp = await client.patch(f"/employees/{emp_id}", json={"country_code": "ZZ"})
        assert patch_resp.status_code == 404
        assert "Country" in patch_resp.json()["error"]["message"]

    async def test_add_salary_invalid_currency_code(self, client: AsyncClient) -> None:
        create_resp = await client.post(
            "/employees",
            json={
                "first_name": "Currency",
                "last_name": "Test",
                "email": "currency.test@example.com",
                "department_id": 1,
                "country_code": "US",
            },
        )
        emp_id = create_resp.json()["id"]

        salary_resp = await client.post(
            f"/employees/{emp_id}/salaries",
            json={
                "base_salary_minor_units": 10000000,
                "currency_code": "XXX",
                "valid_from": "2024-01-01",
            },
        )
        assert salary_resp.status_code == 404
        assert "Currency" in salary_resp.json()["error"]["message"]
