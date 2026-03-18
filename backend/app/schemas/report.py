"""Pydantic schemas for cleanliness report request/response validation."""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class ReportCreate(BaseModel):
    """Body for submitting a new cleanliness report."""

    bathroom_id: uuid.UUID
    cleanliness_rating: float = Field(
        ..., ge=1.0, le=5.0, description="Rating from 1 (dirty) to 5 (clean)"
    )


class ReportResponse(BaseModel):
    """Serialized report returned to the client."""

    id: uuid.UUID
    bathroom_id: uuid.UUID
    cleanliness_rating: float
    created_at: datetime

    model_config = {"from_attributes": True}
