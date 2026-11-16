import asyncio
import logging
from typing import List, Optional, Tuple
from google import genai
from google.genai import types
from ..config import settings
from ..schemas import ExplainRequest, LanguageEnum, ModeEnum, FactorIdEnum

logger = logging.getLogger("hayat.gemini")

# Diagnostic or shaming phrases strictly banned from patient-facing screening output
BANNED_PHRASES = [
    "you have",
    "diagnos",
    "infertile",
    "infertility",
    "impotent",
    "impotence",
    "sterile",
    "sterility",
    "your wife",
    "your spouse",
    "suffer from",
    "disease",
    "defect",
    "abnormal",
    "cure",
    "treat yourself",
]

FACTOR_LABELS_EN = {
    FactorIdEnum.TRYING_12M: "Trying to conceive for 12+ months",
    FactorIdEnum.TRYING_6_12M: "Trying to conceive for 6 to 12 months",
    FactorIdEnum.TRYING_EARLY: "Early in family planning journey",
    FactorIdEnum.PROACTIVE_PLANNING: "Proactive early check-in",
    FactorIdEnum.AGE_45: "Age 45 or older",
    FactorIdEnum.AGE_40_44: "Age 40 to 44",
    FactorIdEnum.AGE_PROTECTIVE: "Younger age bracket",
    FactorIdEnum.SMOKING_DAILY: "Daily smoking or vaping",
    FactorIdEnum.SMOKING_OCCASIONAL: "Occasional smoking or vaping",
    FactorIdEnum.NON_SMOKER: "Non-smoker",
    FactorIdEnum.ALCOHOL_HEAVY: "Heavy alcohol intake",
    FactorIdEnum.ALCOHOL_MODERATE: "Moderate alcohol consumption",
    FactorIdEnum.ALCOHOL_NONE: "No alcohol consumption",
    FactorIdEnum.SLEEP_SHORT: "Short sleep duration (<6 hours)",
    FactorIdEnum.SLEEP_OPTIMAL: "Healthy sleep duration (7-9 hours)",
    FactorIdEnum.STRESS_HIGH: "High psychological or work stress",
    FactorIdEnum.STRESS_LOW: "Low perceived stress",
    FactorIdEnum.EXERCISE_REGULAR: "Regular physical activity (3+ days/week)",
    FactorIdEnum.EXERCISE_SEDENTARY: "Sedentary routine",
    FactorIdEnum.HEAT_EXPOSURE: "Frequent scrotal heat exposure",
    FactorIdEnum.STEROIDS_CURRENT: "Current testosterone or anabolic compound use",
    FactorIdEnum.STEROIDS_PAST: "Past testosterone or anabolic compound use",
    FactorIdEnum.SUBSTANCES_REGULAR: "Regular recreational substance use",
    FactorIdEnum.SUBSTANCES_OCCASIONAL: "Occasional recreational substance use",
    FactorIdEnum.BMI_OBESITY: "Higher BMI range (30+)",
    FactorIdEnum.BMI_OVERWEIGHT: "Slightly elevated BMI (25-29.9)",
    FactorIdEnum.BMI_NORMAL: "Typical BMI range (18.5-24.9)",
    FactorIdEnum.WAIST_CONCERN: "Central waist concern noted",
    FactorIdEnum.CONDITION_DIABETES: "Diabetes or elevated blood sugar",
    FactorIdEnum.CONDITION_HYPERTENSION: "High blood pressure",
    FactorIdEnum.CONDITION_THYROID: "Thyroid condition",
    FactorIdEnum.HISTORY_CRYPTORCHIDISM: "Childhood undescended testicle history",
    FactorIdEnum.HISTORY_INFECTION: "History of urinary or genital infection",
    FactorIdEnum.HISTORY_MUMPS: "Adolescent mumps history",
    FactorIdEnum.HISTORY_SURGERY_INJURY: "Prior hernia/scrotal surgery or injury",
    FactorIdEnum.SYMPTOM_VARICOCELE: "Heaviness or vein fullness (varicocele sign)",
    FactorIdEnum.SYMPTOM_ACHE: "Dull scrotal ache or discomfort",
    FactorIdEnum.SYMPTOM_SEXUAL: "Changes in libido or erection firmness",
    FactorIdEnum.SEMEN_VOLUME_LOW: "Semen volume below standard reference limit (<1.4 mL)",
    FactorIdEnum.SEMEN_CONCENTRATION_LOW: "Sperm concentration below reference limit (<16 M/mL)",
    FactorIdEnum.SEMEN_TOTAL_MOTILITY_LOW: "Total motility below reference limit (<42%)",
    FactorIdEnum.SEMEN_PROG_MOTILITY_LOW: "Progressive motility below reference limit (<30%)",
}

