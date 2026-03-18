"""Re-export all models so Alembic can discover them via a single import."""

from app.models.bathroom import Bathroom
from app.models.report import Report

__all__ = ["Bathroom", "Report"]
