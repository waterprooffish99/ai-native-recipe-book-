"""Database connection management using databases library with asyncpg."""

import os
from databases import Database
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

# Create database instance
database = Database(DATABASE_URL)


async def connect_db():
    """Connect to the database."""
    await database.connect()
    print(f"✅ Connected to database")


async def disconnect_db():
    """Disconnect from the database."""
    await database.disconnect()
    print(f"✅ Disconnected from database")


async def get_database() -> Database:
    """Get the database instance for queries."""
    return database
