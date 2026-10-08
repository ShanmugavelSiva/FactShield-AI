"""FactShield AI - FastAPI Application Entry Point."""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from config.settings import settings
from database.connection import connect_db, close_db
from middleware.rate_limit import limiter
from routes import auth, predict, verify, summarize, dashboard, history, admin

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("Starting FactShield AI backend...")
    await connect_db()
    yield
    logger.info("Shutting down FactShield AI backend...")
    await close_db()


app = FastAPI(
    title="FactShield AI API",
    description="AI-powered Fake News Detection and Fact Verification Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(predict.router, prefix="/predict", tags=["Prediction"])
app.include_router(verify.router, prefix="/verify", tags=["Verification"])
app.include_router(summarize.router, prefix="/summarize", tags=["Summarization"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(history.router, prefix="/history", tags=["History"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])


@app.get("/", tags=["Health"])
async def root():
    return {"message": "FactShield AI API", "version": "1.0.0", "status": "running"}


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}
