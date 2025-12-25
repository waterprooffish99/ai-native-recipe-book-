"""
Recipe API Endpoints (T039-T045)
FastAPI routes for recipe operations including RAG search
"""
from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
from uuid import UUID
import asyncpg

from src.models.recipe import (
    RecipeDetail, RecipeSummary, RecipeSearchResult,
    LanguageCode, DifficultyLevel
)
from src.services.recipe_service import RecipeService
from src.services.rag_service import RAGService
from src.middleware.error_handler import (
    RecipeNotFoundError, TranslationNotFoundError,
    InvalidLanguageError, InvalidDifficultyError
)
from src.config import SUPPORTED_LANGUAGES, DIFFICULTY_LEVELS
from src.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/recipes", tags=["recipes"])


# Dependency to get database pool (will be injected by FastAPI app)
async def get_db_pool() -> asyncpg.Pool:
    """Dependency for database pool - configured in main app"""
    from src.main import db_pool
    return db_pool


# T043: Validate language code
def validate_language(language: str) -> LanguageCode:
    """
    Validate that language code is supported

    Raises:
        InvalidLanguageError: If language not in supported list
    """
    if language.upper() not in SUPPORTED_LANGUAGES:
        raise InvalidLanguageError(language, SUPPORTED_LANGUAGES)
    return LanguageCode(language.upper())


# T044: Validate difficulty level
def validate_difficulty(difficulty: str) -> DifficultyLevel:
    """
    Validate that difficulty level is valid

    Raises:
        InvalidDifficultyError: If difficulty not in valid levels
    """
    if difficulty not in DIFFICULTY_LEVELS:
        raise InvalidDifficultyError(difficulty, DIFFICULTY_LEVELS)
    return DifficultyLevel(difficulty)


@router.get("", response_model=List[RecipeSummary])
async def list_recipes(
    language: str = Query("EN", description="Language code (EN, UR, AR, ES, FR, FA)"),
    difficulty: Optional[str] = Query(None, description="Difficulty level filter"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of results"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    db_pool: asyncpg.Pool = Depends(get_db_pool)
):
    """
    T039: List all recipes with optional filters

    Args:
        language: Language code for translations
        difficulty: Optional difficulty filter
        limit: Maximum results (1-100)
        offset: Pagination offset

    Returns:
        List of RecipeSummary objects

    Raises:
        InvalidLanguageError: If language code invalid
        InvalidDifficultyError: If difficulty invalid
    """
    logger.info(f"GET /recipes - language={language}, difficulty={difficulty}")

    # Validate language
    lang_code = validate_language(language)

    # Validate difficulty if provided
    diff_level = None
    if difficulty:
        diff_level = validate_difficulty(difficulty)

    # Get recipes
    recipe_service = RecipeService(db_pool)
    recipes = await recipe_service.list_recipes(
        language=lang_code,
        difficulty=diff_level,
        limit=limit,
        offset=offset
    )

    logger.info(f"✓ Returned {len(recipes)} recipes")
    return recipes


@router.get("/{recipe_id}", response_model=RecipeDetail)
async def get_recipe(
    recipe_id: UUID,
    language: str = Query("EN", description="Language code (EN, UR, AR, ES, FR, FA)"),
    db_pool: asyncpg.Pool = Depends(get_db_pool)
):
    """
    T040: Get recipe by ID with full details

    Args:
        recipe_id: Recipe UUID
        language: Language code for translations

    Returns:
        RecipeDetail with all information

    Raises:
        HTTPException 404: If recipe not found
        InvalidLanguageError: If language code invalid
    """
    logger.info(f"GET /recipes/{recipe_id} - language={language}")

    # Validate language
    lang_code = validate_language(language)

    # Get recipe
    recipe_service = RecipeService(db_pool)
    recipe = await recipe_service.get_recipe_by_id(recipe_id, lang_code)

    # T045: Error handling for recipe not found
    if not recipe:
        logger.warning(f"✗ Recipe {recipe_id} not found")
        raise HTTPException(
            status_code=404,
            detail={
                "error": f"Recipe not found: {recipe_id}",
                "code": "RecipeNotFound",
                "details": {"recipe_id": str(recipe_id)}
            }
        )

    logger.info(f"✓ Returned recipe: {recipe.name}")
    return recipe


@router.post("/search", response_model=List[RecipeSearchResult])
async def search_recipes(
    query: str = Query(..., description="Natural language search query"),
    language: str = Query("EN", description="Language code for results"),
    difficulty: Optional[str] = Query(None, description="Optional difficulty filter"),
    max_results: int = Query(5, ge=1, le=20, description="Maximum number of results"),
    db_pool: asyncpg.Pool = Depends(get_db_pool)
):
    """
    T041: RAG-based natural language recipe search

    Uses vector similarity search with OpenAI embeddings and Qdrant
    to find recipes matching natural language queries.

    Example queries:
    - "Which recipe is easiest for a beginner?"
    - "I want something quick and simple"
    - "Show me Pakistani cuisine"
    - "What can I make in 15 minutes?"

    Args:
        query: Natural language search query
        language: Language code for results
        difficulty: Optional difficulty filter
        max_results: Maximum results (1-20)

    Returns:
        List of RecipeSearchResult with relevance scores

    Raises:
        InvalidLanguageError: If language code invalid
    """
    logger.info(f"POST /recipes/search - query='{query}', language={language}")

    # Validate language
    lang_code = validate_language(language)

    # Create RAG service
    rag_service = RAGService(db_pool)

    # Perform RAG search
    try:
        results = await rag_service.search_recipes(
            query=query,
            language=lang_code,
            difficulty=difficulty,
            limit=max_results
        )

        logger.info(f"✓ Found {len(results)} matching recipes")
        return results

    except Exception as e:
        logger.error(f"✗ RAG search failed: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Search failed",
                "code": "SearchError",
                "details": {"message": str(e)}
            }
        )


@router.get("/{recipe_id}/translate", response_model=RecipeDetail)
async def translate_recipe(
    recipe_id: UUID,
    language: str = Query(..., description="Target language code (EN, UR, AR, ES, FR, FA)"),
    db_pool: asyncpg.Pool = Depends(get_db_pool)
):
    """
    T042: Get recipe in specific language

    Args:
        recipe_id: Recipe UUID
        language: Target language code

    Returns:
        RecipeDetail in requested language

    Raises:
        HTTPException 404: If recipe or translation not found
        InvalidLanguageError: If language code invalid
    """
    logger.info(f"GET /recipes/{recipe_id}/translate - language={language}")

    # Validate language
    lang_code = validate_language(language)

    # Get translated recipe
    recipe_service = RecipeService(db_pool)

    try:
        recipe = await recipe_service.get_recipe_translation(recipe_id, lang_code)

        if not recipe:
            raise HTTPException(
                status_code=404,
                detail={
                    "error": f"Recipe not found: {recipe_id}",
                    "code": "RecipeNotFound",
                    "details": {"recipe_id": str(recipe_id)}
                }
            )

        logger.info(f"✓ Returned translated recipe: {recipe.name}")
        return recipe

    except TranslationNotFoundError as e:
        logger.warning(f"✗ Translation not found: {e}")
        raise HTTPException(
            status_code=404,
            detail={
                "error": e.message,
                "code": "TranslationNotFound",
                "details": e.details
            }
        )
