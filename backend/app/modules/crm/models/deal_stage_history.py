from uuid import UUID

from sqlalchemy import (
    ForeignKey,
    ForeignKeyConstraint,
    Index,
    String,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.shared.database.base import CoreModel
from app.shared.database.mixins import WorkspaceOwnedMixin


class DealStageHistory(WorkspaceOwnedMixin, CoreModel):
    __tablename__ = "deal_stage_history"
    __table_args__ = (
        ForeignKeyConstraint(
            ["deal_id", "workspace_id"],
            [
                "deals.id",
                "deals.workspace_id",
            ],
            name="fk_deal_stage_history_deal_workspace",
            ondelete="CASCADE",
        ),
        Index(
            "ix_deal_stage_history_workspace_id_deal_id",
            "workspace_id",
            "deal_id",
        ),
        Index(
            "ix_deal_stage_history_workspace_id_created_at",
            "workspace_id",
            "created_at",
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

    deal_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        nullable=False,
    )

    from_stage: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    to_stage: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    changed_by_membership_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        nullable=False,
    )