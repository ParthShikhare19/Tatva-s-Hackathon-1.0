from fastapi import FastAPI
from routes.job_codes import router as job_codes_router
from Database_connection.db import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

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

from fastapi.middleware.cors import CORSMiddleware
from auth import router as auth_router, create_tables

app = FastAPI(
    title="Community Services API",
    description="Local Services Platform with Neon PostgreSQL",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

@app.on_event("startup")
def startup_event():
    create_tables()

@app.get("/")
def root():
    return {
        "message": "Community Services API running with Neon PostgreSQL!",
        "docs": "/docs"
    }

@app.get("/health")
def health():
    return {"status": "healthy", "database": "neon-postgresql"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
