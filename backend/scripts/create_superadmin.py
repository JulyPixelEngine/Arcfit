"""Create (or reset) a local super-admin user for development.

Usage:
    python -m scripts.create_superadmin --email dev@fitcore.local --name "Dev Admin"
    (prompts for password via hidden input)

    Non-interactive (e.g. for one-shot setup scripts):
    SUPERADMIN_PASSWORD=devpass123 python -m scripts.create_superadmin --email dev@fitcore.local
"""
import argparse
import asyncio
import getpass
import os

from sqlalchemy import select

from app.core.auth_database import AuthSessionLocal
from app.core.security import hash_password
from app.models.user import User


async def create_superadmin(email: str, password: str, name: str | None) -> None:
    async with AuthSessionLocal() as db:
        existing = await db.scalar(select(User).where(User.email == email))
        if existing:
            existing.hashed_password = hash_password(password)
            existing.role = "super-admin"
            existing.is_active = True
            existing.is_deleted = False
            await db.commit()
            print(f"Updated existing user -> super-admin: {email}")
            return

        user = User(
            email=email,
            name=name,
            role="super-admin",
            hashed_password=hash_password(password),
            provider="local",
        )
        db.add(user)
        await db.commit()
        print(f"Created super-admin user: {email}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Create a dev super-admin user")
    parser.add_argument("--email", required=True)
    parser.add_argument("--name", default="Super Admin")
    args = parser.parse_args()

    password = os.environ.get("SUPERADMIN_PASSWORD")
    if password is None:
        password = getpass.getpass("Password: ")
        confirm = getpass.getpass("Confirm password: ")
        if password != confirm:
            raise SystemExit("Passwords do not match.")

    asyncio.run(create_superadmin(args.email, password, args.name))


if __name__ == "__main__":
    main()
