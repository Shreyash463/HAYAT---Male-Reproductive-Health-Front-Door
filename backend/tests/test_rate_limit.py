import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert "gemini_configured" in data

def test_security_headers():
    res = client.get("/api/health")
    assert res.headers["x-content-type-options"] == "nosniff"
    assert res.headers["x-frame-options"] == "DENY"
    assert "geolocation=()" in res.headers["permissions-policy"]

def test_evidence_endpoint_served():
    res = client.get("/api/evidence")
    assert res.status_code == 200
    data = res.json()
    assert data["total_cases"] == 500
    assert data["red_flag_recall"] == 100.0
    assert len(data["assumptions"]) >= 6

def test_explain_endpoint_full_flow():
    payload = {
        "band": "Moderate",
        "triage_level": "Primary care",
        "language": "en",
        "mode": "simple",
        "factors": [
            {
                "id": "smoking_daily",
                "direction": "raises",
                "modifiable": True
            }
        ]
    }
    res = client.post("/api/explain", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data["explanation"]) > 15
    assert "ai_used" in data

def test_research_share_flow():
    payload = {
        "age_bracket": "30-34",
        "band": "Low",
        "triage_level": "Self-care",
        "language": "en",
        "date": "2026-11-16",
        "consent_given": True
    }
    res = client.post("/api/research-share", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "record_id" in data
