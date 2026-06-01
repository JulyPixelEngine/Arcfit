from fastapi import APIRouter

from app.api.v1.endpoints import (
    admin,
    attendance,
    auth,
    branches,
    members,
    memberships,
    oauth,
    payments,
    schedules,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(oauth.router, prefix="/auth", tags=["oauth"])
api_router.include_router(branches.router, prefix="/branches", tags=["branches"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(members.router, prefix="/members", tags=["members"])
api_router.include_router(memberships.router, prefix="/memberships", tags=["memberships"])
api_router.include_router(schedules.router, prefix="/schedules", tags=["schedules"])
api_router.include_router(attendance.router, prefix="/attendance", tags=["attendance"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
