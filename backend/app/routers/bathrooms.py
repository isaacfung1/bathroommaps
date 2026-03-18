"""Router for bathroom-related endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.bathroom import Bathroom
from app.schemas.bathroom import BathroomCreate, BathroomResponse, NearbyParams, RecommendedParams
from app.services.bathroom import get_nearby_bathrooms, get_recommended_bathroom

router = APIRouter(prefix="/bathrooms", tags=["Bathrooms"])


def _to_response(entry: dict) -> BathroomResponse:
    """Convert a service-layer dict into a BathroomResponse."""
    b: Bathroom = entry["bathroom"]
    return BathroomResponse(
        id=b.id,
        name=b.name,
        gender=b.gender,
        is_accessible=b.is_accessible,
        building=b.building,
        floor=b.floor,
        latitude=b.latitude,
        longitude=b.longitude,
        num_stalls=b.num_stalls,
        num_urinals=b.num_urinals,
        num_sinks=b.num_sinks,
        created_at=b.created_at,
        distance_meters=entry.get("distance_meters"),
        avg_cleanliness=entry.get("avg_cleanliness"),
        score=entry.get("score"),
    )


# ------------------------------------------------------------------
# GET /bathrooms/nearby
# ------------------------------------------------------------------


@router.get("/nearby", response_model=list[BathroomResponse])
async def nearby_bathrooms(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    db: AsyncSession = Depends(get_db),
):
    """Return bathrooms sorted by distance from the given coordinates."""
    results = await get_nearby_bathrooms(db, latitude, longitude)
    return [_to_response(r) for r in results]


# ------------------------------------------------------------------
# GET /bathrooms/recommended
# ------------------------------------------------------------------


@router.get("/recommended", response_model=BathroomResponse)
async def recommended_bathroom(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    user_floor: int = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """Return the single best bathroom based on the scoring algorithm."""
    result = await get_recommended_bathroom(db, latitude, longitude, user_floor)

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No bathrooms found nearby.",
        )

    return _to_response(result)


# ------------------------------------------------------------------
# POST /bathrooms  (admin / seed helper)
# ------------------------------------------------------------------


@router.post(
    "",
    response_model=BathroomResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_bathroom(
    body: BathroomCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new bathroom entry."""
    from geoalchemy2.functions import ST_MakePoint, ST_SetSRID

    bathroom = Bathroom(
        name=body.name,
        gender=body.gender,
        is_accessible=body.is_accessible,
        building=body.building,
        floor=body.floor,
        latitude=body.latitude,
        longitude=body.longitude,
        location=ST_SetSRID(ST_MakePoint(body.longitude, body.latitude), 4326),
        num_stalls=body.num_stalls,
        num_urinals=body.num_urinals,
        num_sinks=body.num_sinks,
    )
    db.add(bathroom)
    await db.flush()
    await db.refresh(bathroom)

    return BathroomResponse(
        id=bathroom.id,
        name=bathroom.name,
        gender=bathroom.gender,
        is_accessible=bathroom.is_accessible,
        building=bathroom.building,
        floor=bathroom.floor,
        latitude=bathroom.latitude,
        longitude=bathroom.longitude,
        num_stalls=bathroom.num_stalls,
        num_urinals=bathroom.num_urinals,
        num_sinks=bathroom.num_sinks,
        created_at=bathroom.created_at,
    )
