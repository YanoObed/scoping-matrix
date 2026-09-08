import re

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.identity.models import (
    User,
    Workspace,
    WorkspaceMembership,
    WorkspaceRole,
)
from app.modules.identity.schemas import (
    UserRegister,
    UserUpdate,
)
from app.modules.identity.security import (
    create_password_reset_token,
    decode_password_reset_token,
    hash_password,
    password_hash_fingerprint,
    verify_password,
)


def normalize_email(email: str) -> str:
    return email.strip().lower()


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(
        r"[^a-z0-9]+",
        "-",
        value,
    )
    value = value.strip("-")

    return value or "workspace"


def get_user_by_email(
    db: Session,
    email: str,
) -> User | None:
    normalized_email = normalize_email(
        email
    )

    statement = select(User).where(
        User.email == normalized_email
    )

    return db.scalar(statement)


def get_user_by_id(
    db: Session,
    user_id: UUID,
) -> User | None:
    return db.get(
        User,
        user_id,
    )


def get_workspace_by_slug(
    db: Session,
    slug: str,
) -> Workspace | None:
    statement = select(Workspace).where(
        Workspace.slug == slug
    )

    return db.scalar(statement)


def get_workspace_membership(
    db: Session,
    workspace_id: UUID,
    user_id: UUID,
) -> WorkspaceMembership | None:
    statement = select(
        WorkspaceMembership
    ).where(
        WorkspaceMembership.workspace_id
        == workspace_id,
        WorkspaceMembership.user_id
        == user_id,
    )

    return db.scalar(statement)


def get_workspace_membership_by_id(
    db: Session,
    workspace_id: UUID,
    membership_id: UUID,
) -> WorkspaceMembership | None:
    statement = select(
        WorkspaceMembership
    ).where(
        WorkspaceMembership.workspace_id
        == workspace_id,
        WorkspaceMembership.id
        == membership_id,
    )

    return db.scalar(statement)


def list_user_workspaces(
    db: Session,
    user_id: UUID,
) -> list[
    tuple[
        WorkspaceMembership,
        Workspace,
    ]
]:
    statement = (
        select(
            WorkspaceMembership,
            Workspace,
        )
        .join(
            Workspace,
            Workspace.id
            == WorkspaceMembership.workspace_id,
        )
        .where(
            WorkspaceMembership.user_id
            == user_id,
        )
        .order_by(
            Workspace.name.asc(),
            WorkspaceMembership.id.asc(),
        )
    )

    return list(
        db.execute(statement).all()
    )


def list_workspace_members(
    db: Session,
    workspace_id: UUID,
) -> list[
    tuple[
        WorkspaceMembership,
        User,
    ]
]:
    statement = (
        select(
            WorkspaceMembership,
            User,
        )
        .join(
            User,
            User.id
            == WorkspaceMembership.user_id,
        )
        .where(
            WorkspaceMembership.workspace_id
            == workspace_id,
        )
        .order_by(
            User.email.asc(),
            WorkspaceMembership.id.asc(),
        )
    )

    return list(
        db.execute(statement).all()
    )


def add_workspace_member(
    db: Session,
    actor: WorkspaceMembership,
    email: str,
    role: WorkspaceRole,
) -> tuple[
    WorkspaceMembership,
    User,
]:
    if role == WorkspaceRole.OWNER:
        raise ValueError(
            "Owner role cannot be assigned through this endpoint"
        )

    if (
        role == WorkspaceRole.ADMIN
        and actor.role
        != WorkspaceRole.OWNER
    ):
        raise PermissionError(
            "Only the workspace owner can add admins"
        )

    user = get_user_by_email(
        db,
        email,
    )

    if user is None:
        raise ValueError(
            "User does not exist"
        )

    existing_membership = (
        get_workspace_membership(
            db,
            actor.workspace_id,
            user.id,
        )
    )

    if existing_membership is not None:
        raise ValueError(
            "User is already a member of this workspace"
        )

    membership = WorkspaceMembership(
        user_id=user.id,
        workspace_id=actor.workspace_id,
        role=role,
    )

    db.add(membership)
    db.commit()
    db.refresh(membership)

    return membership, user


def update_workspace_member_role(
    db: Session,
    actor: WorkspaceMembership,
    membership_id: UUID,
    role: WorkspaceRole,
) -> tuple[
    WorkspaceMembership,
    User,
]:
    if (
        actor.role
        != WorkspaceRole.OWNER
    ):
        raise PermissionError(
            "Only the workspace owner can change member roles"
        )

    membership = (
        get_workspace_membership_by_id(
            db,
            actor.workspace_id,
            membership_id,
        )
    )

    if membership is None:
        raise ValueError(
            "Workspace membership does not exist"
        )

    if (
        membership.role
        == WorkspaceRole.OWNER
    ):
        raise ValueError(
            "Workspace owner role cannot be changed"
        )

    if role == WorkspaceRole.OWNER:
        raise ValueError(
            "Owner role cannot be assigned through this endpoint"
        )

    membership.role = role

    db.commit()
    db.refresh(membership)

    user = db.get(
        User,
        membership.user_id,
    )

    if user is None:
        raise ValueError(
            "User does not exist"
        )

    return membership, user


