from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from starlette.middleware.sessions import SessionMiddleware

from app.core.auth_database import AuthBase, AuthSessionLocal, auth_engine
from app.core.config import settings
from app.core.security import hash_password
from app.api.v1.router import api_router

# Register all AuthBase models so metadata.create_all picks them up
import app.models.customer    # noqa: F401
import app.models.branch      # noqa: F401
import app.models.trainer     # noqa: F401
import app.models.member      # noqa: F401
import app.models.pt_session  # noqa: F401
import app.models.user        # noqa: F401
import app.models.role        # noqa: F401
import app.models.product     # noqa: F401
import app.models.class_type     # noqa: F401
import app.models.trainer_level  # noqa: F401
import app.models.lead            # noqa: F401

SUPER_ADMIN_EMAIL = "superadmin@system.com"
SUPER_ADMIN_PASSWORD = "SuperAdmin#2024!"  # Change this after first login

DEFAULT_ROLES = [
    {"name": "super-admin", "description": "Platform owner — full access to everything"},
    {"name": "admin",       "description": "Customer-level admin — manages branches and staff"},
    {"name": "trainer",     "description": "Branch trainer — manages own members and sessions"},
    {"name": "user",        "description": "Basic account — default role on signup"},
]


async def _ensure_roles() -> None:
    """Seed default roles on first startup if the roles table is empty."""
    from app.models.role import Role

    async with AuthSessionLocal() as db:
        result = await db.execute(select(Role))
        if result.scalars().first() is None:
            for r in DEFAULT_ROLES:
                db.add(Role(name=r["name"], description=r["description"]))
            await db.commit()
            print(f"[startup] Default roles seeded: {[r['name'] for r in DEFAULT_ROLES]}")
        else:
            print("[startup] Roles already exist — skipping seed.")


async def _ensure_super_admin() -> None:
    """Create a default super-admin account on first startup if none exists."""
    from app.models.user import User

    async with AuthSessionLocal() as db:
        result = await db.execute(
            select(User).where(User.role == "super-admin", User.is_deleted == False)
        )
        if result.scalar_one_or_none() is None:
            db.add(
                User(
                    email=SUPER_ADMIN_EMAIL,
                    name="Super Admin",
                    role="super-admin",
                    hashed_password=hash_password(SUPER_ADMIN_PASSWORD),
                    is_active=True,
                )
            )
            await db.commit()
            print(f"[startup] Super-admin created: {SUPER_ADMIN_EMAIL}")
        else:
            print("[startup] Super-admin already exists — skipping init.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables registered under AuthBase (dev mode — use Alembic in production)
    async with auth_engine.begin() as conn:
        await conn.run_sync(AuthBase.metadata.create_all)

    await _ensure_roles()
    await _ensure_super_admin()
    yield


app = FastAPI(
    title="FitCore API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Required for OAuth2 state parameter (authlib)
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    return {"status": "ok"}
