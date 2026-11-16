import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from .config import settings
from .routes import health_router, explain_router, evidence_router, research_router
from .services.cohort_service import export_static_evidence_json

# Configure privacy-preserving logging (never log request bodies or IP addresses)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("hayat.main")

# Rate limiter: 20 req/minute default per client
limiter = Limiter(key_func=get_remote_address, default_limits=[settings.RATE_LIMIT_DEFAULT])

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure offline static fallback file is refreshed at startup
    workspace_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    static_evidence_path = os.path.join(workspace_root, "src", "data", "evidence.generated.json")
    try:
        export_static_evidence_json(static_evidence_path)
        logger.info(f"Refreshed offline static evidence data at: {static_evidence_path}")
    except Exception as e:
        logger.warning(f"Could not export static evidence fallback: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url=None
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Allowlist
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Request size limiter & Security headers middleware
@app.middleware("http")
async def security_and_size_middleware(request: Request, call_next):
    # Enforce request body size limit (64 KB cap)
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > settings.MAX_REQUEST_BODY_BYTES:
        return JSONResponse(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            content={"detail": "Request body exceeds maximum allowed size (64 KB)."}
        )

    response: Response = await call_next(request)

    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()"
    if settings.ENVIRONMENT != "development":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    return response

# Mount routers under /api
app.include_router(health_router, prefix="/api", tags=["Health"])
app.include_router(explain_router, prefix="/api", tags=["Explain"])
app.include_router(evidence_router, prefix="/api", tags=["Evidence"])
app.include_router(research_router, prefix="/api", tags=["Research"])
