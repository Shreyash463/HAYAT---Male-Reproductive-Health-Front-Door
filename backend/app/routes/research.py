import logging
from fastapi import APIRouter, Request, HTTPException
from ..schemas import ResearchShareRequest, ResearchShareResponse
from ..services.research_store import research_store

logger = logging.getLogger("hayat.routes.research")
router = APIRouter()

@router.post("/research-share", response_model=ResearchShareResponse)
async def share_research_aggregate(request: Request, payload: ResearchShareRequest):
    if not payload.consent_given:
        raise HTTPException(status_code=400, detail="Research contribution requires explicit user consent.")

    logger.info("Recording anonymised bucketed research aggregate.")
    return research_store.save_aggregate(payload)
