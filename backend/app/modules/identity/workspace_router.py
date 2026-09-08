from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.identity.dependencies import (
    get_current_membership,
    get_current_user,
    require_workspace_roles,
)
from app.modules.identity.models import (
    User,
    WorkspaceMembership,
    WorkspaceRole,
)
from app.modules.identity.schemas import (
    MembershipRead,
    UserWorkspaceRead,
    WorkspaceMemberCreate,
    WorkspaceMemberRead,
    WorkspaceMemberUpdate,
)
from app.modules.identity.service import (
    add_workspace_member,
    list_user_workspaces,
    list_workspace_members,
    remove_workspace_member,
    update_workspace_member_role,
)


router = APIRouter(
    prefix="/workspaces",
    tags=["Workspaces"],
)


@router.get(
    "",
    response_model=list[UserWorkspaceRead],
)
def get_my_workspaces(
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
) -> list[UserWorkspaceRead]:
    rows = list_user_workspaces(
        db,
        current_user.id,
    )

    return [
        UserWorkspaceRead(
            membership_id=membership.id,
            workspace_id=workspace.id,
            workspace_name=workspace.name,
            workspace_slug=workspace.slug,
            role=membership.role,
        )
        for membership, workspace in rows
    ]


def build_workspace_member_read(
    membership: WorkspaceMembership,
    user: User,
) -> WorkspaceMemberRead:
    return WorkspaceMemberRead(
        id=membership.id,
        user_id=membership.user_id,
        workspace_id=membership.workspace_id,
        role=membership.role,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        phone=user.phone,
    )


@router.get(
    "/{workspace_id}/membership",
    response_model=MembershipRead,
)
def get_my_workspace_membership(
    workspace_id: UUID,
    membership: WorkspaceMembership = Depends(
        get_current_membership
    ),
) -> WorkspaceMembership:
    return membership


@router.get(
    "/{workspace_id}/admin-check",
    response_model=MembershipRead,
)
def admin_check(
    workspace_id: UUID,
    membership: WorkspaceMembership = Depends(
        require_workspace_roles(
            WorkspaceRole.OWNER,
            WorkspaceRole.ADMIN,
        )
    ),
) -> WorkspaceMembership:
    return membership


@router.get(
    "/{workspace_id}/members",
    response_model=list[
        WorkspaceMemberRead
    ],
)
def get_workspace_members(
    workspace_id: UUID,
    _: WorkspaceMembership = Depends(
        require_workspace_roles(
            WorkspaceRole.OWNER,
            WorkspaceRole.ADMIN,
        )
    ),
    db: Session = Depends(get_db),
):
    rows = list_workspace_members(
        db,
        workspace_id,
    )

    return [
        build_workspace_member_read(
            membership,
            user,
        )
        for membership, user in rows
    ]


@router.post(
    "/{workspace_id}/members",
    response_model=WorkspaceMemberRead,
    status_code=status.HTTP_201_CREATED,
)
def create_workspace_member(
    workspace_id: UUID,
    data: WorkspaceMemberCreate,
    actor: WorkspaceMembership = Depends(
        require_workspace_roles(
            WorkspaceRole.OWNER,
            WorkspaceRole.ADMIN,
        )
    ),
    db: Session = Depends(get_db),
):
    try:
        membership, user = (
            add_workspace_member(
                db,
                actor,
                data.email,
                data.role,
            )
        )

    except PermissionError as exc:
        raise HTTPException(
            status_code=(
                status.HTTP_403_FORBIDDEN
            ),
            detail=str(exc),
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=(
                status.HTTP_409_CONFLICT
            ),
            detail=str(exc),
        ) from exc

    return build_workspace_member_read(
        membership,
        user,
    )


@router.patch(
    "/{workspace_id}/members/{membership_id}",
    response_model=WorkspaceMemberRead,
)
def edit_workspace_member(
    workspace_id: UUID,
    membership_id: UUID,
    data: WorkspaceMemberUpdate,
    actor: WorkspaceMembership = Depends(
        require_workspace_roles(
            WorkspaceRole.OWNER,
            WorkspaceRole.ADMIN,
        )
    ),
    db: Session = Depends(get_db),
):
    try:
        membership, user = (
            update_workspace_member_role(
                db,
                actor,
                membership_id,
                data.role,
            )
        )

    except PermissionError as exc:
        raise HTTPException(
            status_code=(
                status.HTTP_403_FORBIDDEN
            ),
            detail=str(exc),
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=(
                status.HTTP_409_CONFLICT
            ),
            detail=str(exc),
        ) from exc

    return build_workspace_member_read(
        membership,
        user,
    )


@router.delete(
    "/{workspace_id}/members/{membership_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_workspace_member(
    workspace_id: UUID,
    membership_id: UUID,
    actor: WorkspaceMembership = Depends(
        require_workspace_roles(
            WorkspaceRole.OWNER,
            WorkspaceRole.ADMIN,
        )
    ),
    db: Session = Depends(get_db),
):
    try:
        remove_workspace_member(
            db,
            actor,
            membership_id,
        )

    except PermissionError as exc:
        raise HTTPException(
            status_code=(
                status.HTTP_403_FORBIDDEN
            ),
            detail=str(exc),
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=(
                status.HTTP_409_CONFLICT
            ),
            detail=str(exc),
        ) from exc

    except IntegrityError as exc:
        db.rollback()

        raise HTTPException(
            status_code=(
                status.HTTP_409_CONFLICT
            ),
            detail=(
                "Workspace member cannot be removed while "
                "they own CRM records"
            ),
        ) from exc