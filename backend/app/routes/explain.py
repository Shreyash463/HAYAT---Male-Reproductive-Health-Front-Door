import logging
from fastapi import APIRouter, Request
from ..schemas import ExplainRequest, ExplainResponse
from ..services.gemini_service import gemini_service

logger = logging.getLogger("hayat.routes.explain")
router = APIRouter()

@router.post("/explain", response_model=ExplainResponse)
async def explain_results(request: Request, payload: ExplainRequest):
    # Privacy rule: Do NOT log payload content or client IP address in application logs.
    logger.info("Processing /api/explain request with coded enum factors.")

    explanation_text, ai_used, model_name = await gemini_service.generate_explanation(payload)

    return ExplainResponse(
        explanation=explanation_text,
        ai_used=ai_used,
        language=payload.language,
        model=model_name
    )
