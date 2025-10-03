# Routes module
from .job_codes import router as job_codes_router
from .providers import router as providers_router
from .customers import router as customers_router

__all__ = ["job_codes_router", "providers_router", "customers_router"]