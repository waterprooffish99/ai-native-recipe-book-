"""
Configuration settings for Global Plate Recipe System
Loads environment variables for Qdrant Cloud, OpenAI, and Database connections
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database Configuration (Neon Postgres)
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

# T016: Qdrant Cloud Configuration
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

if not QDRANT_URL:
    raise ValueError("QDRANT_URL environment variable is required for vector search")
if not QDRANT_API_KEY:
    raise ValueError("QDRANT_API_KEY environment variable is required for vector search")

# T017: OpenAI API Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is required for RAG embeddings")

# Qdrant Collection Settings
QDRANT_COLLECTION_NAME = "recipes"
QDRANT_VECTOR_SIZE = 1536  # OpenAI ada-002 embedding dimension
QDRANT_DISTANCE_METRIC = "Cosine"

# OpenAI Settings
OPENAI_EMBEDDING_MODEL = "text-embedding-ada-002"
OPENAI_MAX_TOKENS = 8191  # Max tokens for ada-002

# Supported Languages
SUPPORTED_LANGUAGES = ["EN", "UR", "AR", "ES", "FR", "FA"]

# Recipe Constraints
MAX_RECIPE_STEPS = 5
DIFFICULTY_LEVELS = ["Absolute Beginner", "Beginner", "Beginner+"]

# Performance Settings
RAG_SEARCH_LIMIT = 5  # Number of results to return from vector search
RAG_SCORE_THRESHOLD = 0.7  # Minimum relevance score for results

# T185: Clerk Auth Configuration
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL")

# T189: Redis Configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")


