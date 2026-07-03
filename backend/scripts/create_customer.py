"""Onboard a new studio (Customer) with its first branch and admin login.

Used by the platform operator (super-admin) to manually onboard a studio owner
who requested access — creates the Customer, a default Branch, and an admin
User tied to both via customer_id/branch_id.

Usage:
    python -m scripts.create_customer \\
        --customer-name "Gangnam Fit" --customer-email owner@studio.com \\
        --admin-name "Kim Owner" --admin-email owner@studio.com \\
        --branch-name "Gangnam" --branch-address "Teheran-ro 1"
    (prompts for password via hidden input)

    Non-interactive:
    ADMIN_PASSWORD=temp1234! python -m scripts.create_customer --customer-name "..." ...
"""
import argparse
import asyncio
import getpass
import os

from sqlalchemy import select

from app.core.auth_database import AuthSessionLocal
from app.core.security import hash_password

# Branch/Customer declare relationship() fields via string forward-references
# (e.g. Branch.trainers -> "Trainer") — these classes must be imported
# somewhere so SQLAlchemy's mapper registry can resolve them at query time.
import app.models.trainer     # noqa: F401
import app.models.member       # noqa: F401
import app.models.pt_session   # noqa: F401
import app.models.product      # noqa: F401
from app.models.branch import Branch
from app.models.customer import Customer
from app.models.user import User


async def create_customer(
    customer_name: str,
    customer_email: str,
    admin_name: str,
    admin_email: str,
    branch_name: str,
    branch_address: str,
    password: str,
) -> None:
    async with AuthSessionLocal() as db:
        customer = await db.scalar(select(Customer).where(Customer.email == customer_email))
        if not customer:
            customer = Customer(name=customer_name, email=customer_email)
            db.add(customer)
            await db.flush()
            print(f"Created customer: {customer_name} ({customer_email})")
        else:
            print(f"Reusing existing customer: {customer.name} ({customer_email})")

        branch = await db.scalar(
            select(Branch).where(Branch.customer_id == customer.id, Branch.name == branch_name)
        )
        if not branch:
            branch = Branch(customer_id=customer.id, name=branch_name, address=branch_address)
            db.add(branch)
            await db.flush()
            print(f"Created branch: {branch_name}")
        else:
            print(f"Reusing existing branch: {branch_name}")

        admin_user = await db.scalar(select(User).where(User.email == admin_email))
        if admin_user:
            admin_user.hashed_password = hash_password(password)
            admin_user.role = "admin"
            admin_user.customer_id = customer.id
            admin_user.branch_id = branch.id
            admin_user.is_active = True
            admin_user.is_deleted = False
            print(f"Updated existing user -> admin: {admin_email}")
        else:
            admin_user = User(
                email=admin_email,
                name=admin_name,
                role="admin",
                customer_id=customer.id,
                branch_id=branch.id,
                hashed_password=hash_password(password),
                provider="local",
            )
            db.add(admin_user)
            print(f"Created admin user: {admin_email}")

        await db.commit()
        print(f"\nDone. {admin_name} can log in with {admin_email} / (the password you set).")


def main() -> None:
    parser = argparse.ArgumentParser(description="Onboard a new studio (Customer) + branch + admin login")
    parser.add_argument("--customer-name", required=True)
    parser.add_argument("--customer-email", required=True)
    parser.add_argument("--admin-name", required=True)
    parser.add_argument("--admin-email", required=True)
    parser.add_argument("--branch-name", required=True)
    parser.add_argument("--branch-address", required=True)
    args = parser.parse_args()

    password = os.environ.get("ADMIN_PASSWORD")
    if password is None:
        password = getpass.getpass("Admin password: ")
        confirm = getpass.getpass("Confirm password: ")
        if password != confirm:
            raise SystemExit("Passwords do not match.")

    asyncio.run(create_customer(
        args.customer_name,
        args.customer_email,
        args.admin_name,
        args.admin_email,
        args.branch_name,
        args.branch_address,
        password,
    ))


if __name__ == "__main__":
    main()
