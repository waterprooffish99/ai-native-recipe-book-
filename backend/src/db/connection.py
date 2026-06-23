"""Database connection management using databases library with asyncpg."""

import logging
import os
from databases import Database
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

# Create database instance
database = Database(DATABASE_URL)


async def connect_db():
    """Connect to the database."""
    await database.connect()
    logger.info("✅ Connected to database")


async def disconnect_db():
    """Disconnect from the database."""
    await database.disconnect()
    logger.info("✅ Disconnected from database")


async def get_database() -> Database:
    """Get the database instance for queries."""
    return database
