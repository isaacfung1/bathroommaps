"""Pydantic schemas for bathroom request/response validation."""

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Query parameters
# ---------------------------------------------------------------------------


class NearbyParams(BaseModel):
    """Query parameters for the nearby-bathrooms endpoint."""

    latitude: float = Field(..., ge=-90, le=90, description="User latitude")
    longitude: float = Field(..., ge=-180, le=180, description="User longitude")


class RecommendedParams(BaseModel):
    """Query parameters for the recommended-bathroom endpoint."""

    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    user_floor: int = Field(..., description="Floor the user is currently on")


# ---------------------------------------------------------------------------
# Request bodies
# ---------------------------------------------------------------------------


class BathroomCreate(BaseModel):
    """Body for creating a new bathroom (admin / seed use)."""

    name: str = Field(..., max_length=255)
    gender: str = Field(default="unisex", max_length=50)
    is_accessible: bool = False
    building: str = Field(..., max_length=255)
    floor: int = 1
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    num_stalls: int = Field(default=0, ge=0)
    num_urinals: int = Field(default=0, ge=0)
    num_sinks: int = Field(default=0, ge=0)


# ---------------------------------------------------------------------------
# Responses
# ---------------------------------------------------------------------------


class BathroomResponse(BaseModel):
    """Serialized bathroom returned to the client."""

    id: uuid.UUID
    name: str
    gender: str
    is_accessible: bool
    building: str
    floor: int
    latitude: float
    longitude: float
    num_stalls: int
    num_urinals: int
    num_sinks: int
    created_at: datetime

    # Computed / optional fields populated by the service layer.
    distance_meters: Optional[float] = None
    avg_cleanliness: Optional[float] = None
    score: Optional[float] = None

    model_config = {"from_attributes": True}
