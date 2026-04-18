from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import APP_NAME, FRONTEND_ORIGINS
from app.database import Base, engine
from app.routers import auth, dashboard, platform


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=f"{APP_NAME} API",
    description="Smart Coding Interview Coach Backend",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(platform.router)


@app.get("/")
def root():
    return {"message": f"{APP_NAME} API is running!"}


@app.get("/health")
def health_check():
    return {"status": "ok", "app": APP_NAME}
