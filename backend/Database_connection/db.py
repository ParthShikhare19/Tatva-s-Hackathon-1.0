from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os
from pathlib import Path

env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv('DB_URL')

if not DATABASE_URL:
    raise ValueError("DB_URL must be set in environment variables")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=5,
    max_overflow=10,
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    # Import all models to ensure they're registered with SQLAlchemy
    import sys
    from pathlib import Path
    sys.path.append(str(Path(__file__).parent.parent))
    
    from auth.models import User
    from models.providers import Provider
    from models.customers import Customer  
    from models.job_codes import JobCode
    from models.jobs import Job
    from models.reviews import Review
    from models.otp import OTPVerification
    
    Base.metadata.create_all(bind=engine)
