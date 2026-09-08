from __future__ import annotations

from datetime import datetime
from enum import Enum
from uuid import UUID

from sqlalchemy import (
    DateTime,
    Enum as SqlEnum,
    ForeignKey,
    ForeignKeyConstraint,
    Index,
    String,
    Text,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.database.base import CoreModel
from app.shared.database.mixins import WorkspaceOwnedMixin


class ActivityType(str, Enum):
    CALL = "call"
    EMAIL = "email"
    MEETING = "meeting"
    TASK = "task"
    NOTE = "note"


class Activity(WorkspaceOwnedMixin, CoreModel):
    __tablename__ = "activities"
    __table_args__ = (
        ForeignKeyConstraint(
            ["company_id", "workspace_id"],
            ["companies.id", "companies.workspace_id"],
            name="fk_activities_company_workspace",
        ),
        ForeignKeyConstraint(
            ["contact_id", "workspace_id"],
            ["contacts.id", "contacts.workspace_id"],
            name="fk_activities_contact_workspace",
        ),
        ForeignKeyConstraint(
            ["deal_id", "workspace_id"],
            ["deals.id", "deals.workspace_id"],
            name="fk_activities_deal_workspace",
        ),
        ForeignKeyConstraint(
            ["workspace_id", "owner_membership_id"],
            [
                "workspace_memberships.workspace_id",
                "workspace_memberships.id",
            ],
            name="fk_activities_workspace_owner_membership",
            ondelete="RESTRICT",
        ),
        Index(
            "ix_activities_workspace_id_type",
            "workspace_id",
            "type",
        ),
        Index(
            "ix_activities_workspace_id_due_at",
            "workspace_id",
            "due_at",
        ),
        Index(
            "ix_activities_workspace_id_owner_membership_id",
            "workspace_id",
            "owner_membership_id",
        ),
    )

    workspace_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey(
            "workspaces.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    company_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        nullable=True,
    )

    contact_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        nullable=True,
    )

    deal_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        nullable=True,
    )

    owner_membership_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        nullable=True,
    )

    type: Mapped[ActivityType] = mapped_column(
        SqlEnum(
            ActivityType,
            name="activity_type",
            values_callable=lambda enum_class: [
                member.value for member in enum_class
            ],
        ),
        nullable=False,
    )

    subject: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    due_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    owner_membership: Mapped["WorkspaceMembership | None"] = relationship(
        foreign_keys=[owner_membership_id],
    )