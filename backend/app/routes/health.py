from datetime import datetime, timezone
from fastapi import APIRouter
from ..schemas import HealthResponse
from ..config import settings
from ..services.gemini_service import gemini_service

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
async def get_health():
    return HealthResponse(
        status="healthy",
        version=settings.VERSION,
        gemini_configured=gemini_service.is_configured,
        active_model=gemini_service.active_model,
        timestamp=datetime.now(timezone.utc).isoformat()
    )
