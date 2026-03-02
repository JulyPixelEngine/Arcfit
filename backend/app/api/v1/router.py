from fastapi import APIRouter

from app.api.v1.endpoints import auth, members, memberships, schedules, attendance, payments

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(members.router, prefix="/members", tags=["members"])
api_router.include_router(memberships.router, prefix="/memberships", tags=["memberships"])
api_router.include_router(schedules.router, prefix="/schedules", tags=["schedules"])
api_router.include_router(attendance.router, prefix="/attendance", tags=["attendance"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
