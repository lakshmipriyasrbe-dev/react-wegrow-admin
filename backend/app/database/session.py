from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Engine initialization with graceful PostgreSQL check
DATABASE_URL = settings.DATABASE_URL
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

engine = None

try:
    if "postgresql" in DATABASE_URL:
        test_engine = create_engine(DATABASE_URL, pool_pre_ping=True)
        # Test if connection works
        with test_engine.connect() as conn:
            pass
        engine = test_engine
        print("[DATABASE] Connected to PostgreSQL successfully.")
    else:
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
except Exception as e:
    print(f"[DATABASE NOTICE] PostgreSQL not reachable ({e}). Using local SQLite fallback for testing.")
    engine = create_engine("sqlite:///./fallback_wegrow.db", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
