from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from Database_connection.db import engine, Base
from auth import router as auth_router, create_tables
from routes.providers import router as providers_router
from routes.customers import router as customers_router
from routes.job_codes import router as job_codes_router

app = FastAPI(
    title="Community Services API",
    description="Local Services Trust Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Include routers
app.include_router(auth_router)
app.include_router(job_codes_router)
app.include_router(providers_router)
app.include_router(customers_router)

@app.on_event("startup") 
def startup_event():
    # Tables already exist in the database
    # Uncomment below if you need to create tables
    # create_tables()
    pass

@app.get("/")
def root():
    return {
        "message": "Community Services API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "neon-postgresql"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
