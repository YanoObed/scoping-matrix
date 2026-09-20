from __future__ import annotations

import enum
import uuid

from sqlalchemy import Enum, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.database.base import CoreModel


class WorkspaceRole(str, enum.Enum):
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"


class WorkspaceMembership(CoreModel):
    __tablename__ = "workspace_memberships"

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "workspace_id",
            name="uq_workspace_memberships_user_id_workspace_id",
        ),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    workspace_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey(
            "workspaces.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    role: Mapped[WorkspaceRole] = mapped_column(
        Enum(
            WorkspaceRole,
            name="workspace_role",
            values_callable=lambda enum_class: [
                member.value for member in enum_class
            ],
        ),
        nullable=False,
        default=WorkspaceRole.MEMBER,
    )

    user: Mapped["User"] = relationship(
        back_populates="workspace_memberships",
    )

    workspace: Mapped["Workspace"] = relationship(
        back_populates="memberships",
    )