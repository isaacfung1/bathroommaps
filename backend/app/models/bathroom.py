"""SQLAlchemy model for the bathrooms table."""

import uuid
from datetime import datetime, timezone

from geoalchemy2 import Geography
from sqlalchemy import Boolean, DateTime, Float, Index, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Bathroom(Base):
    """A campus bathroom with its location and facility details."""

    __tablename__ = "bathrooms"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    gender: Mapped[str] = mapped_column(
        String(50), nullable=False, default="unisex"
    )
    is_accessible: Mapped[bool] = mapped_column(Boolean, default=False)
    building: Mapped[str] = mapped_column(String(255), nullable=False)
    floor: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)

    # PostGIS geography column for spatial queries (SRID 4326 = WGS 84).
    location = mapped_column(
        Geography(geometry_type="POINT", srid=4326), nullable=False
    )

    num_stalls: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    num_urinals: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    num_sinks: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationship to cleanliness reports.
    reports = relationship("Report", back_populates="bathroom", lazy="selectin")

    __table_args__ = (
        Index("idx_bathrooms_location", location, postgresql_using="gist"),
    )

    @property
    def capacity(self) -> int:
        """Total capacity (stalls + urinals)."""
        return self.num_stalls + self.num_urinals
