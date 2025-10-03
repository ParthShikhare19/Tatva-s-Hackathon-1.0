from fastapi import FastAPI
from .routes.job_codes import router as job_codes_router
from .Database_connection.db import engine, Base

# Don't auto-create tables - they already exist in database
# Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Community Connection Platform API",
    description="API for local service trust platform with completion code verification",
    version="1.0.0"
)

# Include routers
app.include_router(job_codes_router)

@app.get("/")
def read_root():
    return {"message": "Community Connection Platform API - Ready!"}

