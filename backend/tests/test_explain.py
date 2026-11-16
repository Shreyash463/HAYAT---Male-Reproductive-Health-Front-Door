import pytest
from app.schemas import (
    ExplainRequest,
    FactorItem,
    FactorIdEnum,
    DirectionEnum,
    RiskBandEnum,
    TriageLevelEnum,
    LanguageEnum,
    ModeEnum
)
from app.services.gemini_service import gemini_service

def test_deterministic_template_en():
    req = ExplainRequest(
        band=RiskBandEnum.MODERATE,
        triage_level=TriageLevelEnum.PRIMARY_CARE,
        language=LanguageEnum.EN,
        mode=ModeEnum.SIMPLE,
        factors=[
            FactorItem(id=FactorIdEnum.SMOKING_DAILY, direction=DirectionEnum.RAISES, modifiable=True),
            FactorItem(id=FactorIdEnum.EXERCISE_REGULAR, direction=DirectionEnum.LOWERS, modifiable=True),
        ]
    )
    tmpl = gemini_service.get_deterministic_template(req)
    assert "Moderate" in tmpl
    assert "1 identified factors" in tmpl
    assert "1 reassuring favourable habits" in tmpl

def test_deterministic_template_ar():
    req = ExplainRequest(
        band=RiskBandEnum.LOW,
        triage_level=TriageLevelEnum.SELF_CARE,
        language=LanguageEnum.AR,
        mode=ModeEnum.SIMPLE,
        factors=[
            FactorItem(id=FactorIdEnum.EXERCISE_REGULAR, direction=DirectionEnum.LOWERS, modifiable=True)
        ]
    )
    tmpl = gemini_service.get_deterministic_template(req)
    assert "النتيجة" in tmpl
    assert "عوامل إيجابية" in tmpl

def test_deterministic_template_hi():
    req = ExplainRequest(
        band=RiskBandEnum.ELEVATED,
        triage_level=TriageLevelEnum.ANDROLOGY_UROLOGY,
        language=LanguageEnum.HI,
        mode=ModeEnum.DETAILED,
        factors=[
            FactorItem(id=FactorIdEnum.STEROIDS_CURRENT, direction=DirectionEnum.RAISES, modifiable=True)
        ]
    )
    tmpl = gemini_service.get_deterministic_template(req)
    assert "विस्तृत विश्लेषण" in tmpl
    assert "Andrology/Urology" in tmpl

@pytest.mark.asyncio
async def test_generate_explanation_live_or_fallback():
    req = ExplainRequest(
        band=RiskBandEnum.MODERATE,
        triage_level=TriageLevelEnum.PRIMARY_CARE,
        language=LanguageEnum.EN,
        mode=ModeEnum.SIMPLE,
        factors=[
            FactorItem(id=FactorIdEnum.SMOKING_OCCASIONAL, direction=DirectionEnum.RAISES, modifiable=True),
            FactorItem(id=FactorIdEnum.EXERCISE_REGULAR, direction=DirectionEnum.LOWERS, modifiable=True),
        ]
    )
    text, ai_used, model = await gemini_service.generate_explanation(req)
    assert len(text) > 20
    assert isinstance(ai_used, bool)
    if ai_used:
        assert model is not None
        # Must pass safety filter
        assert gemini_service.is_safe_output(text) is True