FACTOR_LABELS_AR = {
    FactorIdEnum.TRYING_12M: "المحاولة لأكثر من 12 شهراً",
    FactorIdEnum.TRYING_6_12M: "المحاولة لمدة 6 إلى 12 شهراً",
    FactorIdEnum.TRYING_EARLY: "مرحلة مبكرة في التخطيط الأسري",
    FactorIdEnum.PROACTIVE_PLANNING: "فحص استباقي مبكر",
    FactorIdEnum.AGE_45: "العمر 45 عاماً أو أكثر",
    FactorIdEnum.AGE_40_44: "العمر بين 40 و 44 عاماً",
    FactorIdEnum.AGE_PROTECTIVE: "الفئة العمرية الشابة",
    FactorIdEnum.SMOKING_DAILY: "التدخين اليومي أو الفيب",
    FactorIdEnum.SMOKING_OCCASIONAL: "التدخين العرضي",
    FactorIdEnum.NON_SMOKER: "غير مدخن",
    FactorIdEnum.ALCOHOL_HEAVY: "استهلاك الكحول المرتفع",
    FactorIdEnum.ALCOHOL_MODERATE: "استهلاك الكحول المعتدل",
    FactorIdEnum.ALCOHOL_NONE: "عدم استهلاك الكحول",
    FactorIdEnum.SLEEP_SHORT: "ساعات نوم قليلة (أقل من 6 ساعات)",
    FactorIdEnum.SLEEP_OPTIMAL: "ساعات نوم صحية (7-9 ساعات)",
    FactorIdEnum.STRESS_HIGH: "مستوى توتر مرتفع",
    FactorIdEnum.STRESS_LOW: "مستوى توتر منخفض",
    FactorIdEnum.EXERCISE_REGULAR: "نشاط بدني منتظم (3+ أيام أسبوعياً)",
    FactorIdEnum.EXERCISE_SEDENTARY: "نمط حياة قليل الحركة",
    FactorIdEnum.HEAT_EXPOSURE: "التعرض المتكرر للحرارة في منطقة الخصية",
    FactorIdEnum.STEROIDS_CURRENT: "استخدام التيستوستيرون أو المنشطات حالياً",
    FactorIdEnum.STEROIDS_PAST: "استخدام سابق للمنشطات",
    FactorIdEnum.SUBSTANCES_REGULAR: "استخدام منتظم لمواد منشطة",
    FactorIdEnum.SUBSTANCES_OCCASIONAL: "استخدام عرضي لمواد منشطة",
    FactorIdEnum.BMI_OBESITY: "مؤشر كتلة جسم مرتفع (30+)",
    FactorIdEnum.BMI_OVERWEIGHT: "مؤشر كتلة جسم فوق المعتاد (25-29.9)",
    FactorIdEnum.BMI_NORMAL: "مؤشر كتلة جسم في النطاق النموذجي",
    FactorIdEnum.WAIST_CONCERN: "ملاحظة زيادة محيط الخصر",
    FactorIdEnum.CONDITION_DIABETES: "ارتفاع سكر الدم أو السكري",
    FactorIdEnum.CONDITION_HYPERTENSION: "ارتفاع ضغط الدم",
    FactorIdEnum.CONDITION_THYROID: "اضطراب الغدة الدرقية",
    FactorIdEnum.HISTORY_CRYPTORCHIDISM: "تاريخ الخصية الهاجرة في الطفولة",
    FactorIdEnum.HISTORY_INFECTION: "تاريخ التهاب في المسالك البولية أو التناسلية",
    FactorIdEnum.HISTORY_MUMPS: "تاريخ الإصابة بالنكاف بعد البلوغ",
    FactorIdEnum.HISTORY_SURGERY_INJURY: "جراحة أو إصابة سابقة في منطقة الفخذ",
    FactorIdEnum.SYMPTOM_VARICOCELE: "ثقل أو انتفاخ أوردة الخصية (إشارة دوالي محتملة)",
    FactorIdEnum.SYMPTOM_ACHE: "ألم خفيف أو إجهاد موضعي",
    FactorIdEnum.SYMPTOM_SEXUAL: "تغيرات في الرغبة أو الانتصاب",
    FactorIdEnum.SEMEN_VOLUME_LOW: "حجم السائل أقل من المرجع الطبيعي (<1.4 مل)",
    FactorIdEnum.SEMEN_CONCENTRATION_LOW: "تركيز الحيوانات المنوية أقل من المرجع (<16 مليون/مل)",
    FactorIdEnum.SEMEN_TOTAL_MOTILITY_LOW: "الحركة الكلية أقل من المرجع (<42%)",
    FactorIdEnum.SEMEN_PROG_MOTILITY_LOW: "الحركة التقدمية أقل من المرجع (<30%)",
}

