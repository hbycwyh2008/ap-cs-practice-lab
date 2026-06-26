from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, classes, questions, test_cases, assignments, submissions, dashboard
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
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


@app.get("/health")
def health():
    return {"status": "ok"}
