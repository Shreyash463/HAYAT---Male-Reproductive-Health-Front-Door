import json
import os
import pytest
from app.engine.risk_engine import assess_risk

def test_engine_parity_500_cases():
    test_dir = os.path.dirname(__file__)
    cases_path = os.path.join(test_dir, "parity_cases.json")
    assert os.path.exists(cases_path), f"Missing {cases_path}"

    with open(cases_path, "r", encoding="utf-8") as f:
        cases = json.load(f)

    assert len(cases) == 500, f"Expected 500 cases, got {len(cases)}"

    mismatches = []
    for c in cases:
        cid = c["id"]
        answers = c["answers"]
        expected = c["expected"]

        py_res = assess_risk(answers)

        score_match = (py_res["score"] == expected["score"])
        band_match = (py_res["band"] == expected["band"])
        triage_match = (py_res["triage"] == expected["triage"])

        if not (score_match and band_match and triage_match):
            mismatches.append({
                "id": cid,
                "expected": expected,
                "actual": {
                    "score": py_res["score"],
                    "band": py_res["band"],
                    "triage": py_res["triage"]
                },
                "answers": answers
            })

    if mismatches:
        err_msg = f"Found {len(mismatches)} parity mismatches out of 500 cases:\n"
        for m in mismatches[:5]:
            err_msg += f"Case {m['id']}: expected {m['expected']} vs got {m['actual']}\n"
        pytest.fail(err_msg)

    assert len(mismatches) == 0