FACTOR_LABELS_HI = {
    FactorIdEnum.TRYING_12M: "12 महीने से अधिक समय से प्रयास",
    FactorIdEnum.TRYING_6_12M: "6 से 12 महीने से प्रयास",
    FactorIdEnum.TRYING_EARLY: "पारिवारिक योजना के शुरुआती चरण में",
    FactorIdEnum.PROACTIVE_PLANNING: "सक्रिय प्रारंभिक स्वास्थ्य जांच",
    FactorIdEnum.AGE_45: "45 वर्ष या उससे अधिक आयु",
    FactorIdEnum.AGE_40_44: "40 से 44 वर्ष की आयु",
    FactorIdEnum.AGE_PROTECTIVE: "युवा आयु वर्ग",
    FactorIdEnum.SMOKING_DAILY: "दैनिक धूम्रपान या वेपिंग",
    FactorIdEnum.SMOKING_OCCASIONAL: "कभी-कभार धूम्रपान",
    FactorIdEnum.NON_SMOKER: "धूम्रपान न करने वाले",
    FactorIdEnum.ALCOHOL_HEAVY: "अधिक शराब का सेवन",
    FactorIdEnum.ALCOHOL_MODERATE: "सीमित शराब का सेवन",
    FactorIdEnum.ALCOHOL_NONE: "शराब का सेवन नहीं",
    FactorIdEnum.SLEEP_SHORT: "कम नींद (6 घंटे से कम)",
    FactorIdEnum.SLEEP_OPTIMAL: "स्वस्थ नींद (7-9 घंटे)",
    FactorIdEnum.STRESS_HIGH: "उच्च दैनिक तनाव",
    FactorIdEnum.STRESS_LOW: "कम दैनिक तनाव",
    FactorIdEnum.EXERCISE_REGULAR: "नियमित शारीरिक व्यायाम (3+ दिन/सप्ताह)",
    FactorIdEnum.EXERCISE_SEDENTARY: "गतिहीन दिनचर्या",
    FactorIdEnum.HEAT_EXPOSURE: "अंडकोष पर बार-बार गर्मी का प्रभाव",
    FactorIdEnum.STEROIDS_CURRENT: "वर्तमान में टेस्टोस्टेरोन या एनाबॉलिक का उपयोग",
    FactorIdEnum.STEROIDS_PAST: "अतीत में एनाबॉलिक का उपयोग",
    FactorIdEnum.SUBSTANCES_REGULAR: "नियमित नशीले पदार्थों का उपयोग",
    FactorIdEnum.SUBSTANCES_OCCASIONAL: "कभी-कभार नशीले पदार्थों का उपयोग",
    FactorIdEnum.BMI_OBESITY: "उच्च बीएमआई (30+)",
    FactorIdEnum.BMI_OVERWEIGHT: "सामान्य से थोड़ा अधिक बीएमआई (25-29.9)",
    FactorIdEnum.BMI_NORMAL: "सामान्य बीएमआई दायरा (18.5-24.9)",
    FactorIdEnum.WAIST_CONCERN: "कमर के घेरे की चिंता",
    FactorIdEnum.CONDITION_DIABETES: "मधुमेह या उच्च रक्त शर्करा",
    FactorIdEnum.CONDITION_HYPERTENSION: "उच्च रक्तचाप",
    FactorIdEnum.CONDITION_THYROID: "थायराइड असंतुलन",
    FactorIdEnum.HISTORY_CRYPTORCHIDISM: "बचपन में अंडकोष का नीचे न आना",
    FactorIdEnum.HISTORY_INFECTION: "अतीत में मूत्र या जननांग संक्रमण",
    FactorIdEnum.HISTORY_MUMPS: "किशोरावस्था में गलसुआ (मम्प्स)",
    FactorIdEnum.HISTORY_SURGERY_INJURY: "पूर्व कमर/अंडकोष सर्जरी या चोट",
    FactorIdEnum.SYMPTOM_VARICOCELE: "भारीपन या नसों का उभार (वेरिकोसील संकेत)",
    FactorIdEnum.SYMPTOM_ACHE: "हल्का दर्द या भारीपन",
    FactorIdEnum.SYMPTOM_SEXUAL: "कामेच्छा या स्तंभन में बदलाव",
    FactorIdEnum.SEMEN_VOLUME_LOW: "वीर्य की मात्रा मानक सीमा से कम (<1.4 मिली)",
    FactorIdEnum.SEMEN_CONCENTRATION_LOW: "शुक्राणु एकाग्रता मानक सीमा से कम (<16 मिलियन/मिली)",
    FactorIdEnum.SEMEN_TOTAL_MOTILITY_LOW: "कुल गतिशीलता मानक सीमा से कम (<42%)",
    FactorIdEnum.SEMEN_PROG_MOTILITY_LOW: "प्रगतिशील गतिशीलता मानक सीमा से कम (<30%)",
}

