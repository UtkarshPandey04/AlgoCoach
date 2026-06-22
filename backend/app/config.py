import os
from dotenv import load_dotenv

load_dotenv()


def _parse_bool(value: str | None, default: bool = False) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _parse_origins(value: str | None) -> list[str]:
    if not value:
        return [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]
    return [origin.strip() for origin in value.split(",") if origin.strip()]


APP_NAME = os.getenv("APP_NAME", "AlgoCoach")
DEBUG = _parse_bool(os.getenv("DEBUG"), default=False)
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./algocoach.db")

BACKEND_HOST = os.getenv("BACKEND_HOST", "0.0.0.0")
BACKEND_PORT = int(os.getenv("BACKEND_PORT", "8000"))
FRONTEND_ORIGINS = _parse_origins(os.getenv("FRONTEND_ORIGINS"))

JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 60 * 24

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
