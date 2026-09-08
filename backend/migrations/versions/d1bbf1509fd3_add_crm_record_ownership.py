"""add crm record ownership

Revision ID: d1bbf1509fd3
Revises: 82bc95b49e7b
Create Date: 2026-08-24 10:06:36.230466

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "d1bbf1509fd3"
down_revision: Union[str, Sequence[str], None] = "82bc95b49e7b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_unique_constraint(
        "uq_workspace_memberships_workspace_id_id",
        "workspace_memberships",
        ["workspace_id", "id"],
    )

    op.add_column(
        "activities",
        sa.Column(
            "owner_membership_id",
            sa.Uuid(),
            nullable=True,
        ),
    )
    op.create_index(
        "ix_activities_workspace_id_owner_membership_id",
        "activities",
        ["workspace_id", "owner_membership_id"],
        unique=False,
    )
    op.create_foreign_key(
        "fk_activities_workspace_owner_membership",
        "activities",
        "workspace_memberships",
        ["workspace_id", "owner_membership_id"],
        ["workspace_id", "id"],
        ondelete="RESTRICT",
    )

    op.add_column(
        "companies",
        sa.Column(
            "owner_membership_id",
            sa.Uuid(),
            nullable=True,
        ),
    )
    op.create_index(
        "ix_companies_workspace_id_owner_membership_id",
        "companies",
        ["workspace_id", "owner_membership_id"],
        unique=False,
    )
    op.create_foreign_key(
        "fk_companies_workspace_owner_membership",
        "companies",
        "workspace_memberships",
        ["workspace_id", "owner_membership_id"],
        ["workspace_id", "id"],
        ondelete="RESTRICT",
    )

    op.add_column(
        "contacts",
        sa.Column(
            "owner_membership_id",
            sa.Uuid(),
            nullable=True,
        ),
    )
    op.create_index(
        "ix_contacts_workspace_id_owner_membership_id",
        "contacts",
        ["workspace_id", "owner_membership_id"],
        unique=False,
    )
    op.create_foreign_key(
        "fk_contacts_workspace_owner_membership",
        "contacts",
        "workspace_memberships",
        ["workspace_id", "owner_membership_id"],
        ["workspace_id", "id"],
        ondelete="RESTRICT",
    )

    op.add_column(
        "deals",
        sa.Column(
            "owner_membership_id",
            sa.Uuid(),
            nullable=True,
        ),
    )
    op.create_index(
        "ix_deals_workspace_id_owner_membership_id",
        "deals",
        ["workspace_id", "owner_membership_id"],
        unique=False,
    )
    op.create_foreign_key(
        "fk_deals_workspace_owner_membership",
        "deals",
        "workspace_memberships",
        ["workspace_id", "owner_membership_id"],
        ["workspace_id", "id"],
        ondelete="RESTRICT",
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_constraint(
        "fk_deals_workspace_owner_membership",
        "deals",
        type_="foreignkey",
    )
    op.drop_index(
        "ix_deals_workspace_id_owner_membership_id",
        table_name="deals",
    )
    op.drop_column(
        "deals",
        "owner_membership_id",
    )

    op.drop_constraint(
        "fk_contacts_workspace_owner_membership",
        "contacts",
        type_="foreignkey",
    )
    op.drop_index(
        "ix_contacts_workspace_id_owner_membership_id",
        table_name="contacts",
    )
    op.drop_column(
        "contacts",
        "owner_membership_id",
    )

    op.drop_constraint(
        "fk_companies_workspace_owner_membership",
        "companies",
        type_="foreignkey",
    )
    op.drop_index(
        "ix_companies_workspace_id_owner_membership_id",
        table_name="companies",
    )
    op.drop_column(
        "companies",
        "owner_membership_id",
    )

    op.drop_constraint(
        "fk_activities_workspace_owner_membership",
        "activities",
        type_="foreignkey",
    )
    op.drop_index(
        "ix_activities_workspace_id_owner_membership_id",
        table_name="activities",
    )
    op.drop_column(
        "activities",
        "owner_membership_id",
    )

    op.drop_constraint(
        "uq_workspace_memberships_workspace_id_id",
        "workspace_memberships",
        type_="unique",
    )