from .health import router as health_router
from .explain import router as explain_router
from .evidence import router as evidence_router
from .research import router as research_router

__all__ = ["health_router", "explain_router", "evidence_router", "research_router"]
