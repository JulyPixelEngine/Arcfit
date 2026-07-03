from fastapi import APIRouter

from app.api.v1.endpoints import (
    admin,
    attendance,
    auth,
    branches,
    class_types,
    leads,
    members,
    memberships,
    oauth,
    payments,
    products,
    schedules,
    trainer_levels,
    trainers,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(oauth.router, prefix="/auth", tags=["oauth"])
api_router.include_router(branches.router, prefix="/branches", tags=["branches"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(members.router, prefix="/members", tags=["members"])
api_router.include_router(trainers.router, prefix="/trainers", tags=["trainers"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(class_types.router, prefix="/class-types", tags=["class-types"])
api_router.include_router(trainer_levels.router, prefix="/trainer-levels", tags=["trainer-levels"])
api_router.include_router(memberships.router, prefix="/memberships", tags=["memberships"])
api_router.include_router(schedules.router, prefix="/schedules", tags=["schedules"])
api_router.include_router(attendance.router, prefix="/attendance", tags=["attendance"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(leads.router, prefix="/leads", tags=["leads"])
