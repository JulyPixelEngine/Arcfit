from fastapi import APIRouter, Depends, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth_database import get_auth_db
from app.core.config import settings
from app.core.oauth import oauth
from app.core.security import set_auth_cookie
from app.services import auth as auth_service

router = APIRouter()

REDIRECT_URL = f"{settings.FRONTEND_URL}/dashboard"


# ── Google ──────────────────────────────────────────────────────────────────

@router.get("/google/login")
async def google_login(request: Request):
    redirect_uri = str(request.url_for("google_callback"))
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback", name="google_callback")
async def google_callback(request: Request, db: AsyncSession = Depends(get_auth_db)):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get("userinfo")
    email = user_info["email"]
    provider_id = user_info["sub"]

    _, jwt_token = await auth_service.get_or_create_oauth_user(db, email, "google", provider_id)

    response = RedirectResponse(url=REDIRECT_URL)
    set_auth_cookie(response, jwt_token)
    return response


# ── Kakao ────────────────────────────────────────────────────────────────────

@router.get("/kakao/login")
async def kakao_login(request: Request):
    redirect_uri = str(request.url_for("kakao_callback"))
    return await oauth.kakao.authorize_redirect(request, redirect_uri)


@router.get("/kakao/callback", name="kakao_callback")
async def kakao_callback(request: Request, db: AsyncSession = Depends(get_auth_db)):
    token = await oauth.kakao.authorize_access_token(request)
    resp = await oauth.kakao.get("v2/user/me", token=token)
    profile = resp.json()

    provider_id = str(profile["id"])
    kakao_account = profile.get("kakao_account", {})
    email = kakao_account.get("email", f"kakao_{provider_id}@kakao.local")

    _, jwt_token = await auth_service.get_or_create_oauth_user(db, email, "kakao", provider_id)

    response = RedirectResponse(url=REDIRECT_URL)
    set_auth_cookie(response, jwt_token)
    return response
