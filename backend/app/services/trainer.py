from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.repositories import branch as branch_repo
from app.repositories import trainer as trainer_repo
from app.repositories import user as user_repo
from app.schemas.trainer import TrainerCreate, TrainerResponse, TrainerUpdate
from app.services import class_type as class_type_service
from app.services import trainer_level as trainer_level_service


async def _to_response(db: AsyncSession, trainer) -> TrainerResponse:
    additional_branch_ids = await trainer_repo.get_additional_branch_ids(db, trainer.id)
    linked_user = await user_repo.get_by_trainer_id(db, trainer.id)
    return TrainerResponse(
        id=trainer.id,
        branch_id=trainer.branch_id,
        additional_branch_ids=additional_branch_ids,
        first_name=trainer.first_name,
        last_name=trainer.last_name,
        email=trainer.email,
        phone=trainer.phone,
        trainer_level=trainer.trainer_level,
        class_permissions=trainer.class_permissions,
        is_active=trainer.is_active,
        has_login=linked_user is not None,
        created_at=trainer.created_at,
    )


async def list_trainers_by_branch(db: AsyncSession, branch_id: str) -> list[TrainerResponse]:
    trainers = await trainer_repo.get_all_by_branch(db, branch_id)
    return [await _to_response(db, t) for t in trainers]


async def create_trainer(db: AsyncSession, data: TrainerCreate) -> TrainerResponse:
    await class_type_service.validate_class_types(db, data.branch_id, data.class_permissions)
    await trainer_level_service.validate_trainer_level(db, data.branch_id, data.trainer_level)

    if not await branch_repo.get_by_id(db, data.branch_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")
    for bid in data.additional_branch_ids:
        if not await branch_repo.get_by_id(db, bid):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Branch not found: {bid}")

    if await user_repo.get_by_email(db, data.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered as a login account",
        )

    trainer = await trainer_repo.create(
        db,
        branch_id=data.branch_id,
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        phone=data.phone,
        trainer_level=data.trainer_level,
        class_permissions=data.class_permissions,
        additional_branch_ids=data.additional_branch_ids,
    )

    # Every trainer gets a login account tied to their staff record (role=trainer).
    await user_repo.create(
        db,
        email=data.email,
        hashed_password=hash_password(data.password),
        name=f"{data.last_name}{data.first_name}",
        phone=data.phone,
        branch_id=data.branch_id,
        trainer_id=trainer.id,
        role="trainer",
    )

    return await _to_response(db, trainer)


async def update_trainer(db: AsyncSession, trainer_id: str, data: TrainerUpdate) -> TrainerResponse:
    trainer = await trainer_repo.get_by_id(db, trainer_id)
    if not trainer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trainer not found")

    effective_branch_id = data.branch_id or trainer.branch_id
    if data.class_permissions is not None:
        await class_type_service.validate_class_types(db, effective_branch_id, data.class_permissions)
    if data.trainer_level is not None:
        await trainer_level_service.validate_trainer_level(db, effective_branch_id, data.trainer_level)
    if data.branch_id is not None and not await branch_repo.get_by_id(db, data.branch_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")

    if data.email is not None and data.email != trainer.email:
        existing = await user_repo.get_by_email(db, data.email)
        linked = await user_repo.get_by_trainer_id(db, trainer.id)
        if existing and (not linked or existing.id != linked.id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email is already registered as a login account",
            )

    updates = data.model_dump(exclude_none=True, exclude={"additional_branch_ids", "password"})
    trainer = await trainer_repo.update(db, trainer, **updates)

    if data.additional_branch_ids is not None:
        for bid in data.additional_branch_ids:
            if not await branch_repo.get_by_id(db, bid):
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Branch not found: {bid}")
        await trainer_repo.set_additional_branches(db, trainer.id, data.additional_branch_ids, trainer.branch_id)

    # Keep the trainer's login account (if any) in sync with staff record changes.
    linked_user = await user_repo.get_by_trainer_id(db, trainer.id)
    user_field_updates = {
        k: v for k, v in {
            "email": data.email,
            "phone": data.phone,
            "branch_id": data.branch_id,
        }.items() if v is not None
    }
    if linked_user and user_field_updates:
        await user_repo.update(db, linked_user, **user_field_updates)
    if data.password is not None:
        hashed = hash_password(data.password)
        if linked_user:
            await user_repo.set_password(db, linked_user, hashed)
        else:
            linked_user = await user_repo.create(
                db,
                email=trainer.email,
                hashed_password=hashed,
                name=f"{trainer.last_name}{trainer.first_name}",
                phone=trainer.phone,
                branch_id=trainer.branch_id,
                trainer_id=trainer.id,
                role="trainer",
            )
    if data.is_active is not None and linked_user:
        await user_repo.set_active(db, linked_user, data.is_active)

    return await _to_response(db, trainer)


async def delete_trainer(db: AsyncSession, trainer_id: str) -> None:
    trainer = await trainer_repo.get_by_id(db, trainer_id)
    if not trainer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trainer not found")

    linked_user = await user_repo.get_by_trainer_id(db, trainer.id)
    if linked_user:
        await user_repo.soft_delete(db, linked_user)

    await trainer_repo.soft_delete(db, trainer)
