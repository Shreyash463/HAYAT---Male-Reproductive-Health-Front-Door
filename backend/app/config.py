import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "HAYAT Male Reproductive Health API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Gemini
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "")  # Auto-detected if empty

    # Security & CORS
    CORS_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://localhost:8080"
        ).split(",")
        if origin.strip()
    ]
    MAX_REQUEST_BODY_BYTES: int = 65536  # 64 KB strict body cap

    # Rate Limiting
    RATE_LIMIT_DEFAULT: str = "20/minute"

    # Research aggregate storage
    FIREBASE_CREDENTIALS_PATH: str = os.getenv("FIREBASE_CREDENTIALS_PATH", "")
    SQLITE_DB_PATH: str = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "data",
        "research_aggregates.db"
    )

settings = Settings()
