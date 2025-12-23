"""Global Plate FastAPI Application Entrypoint"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from src.db.connection import connect_db, disconnect_db

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Global Plate API",
    description="Backend API for Global Plate - The AI-Voice Recipe Companion",
    version="1.0.0",
)

# CORS configuration
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Database lifecycle events
@app.on_event("startup")
async def startup():
    """Connect to database on startup."""
    await connect_db()
    print("🚀 Global Plate API started")


@app.on_event("shutdown")
async def shutdown():
    """Disconnect from database on shutdown."""
    await disconnect_db()
    print("👋 Global Plate API shutdown")


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


# Import and include routers (will be added in User Story phases)
# from src.api import auth, users, survey
# app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
# app.include_router(users.router, prefix="/users", tags=["Users"])
# app.include_router(survey.router, prefix="/survey", tags=["Survey"])
