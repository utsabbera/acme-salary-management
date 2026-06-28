from fastapi import APIRouter

from app.core.deps import DbDep
from app.repositories.dashboard import DashboardRepository
from app.schemas.dashboard import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    session: DbDep,
) -> DashboardStats:
    repo = DashboardRepository(session)
    return await repo.get_stats()