class GeminiService:
    def __init__(self):
        self._client: Optional[genai.Client] = None
        self._resolved_model: Optional[str] = None
        self._init_attempted = False

    def _ensure_client(self):
        if self._init_attempted:
            return
        self._init_attempted = True

        api_key = settings.GEMINI_API_KEY
        if not api_key:
            logger.info("GEMINI_API_KEY not configured. Deterministic fallback will be used.")
            return

        try:
            self._client = genai.Client(api_key=api_key)
            if settings.GEMINI_MODEL:
                self._resolved_model = settings.GEMINI_MODEL
            else:
                # Query available models to select stable Flash model
                available = [m.name for m in self._client.models.list()]
                flash_models = [m for m in available if "flash" in m.lower() and "tts" not in m.lower() and "preview" not in m.lower()]
                if flash_models:
                    # Pick latest Flash model
                    self._resolved_model = flash_models[0].replace("models/", "")
                else:
                    self._resolved_model = "gemini-2.5-flash"
            logger.info(f"Gemini client initialized with model: {self._resolved_model}")
        except Exception as e:
            logger.warning(f"Failed to initialize Gemini client: {e}. Falling back to deterministic mode.")
            self._client = None
            self._resolved_model = None

    @property
    def is_configured(self) -> bool:
        self._ensure_client()
        return self._client is not None and bool(self._resolved_model)

    @property
    def active_model(self) -> Optional[str]:
        self._ensure_client()
        return self._resolved_model

    def get_deterministic_template(self, req: ExplainRequest) -> str:
        """
        Returns vetted, clinical-safe deterministic template explanation in requested language.
        """
        lang = req.language
        band = req.band.value
        triage = req.triage_level.value
        factors = req.factors

        raising_factors = [f for f in factors if f.direction.value == "raises"]
        lowering_factors = [f for f in factors if f.direction.value == "lowers"]

        if lang == LanguageEnum.AR:
            labels = [FACTOR_LABELS_AR.get(f.id, f.id.value) for f in raising_factors[:3]]
            if req.mode == ModeEnum.SIMPLE:
                return (
                    f"هذه النتيجة ({band}) تستند إلى {len(raising_factors)} عوامل مؤثرة تم تحديدها، "
                    f"مع {len(lowering_factors)} عوامل إيجابية مطمئنة في نمط حياتك."
                )
            else:
                top_str = "، ".join(labels) if labels else "العادات اليومية ونمط الحياة"
                return (
                    f"التحليل التفصيلي: العوامل الأكثر تأثيراً تشمل: {top_str}. "
                    f"المسار الموصى به للمتابعة الطبية: {triage}."
                )

        elif lang == LanguageEnum.HI:
            labels = [FACTOR_LABELS_HI.get(f.id, f.id.value) for f in raising_factors[:3]]
            if req.mode == ModeEnum.SIMPLE:
                return (
                    f"यह परिणाम ({band}) आपके द्वारा साझा किए गए {len(raising_factors)} मुख्य कारकों पर आधारित है, "
                    f"जबकि {len(lowering_factors)} कारक आपके पक्ष में सकारात्मक हैं।"
                )
            else:
                top_str = ", ".join(labels) if labels else "दैनिक आदतें और जीवनशैली"
                return (
                    f"विस्तृत विश्लेषण: मुख्य प्राथमिक कारक हैं: {top_str}. "
                    f"अनुशंसित देखभाल स्तर: {triage}."
                )

        else:
            labels = [FACTOR_LABELS_EN.get(f.id, f.id.value) for f in raising_factors[:3]]
            if req.mode == ModeEnum.SIMPLE:
                return (
                    f"This screening result ({band}) is derived from {len(raising_factors)} identified factors, "
                    f"balanced by {len(lowering_factors)} reassuring favourable habits."
                )
            else:
                top_str = ", ".join(labels) if labels else "everyday lifestyle habits"
                return (
                    f"Detailed breakdown: Primary contributing factors include {top_str}. "
                    f"Triage guidance directs to: {triage}."
                )

    def is_safe_output(self, text: str) -> bool:
        """
        Safety post-filter: checks for banned clinical/diagnostic or shaming phrases.
        """
        if not text or len(text.strip()) < 15 or len(text) > 600:
            return False

        lower = text.lower()
        for phrase in BANNED_PHRASES:
            if phrase in lower:
                logger.warning(f"Safety filter rejected AI response containing banned phrase: '{phrase}'")
                return False

        return True

    async def generate_explanation(self, req: ExplainRequest) -> Tuple[str, bool, Optional[str]]:
        """
        Calls Gemini to rewrite factors in plain language, with safety checks and timeout.
        Returns: (explanation_text, ai_used_boolean, model_name_or_none)
        """
        deterministic_text = self.get_deterministic_template(req)

        self._ensure_client()
        if not self._client or not self._resolved_model:
            return deterministic_text, False, None

        # Build factors summary for prompt
        factor_items = []
        for f in req.factors:
            label = FACTOR_LABELS_EN.get(f.id, f.id.value)
            mod_str = "modifiable" if f.modifiable else "fixed"
            factor_items.append(f"- {label} ({f.direction.value}, {mod_str})")

        factors_block = "\n".join(factor_items) if factor_items else "No elevated factors identified."

        lang_instructions = {
            LanguageEnum.EN: "Respond in clear, gentle, supportive English.",
            LanguageEnum.AR: "Respond in natural, culturally dignified Modern Standard Arabic (اللغة العربية الفصحى).",
            LanguageEnum.HI: "Respond in respectful, accessible Hindi (सरल और सम्मानजनक हिन्दी).",
        }

        system_instruction = (
            "You are HAYAT, a private health communication assistant for male reproductive wellness.\n"
            "STRICT CLINICAL RULES:\n"
            "1. THIS IS A PRELIMINARY SCREENING AID, NEVER A DIAGNOSIS OR MEDICAL OPINION.\n"
            "2. Never use diagnostic or shaming words: never say 'you have', 'diagnose', 'infertile', 'sterile', 'impotent'.\n"
            "3. Never make assumptions about marital status, religion, partner gender, or family choices. Never say 'your wife'.\n"
            "4. Do NOT invent or add medical facts beyond the exact factors provided below.\n"
            "5. Keep the explanation calm, respectful, supportive, and under 3 concise sentences (max 75 words).\n"
            f"{lang_instructions[req.language]}"
        )

        user_prompt = (
            f"Screening Risk Band: {req.band.value}\n"
            f"Triage Care Level: {req.triage_level.value}\n"
            f"Mode: {req.mode.value}\n"
            f"Identified Coded Factors:\n{factors_block}\n\n"
            "Task: Provide a calm 2-sentence plain-language summary of what these screening factors mean "
            "and why the triage level is suggested. Emphasize that screening highlights areas to explore with a doctor."
        )

        try:
            # Enforce strict 10s timeout
            response = await asyncio.wait_for(
                asyncio.to_thread(
                    self._client.models.generate_content,
                    model=self._resolved_model,
                    contents=user_prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=0.2,
                        max_output_tokens=180,
                    )
                ),
                timeout=10.0
            )

            ai_text = response.text.strip() if (response and response.text) else ""

            if self.is_safe_output(ai_text):
                return ai_text, True, self._resolved_model
            else:
                logger.info("AI response did not pass post-filter; returning safe deterministic template.")
                return deterministic_text, False, self._resolved_model

        except asyncio.TimeoutError:
            logger.warning("Gemini API call timed out after 10s. Returning deterministic fallback.")
            return deterministic_text, False, self._resolved_model
        except Exception as e:
            logger.warning(f"Gemini API generation error: {e}. Returning deterministic fallback.")
            return deterministic_text, False, self._resolved_model

gemini_service = GeminiService()
