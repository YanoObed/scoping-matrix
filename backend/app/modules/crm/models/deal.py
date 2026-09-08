from __future__ import annotations

from datetime import date
from decimal import Decimal
from enum import Enum
from uuid import UUID

from sqlalchemy import (
    Enum as SqlEnum,
    ForeignKey,
    ForeignKeyConstraint,
    Index,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.database.base import CoreModel
from app.shared.database.mixins import WorkspaceOwnedMixin


class DealStage(str, Enum):
    LEAD = "lead"
    QUALIFIED = "qualified"
    PROPOSAL = "proposal"
    NEGOTIATION = "negotiation"
    WON = "won"
    LOST = "lost"


class Deal(WorkspaceOwnedMixin, CoreModel):
    __tablename__ = "deals"
    __table_args__ = (
        UniqueConstraint(
            "id",
            "workspace_id",
            name="uq_deals_id_workspace_id",
        ),
        ForeignKeyConstraint(
            ["company_id", "workspace_id"],
            [
                "companies.id",
                "companies.workspace_id",
            ],
            name="fk_deals_company_workspace",
        ),
        ForeignKeyConstraint(
            ["contact_id", "workspace_id"],
            [
                "contacts.id",
                "contacts.workspace_id",
            ],
            name="fk_deals_contact_workspace",
        ),
        ForeignKeyConstraint(
            ["workspace_id", "owner_membership_id"],
            [
                "workspace_memberships.workspace_id",
                "workspace_memberships.id",
            ],
            name="fk_deals_workspace_owner_membership",
            ondelete="RESTRICT",
        ),
        Index(
            "ix_deals_workspace_id_stage",
            "workspace_id",
            "stage",
        ),
        Index(
            "ix_deals_workspace_id_company_id",
            "workspace_id",
            "company_id",
        ),
        Index(
            "ix_deals_workspace_id_contact_id",
            "workspace_id",
            "contact_id",
        ),
        Index(
            "ix_deals_workspace_id_owner_membership_id",
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

    owner_membership_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        nullable=True,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    amount: Mapped[Decimal | None] = mapped_column(
        Numeric(18, 2),
        nullable=True,
    )

    stage: Mapped[DealStage] = mapped_column(
        SqlEnum(
            DealStage,
            name="deal_stage",
            values_callable=lambda enum_class: [
                member.value for member in enum_class
            ],
        ),
        nullable=False,
        default=DealStage.LEAD,
    )

    probability: Mapped[int | None] = mapped_column(
        nullable=True,
    )

    expected_close_date: Mapped[date | None] = mapped_column(
        nullable=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    owner_membership: Mapped["WorkspaceMembership | None"] = relationship(
        foreign_keys=[owner_membership_id],
    )

    company: Mapped["Company | None"] = relationship(
        foreign_keys=[company_id],
    )

    contact: Mapped["Contact | None"] = relationship(
        foreign_keys=[contact_id],
    )