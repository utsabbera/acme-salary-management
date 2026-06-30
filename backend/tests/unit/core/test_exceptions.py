import json

import pytest
from fastapi import Request
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.exceptions import http_exception_handler, validation_exception_handler


@pytest.fixture
def mock_request() -> Request:
    scope = {
        "type": "http",
        "method": "POST",
        "headers": [],
    }
    return Request(scope)


class TestHttpExceptionHandler:
    @pytest.mark.asyncio
    async def test_not_found(self, mock_request: Request) -> None:
        exc = StarletteHTTPException(status_code=404, detail="Item not found")
        response = await http_exception_handler(mock_request, exc)

        assert response.status_code == 404

        data = json.loads(bytes(response.body).decode())
        assert data["error"]["code"] == "NOT_FOUND"
        assert data["error"]["message"] == "Item not found"

    @pytest.mark.asyncio
    async def test_conflict(self, mock_request: Request) -> None:
        exc = StarletteHTTPException(status_code=409, detail="Item already exists")
        response = await http_exception_handler(mock_request, exc)

        assert response.status_code == 409

        data = json.loads(bytes(response.body).decode())
        assert data["error"]["code"] == "CONFLICT"
        assert data["error"]["message"] == "Item already exists"

    @pytest.mark.asyncio
    async def test_unknown(self, mock_request: Request) -> None:
        exc = StarletteHTTPException(status_code=500, detail="Server error")
        response = await http_exception_handler(mock_request, exc)

        assert response.status_code == 500

        data = json.loads(bytes(response.body).decode())
        assert data["error"]["code"] == "ERROR"
        assert data["error"]["message"] == "Server error"


class TestValidationExceptionHandler:
    @pytest.mark.asyncio
    async def test_validation_error(self, mock_request: Request) -> None:
        exc = RequestValidationError(
            errors=[
                {
                    "loc": ("body", "email"),
                    "msg": "value is not a valid email address",
                    "type": "value_error.email",
                },
                {
                    "loc": ("body", "user", "age"),
                    "msg": "ensure this value is greater than 18",
                    "type": "value_error.number.not_gt",
                },
            ]
        )

        response = await validation_exception_handler(mock_request, exc)

        assert response.status_code == 422

        data = json.loads(bytes(response.body).decode())
        assert data["error"]["code"] == "VALIDATION_ERROR"
        assert data["error"]["message"] == "Invalid input data"

        details = data["error"]["details"]
        assert len(details) == 2

        assert details[0]["field"] == "email"
        assert details[0]["issue"] == "value is not a valid email address"

        assert details[1]["field"] == "user.age"
        assert details[1]["issue"] == "ensure this value is greater than 18"


class TestDomainErrorHandler:
    @pytest.mark.asyncio
    async def test_not_found(self, mock_request: Request) -> None:
        from app.core.exceptions import NotFoundError, domain_error_handler

        exc = NotFoundError("Employee not found")
        response = await domain_error_handler(mock_request, exc)

        assert response.status_code == 404
        data = json.loads(bytes(response.body).decode())
        assert data["error"]["code"] == "NOT_FOUND"
        assert data["error"]["message"] == "Employee not found"

    @pytest.mark.asyncio
    async def test_conflict(self, mock_request: Request) -> None:
        from app.core.exceptions import ConflictError, domain_error_handler

        exc = ConflictError("Email already exists")
        response = await domain_error_handler(mock_request, exc)

        assert response.status_code == 409
        data = json.loads(bytes(response.body).decode())
        assert data["error"]["code"] == "CONFLICT"
        assert data["error"]["message"] == "Email already exists"

    @pytest.mark.asyncio
    async def test_bad_request(self, mock_request: Request) -> None:
        from app.core.exceptions import BusinessRuleError, domain_error_handler

        exc = BusinessRuleError("Invalid rule")
        response = await domain_error_handler(mock_request, exc)

        assert response.status_code == 400
        data = json.loads(bytes(response.body).decode())
        assert data["error"]["code"] == "BAD_REQUEST"
        assert data["error"]["message"] == "Invalid rule"

    @pytest.mark.asyncio
    async def test_unknown(self, mock_request: Request) -> None:
        from app.core.exceptions import DomainError, domain_error_handler

        exc = DomainError("Generic domain error")
        response = await domain_error_handler(mock_request, exc)

        assert response.status_code == 500
        data = json.loads(bytes(response.body).decode())
        assert data["error"]["code"] == "INTERNAL_SERVER_ERROR"
        assert data["error"]["message"] == "Generic domain error"
