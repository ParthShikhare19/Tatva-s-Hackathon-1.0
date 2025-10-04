from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routes
from .routes.job_codes import router as job_codes_router
from .routes.providers import router as providers_router
from .routes.customers import router as customers_router
from .routes.otp import router as otp_router
from .routes.dashboard import router as dashboard_router
from .auth.routes import router as auth_router

app = FastAPI(
    title="Community Connection Platform API",
    description="API for local service trust platform with completion code verification",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(otp_router)
app.include_router(job_codes_router)
app.include_router(providers_router)
app.include_router(customers_router)
app.include_router(dashboard_router)

@app.get("/")
def root():
    return {
        "message": "Community Connection Platform API - Ready!",
        "docs": "/docs"
    }

@app.get("/health")
def health():
    return {"status": "healthy", "database": "neon-postgresql"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)