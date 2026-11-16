from fastapi import APIRouter
from ..schemas import EvidenceResponse
from ..services.cohort_service import generate_evidence_cohort

router = APIRouter()

@router.get("/evidence", response_model=EvidenceResponse)
async def get_evidence():
    data = generate_evidence_cohort()
    return EvidenceResponse(**data)
