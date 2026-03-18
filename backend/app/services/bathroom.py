"""Service layer for bathroom queries and recommendation logic."""

from datetime import datetime, timedelta, timezone
from typing import Optional

from geoalchemy2.functions import ST_Distance, ST_MakePoint, ST_SetSRID
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.bathroom import Bathroom
from app.models.report import Report
from app.services.scoring import compute_score


async def get_nearby_bathrooms(
    db: AsyncSession,
    latitude: float,
    longitude: float,
    limit: int = 10,
) -> list[dict]:
    """Return the closest bathrooms sorted by distance.

    Uses PostGIS ST_Distance on the geography column for accurate
    great-circle distance (metres).
    """
    user_point = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)

    distance_col = ST_Distance(Bathroom.location, user_point).label("distance")

    stmt = (
        select(Bathroom, distance_col)
        .order_by(distance_col)
        .limit(limit)
    )

    result = await db.execute(stmt)
    rows = result.all()

    bathrooms = []
    for bathroom, distance in rows:
        bathrooms.append({
            "bathroom": bathroom,
            "distance_meters": round(distance, 2),
        })

    return bathrooms


async def _avg_cleanliness(
    db: AsyncSession,
    bathroom_id,
    window_hours: int,
) -> Optional[float]:
    """Compute the average cleanliness rating within the last *window_hours*."""
    cutoff = datetime.now(timezone.utc) - timedelta(hours=window_hours)

    stmt = select(func.avg(Report.cleanliness_rating)).where(
        Report.bathroom_id == bathroom_id,
        Report.created_at >= cutoff,
    )
    result = await db.execute(stmt)
    return result.scalar()


async def get_recommended_bathroom(
    db: AsyncSession,
    latitude: float,
    longitude: float,
    user_floor: int,
) -> Optional[dict]:
    """Return the single best bathroom based on the scoring algorithm.

    1. Fetch the nearest ~N bathrooms (see NEARBY_LIMIT setting).
    2. For each, compute avg cleanliness from recent reports.
    3. Score each using the weighted formula in services/scoring.py.
    4. Return the bathroom with the lowest (best) score.
    """
    nearby = await get_nearby_bathrooms(
        db, latitude, longitude, limit=settings.NEARBY_LIMIT
    )

    if not nearby:
        return None

    best: Optional[dict] = None
    best_score: float = float("inf")

    for entry in nearby:
        bathroom: Bathroom = entry["bathroom"]
        distance: float = entry["distance_meters"]

        avg_clean = await _avg_cleanliness(
            db, bathroom.id, settings.REPORT_WINDOW_HOURS
        )
        if avg_clean is None:
            avg_clean = 3.0  # neutral default when no recent reports exist

        score = compute_score(
            distance=distance,
            avg_cleanliness=avg_clean,
            capacity=bathroom.capacity,
            user_floor=user_floor,
            bathroom_floor=bathroom.floor,
        )

        if score < best_score:
            best_score = score
            best = {
                "bathroom": bathroom,
                "distance_meters": distance,
                "avg_cleanliness": round(avg_clean, 2),
                "score": round(score, 4),
            }

    return best
