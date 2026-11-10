from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, Index, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.shared.database.base import CoreModel


class OutboxEvent(CoreModel):
    __tablename__ = "outbox_events"
    __table_args__ = (
        Index(
            "ix_outbox_events_published_at_created_at",
            "published_at",
            "created_at",
        ),
    )

    event_type: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    aggregate_key: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    payload: Mapped[dict[str, Any]] = mapped_column(
        JSON,
        nullable=False,
    )

    published_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )