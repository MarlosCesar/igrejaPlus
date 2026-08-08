import os
import socket
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings

db_url = settings.get_database_url()

def is_postgres_port_open(host: str = "127.0.0.1", port: int = 5432) -> bool:
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(0.2) # 200ms quick check
        s.connect((host, port))
        s.close()
        return True
    except Exception:
        return False

def get_working_engine():
    if settings.DATABASE_URL:
        url = settings.get_database_url()
        if url.startswith("sqlite"):
            return create_engine(url, connect_args={"check_same_thread": False}, pool_pre_ping=True)
        try:
            test_engine = create_engine(url, pool_pre_ping=True)
            with test_engine.connect() as conn:
                pass
            print("[DATABASE] Successfully connected to cloud PostgreSQL database!")
            return test_engine
        except Exception as e:
            print(f"[DATABASE WARNING] Failed to connect to DATABASE_URL: {e}. Falling back to persistent SQLite.")

    # Ensure persistent data directory exists
    os.makedirs(settings.DATA_DIR, exist_ok=True)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # Instant fallback to SQLite in persistent DATA_DIR if Postgres is unavailable
    sqlite_path = os.path.join(settings.DATA_DIR, "igrejaplus.db")
    fallback_url = f"sqlite:///{sqlite_path}"
    return create_engine(fallback_url, connect_args={"check_same_thread": False}, pool_pre_ping=True)

engine = get_working_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
