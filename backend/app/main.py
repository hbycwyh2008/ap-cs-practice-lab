from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, classes, questions, test_cases, assignments, submissions, dashboard, analytics
from app.config import settings
from app.database import create_db_and_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(
    title="AP CS Practice Lab API",
    description="AP CSA FRQ practice platform",
    version="0.1.0",
    lifespan=lifespan,
)

# Parse CORS origins from comma-separated string
cors_origins = [
    origin.strip()
    for origin in settings.cors_origins.split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(classes.router)
app.include_router(questions.router)
app.include_router(test_cases.router)
app.include_router(assignments.router)
app.include_router(submissions.router)
app.include_router(dashboard.router)
app.include_router(analytics.router)


@app.get("/health")
def health():
    return {"status": "ok"}
