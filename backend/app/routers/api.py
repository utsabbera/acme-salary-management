from fastapi import APIRouter

from app.routers import dashboard, employees, health

api_router = APIRouter()

api_router.include_router(health.router, tags=["health"])
api_router.include_router(employees.router)
api_router.include_router(dashboard.router)
