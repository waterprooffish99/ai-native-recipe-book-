"""
T035-T036: Generate and store embeddings for all recipes
Run this script to populate Qdrant with recipe embeddings
"""
import sys
import os
import asyncio
import asyncpg

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.services.rag_service import RAGService
from src.models.recipe import LanguageCode
from src.config import DATABASE_URL
from src.utils.logger import setup_logging

# Setup logging
logger = setup_logging(log_level="INFO")


async def main():
    """Generate embeddings for all recipes"""
    logger.info("🚀 Starting recipe embedding generation...")

    # Create database connection pool
    logger.info(f"Connecting to database...")
    db_pool = await asyncpg.create_pool(DATABASE_URL)

    try:
        # Create RAG service
        rag_service = RAGService(db_pool)

        # Generate embeddings for English recipes
        logger.info("📝 Generating embeddings for English recipes...")
        count = await rag_service.generate_all_embeddings(LanguageCode.EN)

        logger.info(f"\n✅ SUCCESS! Generated embeddings for {count} recipes")
        logger.info(f"🎯 Recipes are now searchable via vector similarity in Qdrant")
        logger.info(f"\nTry searching with queries like:")
        logger.info(f"  • 'Which recipe is easiest for a beginner?'")
        logger.info(f"  • 'I want something quick and simple'")
        logger.info(f"  • 'Show me Pakistani cuisine'")
        logger.info(f"  • 'What can I make in 15 minutes?'")

    except Exception as e:
        logger.error(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

    finally:
        # Close database pool
        await db_pool.close()
        logger.info("\n✓ Database connection closed")


if __name__ == "__main__":
    asyncio.run(main())
