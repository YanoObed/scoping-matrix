"""add activities

Revision ID: 82bc95b49e7b
Revises: 6ab78042f839
Create Date: 2026-08-24 09:45:05.705001

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "82bc95b49e7b"
down_revision: Union[str, Sequence[str], None] = "6ab78042f839"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_unique_constraint(
        "uq_deals_id_workspace_id",
        "deals",
        ["id", "workspace_id"],
    )

    op.create_table(
        "activities",
        sa.Column(
            "workspace_id",
            sa.Uuid(),
            nullable=False,
        ),
        sa.Column(
            "company_id",
            sa.Uuid(),
            nullable=True,
        ),
        sa.Column(
            "contact_id",
            sa.Uuid(),
            nullable=True,
        ),
        sa.Column(
            "deal_id",
            sa.Uuid(),
            nullable=True,
        ),
        sa.Column(
            "type",
            sa.Enum(
                "call",
                "email",
                "meeting",
                "task",
                "note",
                name="activity_type",
            ),
            nullable=False,
        ),
        sa.Column(
            "subject",
            sa.String(length=255),
            nullable=False,
        ),
        sa.Column(
            "description",
            sa.Text(),
            nullable=True,
        ),
        sa.Column(
            "due_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
        sa.Column(
            "completed_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
        sa.Column(
            "id",
            sa.Uuid(),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["company_id", "workspace_id"],
            ["companies.id", "companies.workspace_id"],
            name="fk_activities_company_workspace",
        ),
        sa.ForeignKeyConstraint(
            ["contact_id", "workspace_id"],
            ["contacts.id", "contacts.workspace_id"],
            name="fk_activities_contact_workspace",
        ),
        sa.ForeignKeyConstraint(
            ["deal_id", "workspace_id"],
            ["deals.id", "deals.workspace_id"],
            name="fk_activities_deal_workspace",
        ),
        sa.ForeignKeyConstraint(
            ["workspace_id"],
            ["workspaces.id"],
            name=op.f("fk_activities_workspace_id_workspaces"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint(
            "id",
            name=op.f("pk_activities"),
        ),
    )

    op.create_index(
        op.f("ix_activities_workspace_id"),
        "activities",
        ["workspace_id"],
        unique=False,
    )

    op.create_index(
        "ix_activities_workspace_id_due_at",
        "activities",
        ["workspace_id", "due_at"],
        unique=False,
    )

    op.create_index(
        "ix_activities_workspace_id_type",
        "activities",
        ["workspace_id", "type"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_index(
        "ix_activities_workspace_id_type",
        table_name="activities",
    )

    op.drop_index(
        "ix_activities_workspace_id_due_at",
        table_name="activities",
    )

    op.drop_index(
        op.f("ix_activities_workspace_id"),
        table_name="activities",
    )

    op.drop_table("activities")

    op.drop_constraint(
        "uq_deals_id_workspace_id",
        "deals",
        type_="unique",
    )