def remove_workspace_member(
    db: Session,
    actor: WorkspaceMembership,
    membership_id: UUID,
) -> None:
    membership = (
        get_workspace_membership_by_id(
            db,
            actor.workspace_id,
            membership_id,
        )
    )

    if membership is None:
        raise ValueError(
            "Workspace membership does not exist"
        )

    if (
        membership.role
        == WorkspaceRole.OWNER
    ):
        raise ValueError(
            "Workspace owner cannot be removed"
        )

    if (
        membership.role
        == WorkspaceRole.ADMIN
        and actor.role
        != WorkspaceRole.OWNER
    ):
        raise PermissionError(
            "Only the workspace owner can remove admins"
        )

    db.delete(membership)
    db.commit()


def generate_unique_workspace_slug(
    db: Session,
    workspace_name: str,
) -> str:
    base_slug = slugify(
        workspace_name
    )

    candidate = base_slug
    counter = 2

    while get_workspace_by_slug(
        db,
        candidate,
    ) is not None:
        candidate = (
            f"{base_slug}-{counter}"
        )
        counter += 1

    return candidate


def register_user(
    db: Session,
    data: UserRegister,
) -> tuple[
    User,
    Workspace,
    WorkspaceMembership,
]:
    email = normalize_email(
        data.email
    )

    existing_user = get_user_by_email(
        db,
        email,
    )

    if existing_user is not None:
        raise ValueError(
            "A user with this email already exists"
        )

    workspace_slug = (
        generate_unique_workspace_slug(
            db,
            data.workspace_name,
        )
    )

    user = User(
        email=email,
        password_hash=hash_password(
            data.password
        ),
        first_name=(
            data.first_name.strip()
            if data.first_name
            else None
        ),
        last_name=(
            data.last_name.strip()
            if data.last_name
            else None
        ),
        phone=(
            data.phone.strip()
            if data.phone
            else None
        ),
        is_active=True,
        is_superuser=False,
    )

    workspace = Workspace(
        name=data.workspace_name.strip(),
        slug=workspace_slug,
    )

    db.add(user)
    db.add(workspace)
    db.flush()

    membership = WorkspaceMembership(
        user_id=user.id,
        workspace_id=workspace.id,
        role=WorkspaceRole.OWNER,
    )

    db.add(membership)
    db.commit()

    db.refresh(user)
    db.refresh(workspace)
    db.refresh(membership)

    return (
        user,
        workspace,
        membership,
    )


def authenticate_user(
    db: Session,
    email: str,
    password: str,
) -> User | None:
    user = get_user_by_email(
        db,
        email,
    )

    if user is None:
        return None

    if not user.is_active:
        return None

    if not verify_password(
        password,
        user.password_hash,
    ):
        return None

    return user


def create_user_password_reset_token(
    db: Session,
    email: str,
) -> str | None:
    user = get_user_by_email(
        db,
        email,
    )

    if user is None:
        return None

    if not user.is_active:
        return None

    return create_password_reset_token(
        subject=str(user.id),
        hashed_password=user.password_hash,
    )


def reset_user_password(
    db: Session,
    token: str,
    new_password: str,
) -> None:
    payload = (
        decode_password_reset_token(
            token
        )
    )

    subject = payload.get("sub")

    if not subject:
        raise ValueError(
            "Invalid password reset token"
        )

    try:
        user_id = UUID(subject)
    except ValueError as exc:
        raise ValueError(
            "Invalid password reset token"
        ) from exc

    user = get_user_by_id(
        db,
        user_id,
    )

    if user is None:
        raise ValueError(
            "Invalid password reset token"
        )

    if not user.is_active:
        raise ValueError(
            "Invalid password reset token"
        )

    token_fingerprint = payload.get(
        "pwd"
    )

    current_fingerprint = (
        password_hash_fingerprint(
            user.password_hash
        )
    )

    if (
        token_fingerprint
        != current_fingerprint
    ):
        raise ValueError(
            "Invalid or already used password reset token"
        )

    user.password_hash = hash_password(
        new_password
    )

    db.commit()


def update_user_profile(
    db: Session,
    user: User,
    data: UserUpdate,
) -> User:
    changes = data.model_dump(
        exclude_unset=True,
    )

    if "email" in changes:
        email = normalize_email(
            changes["email"]
        )

        existing_user = (
            get_user_by_email(
                db,
                email,
            )
        )

        if (
            existing_user is not None
            and existing_user.id
            != user.id
        ):
            raise ValueError(
                "A user with this email already exists"
            )

        user.email = email

    for field_name in (
        "first_name",
        "last_name",
        "phone",
    ):
        if field_name not in changes:
            continue

        value = changes[field_name]

        if isinstance(
            value,
            str,
        ):
            value = (
                value.strip()
                or None
            )

        setattr(
            user,
            field_name,
            value,
        )

    db.commit()
    db.refresh(user)

    return user