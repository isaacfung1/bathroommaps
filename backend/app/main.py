"""Campus Bathroom Finder — FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.base import Base
from app.db.session import engine
from app.routers import bathrooms, reports


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup (dev convenience).

    In production you would rely on Alembic migrations instead.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="Campus Bathroom Finder",
    description="Find the best bathroom on campus based on distance, cleanliness, capacity, and floor level.",
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(bathrooms.router)
app.include_router(reports.router)


@app.get("/", tags=["Health"])
async def health_check():
    """Simple health-check endpoint."""
    return {"status": "ok", "app": "Campus Bathroom Finder"}