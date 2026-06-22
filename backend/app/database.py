import logging
import os

from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import DATABASE_URL

logger = logging.getLogger(__name__)
USING_SQLITE_FALLBACK = False


def _create_engine(url: str):
    if url.startswith("sqlite"):
        return create_engine(url, connect_args={"check_same_thread": False})

    return create_engine(
        url,
        pool_pre_ping=True,
        pool_recycle=1800,
        pool_size=5,
        max_overflow=10,
    )


engine = _create_engine(DATABASE_URL)

if not DATABASE_URL.startswith("sqlite"):
    try:
        with engine.connect():
            pass
    except OperationalError:
        USING_SQLITE_FALLBACK = True
        fallback_url = f"sqlite:///{os.path.join(os.path.dirname(__file__), '..', 'algocoach.db')}"
        logger.warning(
            "Primary database connection failed; falling back to local SQLite at %s",
            fallback_url,
        )
        engine = _create_engine(fallback_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
