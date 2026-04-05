from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AlgoCoach API",
    description="Smart Coding Interview Coach — Backend",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "AlgoCoach API is running!"}

@app.get("/health")
def health_check():
    return {"status": "ok", "app": "AlgoCoach"}