from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    APP_ENV: str = "development"
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Database (PostgreSQL — main app)
    DATABASE_URL: str

    # Auth DB (PostgreSQL)
    AUTH_DATABASE_URL: str

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # AWS S3
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_S3_BUCKET: str = ""
    AWS_REGION: str = "ap-northeast-2"

    # Toss Payments
    TOSS_SECRET_KEY: str = ""
    TOSS_CLIENT_KEY: str = ""

    # Kakao AlimTalk
    KAKAO_API_KEY: str = ""
    KAKAO_SENDER_KEY: str = ""

    # OAuth2
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    KAKAO_CLIENT_ID: str = ""
    KAKAO_CLIENT_SECRET: str = ""

    # Frontend URL (OAuth callback redirect)
    FRONTEND_URL: str = "http://localhost:3000"

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    class Config:
        env_file = ".env"


settings = Settings()
