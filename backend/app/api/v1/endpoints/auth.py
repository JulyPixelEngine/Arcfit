from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth_database import get_auth_db
from app.core.security import clear_auth_cookie, decode_access_token, get_token_from_cookie, set_auth_cookie
from app.repositories import user as user_repo
from app.schemas.auth import LoginRequest, MessageResponse, SignupRequest, UserResponse
from app.services import auth as auth_service

router = APIRouter()


@router.post("/register", response_model=UserResponse)
async def register(body: SignupRequest, response: Response, db: AsyncSession = Depends(get_auth_db)):
    user, token = await auth_service.register(
        db,
        email=body.email,
        password=body.password,
        name=body.name,
        phone=body.phone,
        branch_id=body.branch_id,
    )
    set_auth_cookie(response, token)
    return user


@router.post("/login", response_model=UserResponse)
async def login(body: LoginRequest, response: Response, db: AsyncSession = Depends(get_auth_db)):
    user, token = await auth_service.login(db, body.email, body.password)
    set_auth_cookie(response, token)
    return user


@router.post("/logout", response_model=MessageResponse)
async def logout(response: Response):
    clear_auth_cookie(response)
    return MessageResponse(success=True, message="Logged out")


@router.get("/me", response_model=UserResponse)
async def me(request: Request, db: AsyncSession = Depends(get_auth_db)):
    token = get_token_from_cookie(request)
    payload = decode_access_token(token)
    user = await user_repo.get_by_id(db, payload["sub"])
    if not user:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user
