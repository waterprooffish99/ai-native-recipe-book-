"""Global Plate FastAPI Application Entrypoint"""

import os
import logging
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from src.db.connection import connect_db, disconnect_db

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Global Plate API",
    description="Backend API for Global Plate - The AI-Voice Recipe Companion",
    version="1.0.0",
)

# Add rate limiter to app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configuration
# Constitution Principle V: Multi-Modal Excellence - supports both text and voice queries
# Note: Using port 8002 due to port 8000/8001 conflict in WSL/Windows environment
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    os.getenv("FRONTEND_URL", "http://localhost:3000"),  # Support environment variable override
]

logger.info(f"CORS enabled for origins: {ALLOWED_ORIGINS}")
logger.info("Note: Backend running on port 8002 (ports 8000/8001 unavailable in WSL)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
    expose_headers=["X-Request-ID"],
    max_age=3600,
)

# Add request logging middleware
from src.middleware.logging_middleware import RequestLoggingMiddleware
app.add_middleware(RequestLoggingMiddleware)


# Database lifecycle events
@app.on_event("startup")
async def startup():
    """Connect to database on startup."""
    await connect_db()
    logger.info("🚀 Global Plate API started")


@app.on_event("shutdown")
async def shutdown():
    """Disconnect from database on shutdown."""
    await disconnect_db()
    logger.info("👋 Global Plate API shutdown")


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "Global Plate API"}


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API info."""
    return {
        "message": "Welcome to Global Plate API",
        "version": "1.0.0",
        "docs": "/docs",
    }


# Import and include routers
from src.api import auth, users, survey, recipes
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(survey.router, prefix="/survey", tags=["Survey"])
app.include_router(recipes.router, tags=["Recipes"])
