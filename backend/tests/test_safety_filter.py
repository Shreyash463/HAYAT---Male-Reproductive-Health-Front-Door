from app.services.gemini_service import gemini_service

def test_safety_filter_passes_clean_explanation():
    safe_text = (
        "This screening highlights a few everyday habits that may influence cellular recovery. "
        "Discussing these observations with a primary care clinician can provide helpful guidance."
    )
    assert gemini_service.is_safe_output(safe_text) is True

def test_safety_filter_rejects_diagnostic_assertion():
    assert gemini_service.is_safe_output("Our system diagnoses that you have early reproductive difficulty.") is False
    assert gemini_service.is_safe_output("You have significant hormonal impairment.") is False

def test_safety_filter_rejects_stigmatising_words():
    assert gemini_service.is_safe_output("This indicates you may be infertile or sterile.") is False
    assert gemini_service.is_safe_output("Symptoms of impotence were detected.") is False

def test_safety_filter_rejects_marital_and_gender_assumptions():
    assert gemini_service.is_safe_output("Please share this report with your wife for joint planning.") is False
    assert gemini_service.is_safe_output("Your spouse should also complete a fertility check.") is False

def test_safety_filter_rejects_empty_or_excessive_length():
    assert gemini_service.is_safe_output("") is False
    assert gemini_service.is_safe_output("Too short.") is False
    assert gemini_service.is_safe_output("A" * 650) is False
