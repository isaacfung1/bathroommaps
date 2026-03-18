"""Seed script — populate the database with sample campus bathrooms and reports.

Usage:
    cd backend
    python -m scripts.seed
"""

import asyncio
import uuid
from datetime import datetime, timedelta, timezone

from geoalchemy2.functions import ST_MakePoint, ST_SetSRID
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import async_session, engine
from app.db.base import Base
from app.models.bathroom import Bathroom
from app.models.report import Report


# ---------------------------------------------------------------------------
# Sample data (roughly modelled on a generic US university campus)
# ---------------------------------------------------------------------------

BATHROOMS = [
    {
        "name": "Main Library 1F Men's",
        "gender": "male",
        "is_accessible": True,
        "building": "Main Library",
        "floor": 1,
        "latitude": 40.8076,
        "longitude": -73.9626,
        "num_stalls": 3,
        "num_urinals": 2,
        "num_sinks": 3,
    },
    {
        "name": "Main Library 1F Women's",
        "gender": "female",
        "is_accessible": True,
        "building": "Main Library",
        "floor": 1,
        "latitude": 40.8076,
        "longitude": -73.9625,
        "num_stalls": 5,
        "num_urinals": 0,
        "num_sinks": 3,
    },
    {
        "name": "Main Library 3F Unisex",
        "gender": "unisex",
        "is_accessible": False,
        "building": "Main Library",
        "floor": 3,
        "latitude": 40.8077,
        "longitude": -73.9627,
        "num_stalls": 1,
        "num_urinals": 0,
        "num_sinks": 1,
    },
    {
        "name": "Science Hall B1 Gender Neutral",
        "gender": "gender_neutral",
        "is_accessible": True,
        "building": "Science Hall",
        "floor": -1,
        "latitude": 40.8082,
        "longitude": -73.9610,
        "num_stalls": 4,
        "num_urinals": 3,
        "num_sinks": 4,
    },
    {
        "name": "Science Hall 2F Men's",
        "gender": "male",
        "is_accessible": False,
        "building": "Science Hall",
        "floor": 2,
        "latitude": 40.8083,
        "longitude": -73.9611,
        "num_stalls": 2,
        "num_urinals": 3,
        "num_sinks": 2,
    },
    {
        "name": "Student Center 1F Unisex",
        "gender": "unisex",
        "is_accessible": True,
        "building": "Student Center",
        "floor": 1,
        "latitude": 40.8070,
        "longitude": -73.9635,
        "num_stalls": 6,
        "num_urinals": 4,
        "num_sinks": 5,
    },
    {
        "name": "Student Center 2F Women's",
        "gender": "female",
        "is_accessible": True,
        "building": "Student Center",
        "floor": 2,
        "latitude": 40.8071,
        "longitude": -73.9636,
        "num_stalls": 4,
        "num_urinals": 0,
        "num_sinks": 3,
    },
    {
        "name": "Engineering Bldg 1F Men's",
        "gender": "male",
        "is_accessible": False,
        "building": "Engineering Building",
        "floor": 1,
        "latitude": 40.8090,
        "longitude": -73.9600,
        "num_stalls": 3,
        "num_urinals": 4,
        "num_sinks": 3,
    },
    {
        "name": "Engineering Bldg 4F Gender Neutral",
        "gender": "gender_neutral",
        "is_accessible": True,
        "building": "Engineering Building",
        "floor": 4,
        "latitude": 40.8091,
        "longitude": -73.9601,
        "num_stalls": 2,
        "num_urinals": 0,
        "num_sinks": 2,
    },
    {
        "name": "Arts Center 1F Unisex",
        "gender": "unisex",
        "is_accessible": True,
        "building": "Arts Center",
        "floor": 1,
        "latitude": 40.8065,
        "longitude": -73.9640,
        "num_stalls": 2,
        "num_urinals": 1,
        "num_sinks": 2,
    },
]


async def seed() -> None:
    """Insert sample bathrooms and reports into the database."""
    # Ensure tables exist.
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:  # type: AsyncSession
        bathroom_ids: list[uuid.UUID] = []

        for data in BATHROOMS:
            bathroom = Bathroom(
                name=data["name"],
                gender=data["gender"],
                is_accessible=data["is_accessible"],
                building=data["building"],
                floor=data["floor"],
                latitude=data["latitude"],
                longitude=data["longitude"],
                location=ST_SetSRID(
                    ST_MakePoint(data["longitude"], data["latitude"]), 4326
                ),
                num_stalls=data["num_stalls"],
                num_urinals=data["num_urinals"],
                num_sinks=data["num_sinks"],
            )
            session.add(bathroom)
            await session.flush()
            bathroom_ids.append(bathroom.id)

        # Add a few sample cleanliness reports (recent).
        now = datetime.now(timezone.utc)
        sample_reports = [
            Report(
                bathroom_id=bathroom_ids[0],
                cleanliness_rating=4.5,
                created_at=now - timedelta(minutes=10),
            ),
            Report(
                bathroom_id=bathroom_ids[0],
                cleanliness_rating=4.0,
                created_at=now - timedelta(minutes=30),
            ),
            Report(
                bathroom_id=bathroom_ids[3],
                cleanliness_rating=2.0,
                created_at=now - timedelta(minutes=5),
            ),
            Report(
                bathroom_id=bathroom_ids[5],
                cleanliness_rating=5.0,
                created_at=now - timedelta(minutes=15),
            ),
            Report(
                bathroom_id=bathroom_ids[5],
                cleanliness_rating=4.5,
                created_at=now - timedelta(minutes=45),
            ),
            Report(
                bathroom_id=bathroom_ids[7],
                cleanliness_rating=3.0,
                created_at=now - timedelta(minutes=20),
            ),
        ]
        session.add_all(sample_reports)

        await session.commit()

    print(f"✅ Seeded {len(BATHROOMS)} bathrooms and {len(sample_reports)} reports.")


if __name__ == "__main__":
    asyncio.run(seed())
