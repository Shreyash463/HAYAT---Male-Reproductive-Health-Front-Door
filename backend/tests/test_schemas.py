import pytest
from pydantic import ValidationError
from app.schemas import (
    ExplainRequest,
    FactorItem,
    FactorIdEnum,
    DirectionEnum,
    RiskBandEnum,
    TriageLevelEnum,
    LanguageEnum,
    ModeEnum,
    ResearchShareRequest,
    AgeBracketEnum
)

def test_explain_schema_valid():
    payload = ExplainRequest(
        band=RiskBandEnum.MODERATE,
        triage_level=TriageLevelEnum.PRIMARY_CARE,
        language=LanguageEnum.EN,
        mode=ModeEnum.SIMPLE,
        factors=[
            FactorItem(
                id=FactorIdEnum.SMOKING_DAILY,
                direction=DirectionEnum.RAISES,
                modifiable=True
            )
        ]
    )
    assert payload.band == RiskBandEnum.MODERATE
    assert len(payload.factors) == 1

def test_explain_schema_rejects_free_text():
    with pytest.raises(ValidationError):
        # Attempting to send arbitrary free text instead of valid Enum
        ExplainRequest(
            band="NotABand",  # type: ignore
            triage_level=TriageLevelEnum.SELF_CARE,
            language=LanguageEnum.EN,
            mode=ModeEnum.SIMPLE,
            factors=[]
        )

def test_explain_schema_rejects_unknown_factor_id():
    with pytest.raises(ValidationError):
        # Attempting to inject free text inside factor ID
        FactorItem(
            id="user_entered_personal_health_data",  # type: ignore
            direction=DirectionEnum.RAISES,
            modifiable=True
        )

def test_explain_schema_rejects_extra_fields():
    with pytest.raises(ValidationError):
        # Extra fields forbidden to prevent accidental data leakage
        ExplainRequest(
            band=RiskBandEnum.LOW,
            triage_level=TriageLevelEnum.SELF_CARE,
            language=LanguageEnum.EN,
            mode=ModeEnum.SIMPLE,
            factors=[],
            user_name="John Doe"  # type: ignore
        )

def test_explain_schema_max_20_factors():
    factors_21 = [
        FactorItem(id=FactorIdEnum.SMOKING_DAILY, direction=DirectionEnum.RAISES, modifiable=True)
        for _ in range(21)
    ]
    with pytest.raises(ValidationError):
        ExplainRequest(
            band=RiskBandEnum.LOW,
            triage_level=TriageLevelEnum.SELF_CARE,
            language=LanguageEnum.EN,
            mode=ModeEnum.SIMPLE,
            factors=factors_21
        )

def test_research_share_schema_valid():
    payload = ResearchShareRequest(
        age_bracket=AgeBracketEnum.AGE_30_34,
        band=RiskBandEnum.MODERATE,
        triage_level=TriageLevelEnum.PRIMARY_CARE,
        language=LanguageEnum.AR,
        date="2026-11-16",
        consent_given=True
    )
    assert payload.age_bracket == AgeBracketEnum.AGE_30_34

def test_research_share_schema_rejects_timestamp_leak():
    with pytest.raises(ValidationError):
        # Must be day-level YYYY-MM-DD, not microsecond timestamp that could correlate identity
        ResearchShareRequest(
            age_bracket=AgeBracketEnum.AGE_30_34,
            band=RiskBandEnum.LOW,
            triage_level=TriageLevelEnum.SELF_CARE,
            language=LanguageEnum.EN,
            date="2026-11-16T10:20:30.123456Z",  # Invalid
            consent_given=True
        )
