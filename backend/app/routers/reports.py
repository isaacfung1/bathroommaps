"""Router for cleanliness report endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.bathroom import Bathroom
from app.models.report import Report
from app.schemas.report import ReportCreate, ReportResponse

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.post(
    "",
    response_model=ReportResponse,
    status_code=status.HTTP_201_CREATED,
)
async def submit_report(
    body: ReportCreate,
    db: AsyncSession = Depends(get_db),
):
    """Submit a new cleanliness report for a bathroom."""

    # Verify the bathroom exists.
    stmt = select(Bathroom).where(Bathroom.id == body.bathroom_id)
    result = await db.execute(stmt)
    bathroom = result.scalar_one_or_none()

    if bathroom is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bathroom {body.bathroom_id} not found.",
        )

    report = Report(
        bathroom_id=body.bathroom_id,
        cleanliness_rating=body.cleanliness_rating,
    )
    db.add(report)
    await db.flush()
    await db.refresh(report)

    return ReportResponse.model_validate(report)
