from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
from starlette.exceptions import HTTPException as StarletteHTTPException


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    code = "ERROR"
    if exc.status_code == 404:
        code = "NOT_FOUND"
    elif exc.status_code == 400:
        code = "BAD_REQUEST"
    elif exc.status_code == 401:
        code = "UNAUTHORIZED"
    elif exc.status_code == 403:
        code = "FORBIDDEN"
    elif exc.status_code == 409:
        code = "CONFLICT"
    elif exc.status_code == 422:
        code = "UNPROCESSABLE_ENTITY"

    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": code, "message": exc.detail}},
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    details = []
    for error in exc.errors():
        loc = error.get("loc", [])
        if loc and loc[0] in ("body", "query", "path", "header", "cookie"):
            loc = loc[1:]

        field = ".".join([str(x) for x in loc]) if loc else "unknown"
        details.append({"field": field, "issue": error.get("msg", "Invalid value")})

    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Invalid input data",
                "details": details,
            }
        },
    )


async def integrity_error_handler(request: Request, exc: IntegrityError) -> JSONResponse:
    return JSONResponse(
        status_code=400,
        content={
            "error": {
                "code": "BAD_REQUEST",
                "message": (
                    "Invalid reference data. Ensure all references"
                    " (department, country, currency) exist."
                ),
            }
        },
    )


class DomainError(Exception):
    """Base class for all domain-specific exceptions."""

    pass


class NotFoundError(DomainError):
    """Raised when a requested resource is not found."""

    pass


class ConflictError(DomainError):
    """Raised when a resource state conflict occurs (e.g., duplicates)."""

    pass


class BusinessRuleError(DomainError):
    """Raised when a business logic rule is violated."""

    pass


async def domain_error_handler(request: Request, exc: DomainError) -> JSONResponse:
    if isinstance(exc, NotFoundError):
        status_code = 404
        code = "NOT_FOUND"
    elif isinstance(exc, ConflictError):
        status_code = 409
        code = "CONFLICT"
    elif isinstance(exc, BusinessRuleError):
        status_code = 400
        code = "BAD_REQUEST"
    else:
        status_code = 500
        code = "INTERNAL_SERVER_ERROR"

    return JSONResponse(
        status_code=status_code,
        content={"error": {"code": code, "message": str(exc)}},
    )
