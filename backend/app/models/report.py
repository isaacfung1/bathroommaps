"""SQLAlchemy model for the reports table."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Index, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Report(Base):
    """A user-submitted cleanliness report for a bathroom."""

    __tablename__ = "reports"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    bathroom_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("bathrooms.id", ondelete="CASCADE"),
        nullable=False,
    )
    cleanliness_rating: Mapped[float] = mapped_column(
        Float, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationship back to bathroom.
    bathroom = relationship("Bathroom", back_populates="reports")

    __table_args__ = (
        Index("idx_reports_bathroom_created", "bathroom_id", "created_at"),
    )
