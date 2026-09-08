from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from sqlalchemy import (
    CheckConstraint,
    ForeignKey,
    ForeignKeyConstraint,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.database.base import CoreModel
from app.shared.database.mixins import WorkspaceOwnedMixin


class Company(WorkspaceOwnedMixin, CoreModel):
    __tablename__ = "companies"
    __table_args__ = (
        UniqueConstraint(
            "id",
            "workspace_id",
            name="uq_companies_id_workspace_id",
        ),
        ForeignKeyConstraint(
            ["workspace_id", "owner_membership_id"],
            [
                "workspace_memberships.workspace_id",
                "workspace_memberships.id",
            ],
            name="fk_companies_workspace_owner_membership",
            ondelete="RESTRICT",
        ),
        CheckConstraint(
            "employee_count IS NULL OR employee_count >= 0",
            name="employee_count_nonnegative",
        ),
        CheckConstraint(
            "annual_revenue IS NULL OR annual_revenue >= 0",
            name="annual_revenue_nonnegative",
        ),
        Index(
            "ix_companies_workspace_id_normalized_name",
            "workspace_id",
            "normalized_name",
        ),
        Index(
            "ix_companies_workspace_id_domain",
            "workspace_id",
            "domain",
        ),
        Index(
            "ix_companies_workspace_id_owner_membership_id",
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

    owner_membership_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        nullable=True,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    normalized_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    domain: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    website: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    phone: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    industry: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    employee_count: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    annual_revenue: Mapped[Decimal | None] = mapped_column(
        Numeric(18, 2),
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

    contacts: Mapped[list["Contact"]] = relationship(
        back_populates="company",
        passive_deletes=True,
        foreign_keys="Contact.company_id",
    )