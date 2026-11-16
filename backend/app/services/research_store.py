import os
import sqlite3
import uuid
from datetime import datetime, timezone
import logging
from ..config import settings
from ..schemas import ResearchShareRequest, ResearchShareResponse

logger = logging.getLogger("hayat.research")

class ResearchStore:
    def __init__(self):
        self._firestore_db = None
        self._initialized = False

    def _init_storage(self):
        if self._initialized:
            return
        self._initialized = True

        cred_path = settings.FIREBASE_CREDENTIALS_PATH
        if cred_path and os.path.exists(cred_path):
            try:
                import firebase_admin
                from firebase_admin import credentials, firestore

                if not firebase_admin._apps:
                    cred = credentials.Certificate(cred_path)
                    firebase_admin.initialize_app(cred)
                self._firestore_db = firestore.client()
                logger.info("Connected to Firebase Firestore for research aggregates.")
                return
            except Exception as e:
                logger.warning(f"Failed to connect to Firebase Firestore: {e}. Falling back to SQLite.")

        # Check if running in Vercel serverless environment without Firestore
        if os.environ.get("VERCEL") and not self._firestore_db:
            logger.info("Vercel serverless environment active: running in ephemeral research aggregate mode.")
            return

        # Ensure SQLite data directory exists
        try:
            os.makedirs(os.path.dirname(settings.SQLITE_DB_PATH), exist_ok=True)
            with sqlite3.connect(settings.SQLITE_DB_PATH) as conn:
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS research_aggregates (
                        id TEXT PRIMARY KEY,
                        age_bracket TEXT NOT NULL,
                        band TEXT NOT NULL,
                        triage_level TEXT NOT NULL,
                        language TEXT NOT NULL,
                        date TEXT NOT NULL,
                        created_at TEXT NOT NULL
                    )
                """)
                conn.commit()
            logger.info(f"Initialized local SQLite research database at {settings.SQLITE_DB_PATH}")
        except Exception as e:
            logger.warning(f"Could not initialize local SQLite database: {e}. Running ephemeral mode.")

    def save_aggregate(self, req: ResearchShareRequest) -> ResearchShareResponse:
        self._init_storage()

        record_id = f"AGG-{uuid.uuid4().hex[:12].upper()}"
        now_iso = datetime.now(timezone.utc).isoformat()

        doc_data = {
            "id": record_id,
            "age_bracket": req.age_bracket.value,
            "band": req.band.value,
            "triage_level": req.triage_level.value,
            "language": req.language.value,
            "date": req.date,
            "created_at": now_iso
        }

        if self._firestore_db:
            try:
                self._firestore_db.collection("research_aggregates").document(record_id).set(doc_data)
                return ResearchShareResponse(
                    success=True,
                    record_id=record_id,
                    backend_storage="firebase_firestore",
                    message="Anonymised research aggregate saved to Cloud Firestore."
                )
            except Exception as e:
                logger.warning(f"Error saving to Firestore: {e}. Falling back to SQLite/ephemeral.")

        # Vercel serverless ephemeral mode (no persistent disk)
        if os.environ.get("VERCEL"):
            return ResearchShareResponse(
                success=True,
                record_id=record_id,
                backend_storage="ephemeral_serverless",
                message="Anonymised research aggregate accepted (ephemeral serverless mode, zero disk persistence)."
            )

        # SQLite fallback
        try:
            with sqlite3.connect(settings.SQLITE_DB_PATH) as conn:
                conn.execute(
                    """
                    INSERT INTO research_aggregates (id, age_bracket, band, triage_level, language, date, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        record_id,
                        req.age_bracket.value,
                        req.band.value,
                        req.triage_level.value,
                        req.language.value,
                        req.date,
                        now_iso
                    )
                )
                conn.commit()

            return ResearchShareResponse(
                success=True,
                record_id=record_id,
                backend_storage="local_sqlite",
                message="Anonymised research aggregate recorded in secure local audit database."
            )
        except Exception as e:
            logger.warning(f"SQLite save failed: {e}. Returning ephemeral response.")
            return ResearchShareResponse(
                success=True,
                record_id=record_id,
                backend_storage="ephemeral_fallback",
                message="Anonymised research aggregate accepted in ephemeral fallback mode."
            )

research_store = ResearchStore()
