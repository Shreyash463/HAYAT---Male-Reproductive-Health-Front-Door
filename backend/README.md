# HAYAT Male Reproductive Health API Backend

Privacy-preserving, clinical decision-support FastAPI backend for the **HAYAT** Male Reproductive Health Front Door (Abu Dhabi Digital Innovation Challenge).

## Architectural Principles
1. **Zero Personal Data Transmission**: The TypeScript risk engine executes 100% on the user's client device. The backend never receives raw questionnaire answers, names, IPs, or free text.
2. **Coded Factor Enums Only**: `/api/explain` accepts only pre-approved enum factor identifiers (`FactorIdEnum`), risk band, and triage level for plain-language rewriting.
3. **Safety Post-Filter**: Rejects diagnostic or shaming words and falls back gracefully to deterministic clinical templates.
4. **Anonymised Aggregate Research**: `/api/research-share` only accepts bucketed demographic bins with day-level dates, with explicit opt-in.

## Prerequisites
- Python 3.11+
- Google Gemini API Key (`GEMINI_API_KEY`)

## Local Setup
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Configure environment
cp .env.example .env
# Edit .env with your GEMINI_API_KEY

# 3. Run development server
uvicorn app.main:app --reload --port 8000
```

## Running Tests
```bash
pytest tests/ -v
```

## Docker Container
```bash
docker build -t hayat-backend .
docker run -p 8080:8080 -e GEMINI_API_KEY="your-key" hayat-backend
```
