from __future__ import annotations

from uuid import UUID

from sqlalchemy import (
    ForeignKey,
    ForeignKeyConstraint,
    Index,
    String,
    Text,
    UniqueConstraint,
    Uuid,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.database.base import CoreModel
from app.shared.database.mixins import WorkspaceOwnedMixin


class Contact(WorkspaceOwnedMixin, CoreModel):
    __tablename__ = "contacts"
    __table_args__ = (
        UniqueConstraint(
            "id",
            "workspace_id",
            name="uq_contacts_id_workspace_id",
        ),
        ForeignKeyConstraint(
            ["company_id", "workspace_id"],
            ["companies.id", "companies.workspace_id"],
            name="fk_contacts_company_workspace",
        ),
        ForeignKeyConstraint(
            ["workspace_id", "owner_membership_id"],
            [
                "workspace_memberships.workspace_id",
                "workspace_memberships.id",
            ],
            name="fk_contacts_workspace_owner_membership",
            ondelete="RESTRICT",
        ),
        Index(
            "ix_contacts_workspace_id_company_id",
            "workspace_id",
            "company_id",
        ),
        Index(
            "ix_contacts_workspace_id_owner_membership_id",
            "workspace_id",
            "owner_membership_id",
        ),
        Index(
            "ix_contacts_workspace_id_last_name",
            "workspace_id",
            "last_name",
        ),
        Index(
            "uq_contacts_workspace_id_normalized_email",
            "workspace_id",
            "normalized_email",
            unique=True,
            postgresql_where=text("normalized_email IS NOT NULL"),
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

    owner_membership_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        nullable=True,
    )

    first_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    last_name: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    email: Mapped[str | None] = mapped_column(
        String(320),
        nullable=True,
    )

    normalized_email: Mapped[str | None] = mapped_column(
        String(320),
        nullable=True,
    )

    phone: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    mobile_phone: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    job_title: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    department: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    linkedin_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    address_line1: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    address_line2: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    city: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    state_region: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    postal_code: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )

    country: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    owner_membership: Mapped["WorkspaceMembership | None"] = relationship(
        foreign_keys=[owner_membership_id],
    )

    company: Mapped["Company | None"] = relationship(
        back_populates="contacts",
        foreign_keys=[company_id],
    )