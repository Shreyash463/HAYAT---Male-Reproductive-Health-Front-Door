import urllib.request
import urllib.error
import json
import sys

BASE_URL = "https://hayat-backend-nu.vercel.app"
FRONTEND_ORIGIN = "https://hayat-frontend-ten.vercel.app"

results = []

def record(name, passed, detail=""):
    results.append({"name": name, "passed": passed, "detail": detail})
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}: {detail}")

print("=== LIVE BACKEND VERIFICATION ===")

# 1. GET /api/health
try:
    req = urllib.request.Request(f"{BASE_URL}/api/health", headers={"User-Agent": "HAYAT-Verifier"})
    with urllib.request.urlopen(req) as resp:
        body = json.loads(resp.read().decode())
        passed = (resp.status == 200 and body.get("status") == "healthy" and body.get("gemini_configured") is True)
        record("GET /api/health", passed, f"Status: {resp.status}, model: {body.get('active_model')}, gemini_configured: {body.get('gemini_configured')}")
except Exception as e:
    record("GET /api/health", False, str(e))

# 2. GET /api/evidence
try:
    req = urllib.request.Request(f"{BASE_URL}/api/evidence", headers={"User-Agent": "HAYAT-Verifier"})
    with urllib.request.urlopen(req) as resp:
        body = json.loads(resp.read().decode())
        has_assumptions = len(body.get("assumptions", [])) >= 7
        red_flag_100 = (body.get("red_flag_recall") == 100.0)
        passed = (resp.status == 200 and has_assumptions and red_flag_100)
        record("GET /api/evidence", passed, f"Red-flag recall: {body.get('red_flag_recall')}%, Assumptions: {len(body.get('assumptions', []))}")
except Exception as e:
    record("GET /api/evidence", False, str(e))

# 3. POST /api/explain (valid enum body)
try:
    valid_payload = {
        "band": "Moderate",
        "triage_level": "Primary care",
        "language": "en",
        "mode": "simple",
        "factors": [
            {"id": "stress_high", "direction": "raises", "modifiable": True}
        ]
    }
    req = urllib.request.Request(
        f"{BASE_URL}/api/explain",
        data=json.dumps(valid_payload).encode('utf-8'),
        headers={"Content-Type": "application/json", "User-Agent": "HAYAT-Verifier"},
        method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        body = json.loads(resp.read().decode())
        passed = (resp.status == 200 and "explanation" in body and "ai_used" in body)
        record("POST /api/explain (valid)", passed, f"ai_used: {body.get('ai_used')}, text len: {len(body.get('explanation', ''))}")
except Exception as e:
    record("POST /api/explain (valid)", False, str(e))

# 4. POST /api/explain (invalid body with free text)
try:
    invalid_payload = {
        "band": "Moderate",
        "triage_level": "Primary care",
        "language": "en",
        "mode": "simple",
        "factors": [],
        "patient_name": "Test User"
    }
    req = urllib.request.Request(
        f"{BASE_URL}/api/explain",
        data=json.dumps(invalid_payload).encode('utf-8'),
        headers={"Content-Type": "application/json", "User-Agent": "HAYAT-Verifier"},
        method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        record("POST /api/explain (invalid free text)", False, f"Unexpected 200 response")
except urllib.error.HTTPError as e:
    passed = (e.code == 422)
    record("POST /api/explain (invalid free text)", passed, f"Rejected with HTTP {e.code}")
except Exception as e:
    record("POST /api/explain (invalid free text)", False, str(e))

# 5. Check CORS headers
try:
    req = urllib.request.Request(
        f"{BASE_URL}/api/health",
        headers={"Origin": FRONTEND_ORIGIN, "User-Agent": "HAYAT-Verifier"}
    )
    with urllib.request.urlopen(req) as resp:
        allow_origin = resp.headers.get("Access-Control-Allow-Origin")
        passed = (allow_origin == FRONTEND_ORIGIN)
        record("CORS Origin Validation", passed, f"Allow-Origin: {allow_origin}")
except Exception as e:
    record("CORS Origin Validation", False, str(e))

# 6. Response header leak check
try:
    req = urllib.request.Request(f"{BASE_URL}/api/health")
    with urllib.request.urlopen(req) as resp:
        leaks = []
        for k, v in resp.headers.items():
            if "key" in k.lower() or "secret" in k.lower() or "token" in k.lower():
                leaks.append(k)
        passed = (len(leaks) == 0)
        record("No Secret Leaks in Headers", passed, f"Checked {len(resp.headers)} headers; leak candidates: {leaks}")
except Exception as e:
    record("No Secret Leaks in Headers", False, str(e))

all_passed = all(r["passed"] for r in results)
print("\nOVERALL BACKEND STATUS:", "ALL PASSED" if all_passed else "SOME FAILED")
if not all_passed:
    sys.exit(1)
