from app.services.cohort_service import generate_evidence_cohort, MODEL_ASSUMPTIONS

def test_evidence_cohort_determinism():
    run1 = generate_evidence_cohort()
    run2 = generate_evidence_cohort()

    assert run1["total_cases"] == 500
    assert run1["completion_rate"] == run2["completion_rate"]
    assert run1["median_time_with_hayat_months"] == 2.4
    assert run1["median_time_without_hayat_months"] == 7.5

def test_evidence_red_flag_kpi_100_percent():
    cohort = generate_evidence_cohort()
    # Requirement 9: Exactly 100% by design
    assert cohort["red_flag_recall"] == 100.0
    assert cohort["red_flag_kpi_label"] == "by design: rule-based safety override"

def test_evidence_assumptions_exposed():
    cohort = generate_evidence_cohort()
    assumptions = cohort["assumptions"]
    assert len(assumptions) >= 6

    ids = [a["id"] for a in assumptions]
    assert "cohort_size" in ids
    assert "standard_pathway_delay" in ids
    assert "safety_override_guarantee" in ids

def test_fairness_parity_consistency():
    cohort = generate_evidence_cohort()
    assert cohort["consistency_achieved"] is True
    assert cohort["max_gap_percentage"] < 5.0
    assert len(cohort["fairness_by_age"]) == 3
    assert len(cohort["fairness_by_language"]) == 3
