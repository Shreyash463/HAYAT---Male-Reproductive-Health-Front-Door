from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict

# --- Core Enums ---

class LanguageEnum(str, Enum):
    EN = "en"
    HI = "hi"
    AR = "ar"

class RiskBandEnum(str, Enum):
    LOW = "Low"
    MODERATE = "Moderate"
    ELEVATED = "Elevated"
    URGENT = "Urgent"

class TriageLevelEnum(str, Enum):
    SELF_CARE = "Self-care"
    PRIMARY_CARE = "Primary care"
    ANDROLOGY_UROLOGY = "Andrology/Urology"
    FERTILITY_SERVICE = "Fertility service"
    URGENT_ASSESSMENT = "Urgent assessment"

class ModeEnum(str, Enum):
    SIMPLE = "simple"
    DETAILED = "detailed"

class DirectionEnum(str, Enum):
    RAISES = "raises"
    LOWERS = "lowers"
    NEUTRAL = "neutral"

class FactorIdEnum(str, Enum):
    # Journey & Planning
    TRYING_12M = "trying_12m"
    TRYING_6_12M = "trying_6_12m"
    TRYING_EARLY = "trying_early"
    PROACTIVE_PLANNING = "proactive_planning"
    # Age
    AGE_45 = "age_45"
    AGE_40_44 = "age_40_44"
    AGE_PROTECTIVE = "age_protective"
    # Lifestyle
    SMOKING_DAILY = "smoking_daily"
    SMOKING_OCCASIONAL = "smoking_occasional"
    NON_SMOKER = "non_smoker"
    ALCOHOL_HEAVY = "alcohol_heavy"
    ALCOHOL_MODERATE = "alcohol_moderate"
    ALCOHOL_NONE = "alcohol_none"
    SLEEP_SHORT = "sleep_short"
    SLEEP_OPTIMAL = "sleep_optimal"
    STRESS_HIGH = "stress_high"
    STRESS_LOW = "stress_low"
    EXERCISE_REGULAR = "exercise_regular"
    EXERCISE_SEDENTARY = "exercise_sedentary"
    HEAT_EXPOSURE = "heat_exposure"
    STEROIDS_CURRENT = "steroids_current"
    STEROIDS_PAST = "steroids_past"
    SUBSTANCES_REGULAR = "substances_regular"
    SUBSTANCES_OCCASIONAL = "substances_occasional"
    # Metabolic
    BMI_OBESITY = "bmi_obesity"
    BMI_OVERWEIGHT = "bmi_overweight"
    BMI_NORMAL = "bmi_normal"
    WAIST_CONCERN = "waist_concern"
    CONDITION_DIABETES = "condition_diabetes"
    CONDITION_HYPERTENSION = "condition_hypertension"
    CONDITION_THYROID = "condition_thyroid"
    # History & Symptoms
    HISTORY_CRYPTORCHIDISM = "history_cryptorchidism"
    HISTORY_INFECTION = "history_infection"
    HISTORY_MUMPS = "history_mumps"
    HISTORY_SURGERY_INJURY = "history_surgery_injury"
    SYMPTOM_VARICOCELE = "symptom_varicocele"
    SYMPTOM_ACHE = "symptom_ache"
    SYMPTOM_SEXUAL = "symptom_sexual"
    # Semen Analysis
    SEMEN_VOLUME_LOW = "semen_volume_low"
    SEMEN_CONCENTRATION_LOW = "semen_concentration_low"
    SEMEN_TOTAL_MOTILITY_LOW = "semen_total_motility_low"
    SEMEN_PROG_MOTILITY_LOW = "semen_prog_motility_low"

class AgeBracketEnum(str, Enum):
    AGE_18_24 = "18-24"
    AGE_25_29 = "25-29"
    AGE_30_34 = "30-34"
    AGE_35_39 = "35-39"
    AGE_40_44 = "40-44"
    AGE_45_PLUS = "45+"
    UNSPECIFIED = "unspecified"

# --- Request / Response Models ---

class FactorItem(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: FactorIdEnum
    direction: DirectionEnum
    modifiable: bool

class ExplainRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    band: RiskBandEnum
    triage_level: TriageLevelEnum
    language: LanguageEnum
    mode: ModeEnum
    factors: List[FactorItem] = Field(default_factory=list, max_length=20)

class ExplainResponse(BaseModel):
    explanation: str
    ai_used: bool
    language: LanguageEnum
    model: Optional[str] = None

class ResearchShareRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    age_bracket: AgeBracketEnum
    band: RiskBandEnum
    triage_level: TriageLevelEnum
    language: LanguageEnum
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$", description="Day-level date only (YYYY-MM-DD)")
    consent_given: bool = Field(True, description="Explicit user opt-in confirmed")

class ResearchShareResponse(BaseModel):
    success: bool
    record_id: str
    backend_storage: str
    message: str

class HealthResponse(BaseModel):
    status: str
    version: str
    gemini_configured: bool
    active_model: Optional[str] = None
    timestamp: str

class AssumptionItem(BaseModel):
    id: str
    label: str
    value: str
    description: str

class FunnelStep(BaseModel):
    step: str
    completion_rate: float

class TimeComparisonItem(BaseModel):
    group: str
    months: float

class TriageDistributionItem(BaseModel):
    level: str
    percentage: int
    count: int

class DemographicFairnessItem(BaseModel):
    group: str
    completion: float
    consistency_rate: float
    trust: float

class EvidenceResponse(BaseModel):
    total_cases: int
    completion_rate: float
    median_time_without_hayat_months: float
    median_time_with_hayat_months: float
    referral_completion_rate: float
    trust_score: float
    red_flag_recall: float
    red_flag_kpi_label: str
    completion_funnel: List[FunnelStep]
    time_comparison: List[TimeComparisonItem]
    triage_distribution: List[TriageDistributionItem]
    fairness_by_age: List[DemographicFairnessItem]
    fairness_by_language: List[DemographicFairnessItem]
    max_gap_percentage: float
    consistency_achieved: bool
    assumptions: List[AssumptionItem]
