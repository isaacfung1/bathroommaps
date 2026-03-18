"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Global application settings.

    Values are loaded from environment variables or a .env file located
    in the project root (backend/).
    """

    DATABASE_URL: str = (
        "postgresql+asyncpg://user:password@localhost:5432/bathroommaps"
    )

    # Number of nearby bathrooms to fetch for the recommendation query.
    NEARBY_LIMIT: int = 10

    # Only average cleanliness reports created within this window (hours).
    REPORT_WINDOW_HOURS: int = 1

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
