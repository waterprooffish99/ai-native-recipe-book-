"""
Metaphor API endpoints for personalization engine.

This module provides API endpoints for personalized welcome messages
and metaphor selection based on user background.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
import asyncpg

from ..services.metaphor_service import MetaphorService
from ..utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/metaphors", tags=["metaphors"])


# Dependency to get database pool (will be injected by FastAPI app)
async def get_db_pool() -> asyncpg.Pool:
    """Dependency for database pool - configured in main app"""
    from ..main import db_pool
    return db_pool


@router.get("/welcome")
async def get_welcome_message(
    background_type: str = Query(..., description="User's background type (software, hardware, cooking, other)", regex="^(software|hardware|cooking|other)$"),
    background_level: str = Query(..., description="User's background level (beginner, intermediate, expert)", regex="^(beginner|intermediate|expert)$"),
    language: str = Query("EN", description="Language code for the message", regex="^(EN|UR|AR|ES|FR|FA)$"),
    db_pool: asyncpg.Pool = Depends(get_db_pool)
):
    """
    Get a personalized welcome message based on user background.

    Args:
        background_type: Type of background (software, hardware, cooking, other)
        background_level: Level of background (beginner, intermediate, expert)
        language: Language code for the message (EN, UR, AR, ES, FR, FA)
        db_pool: Database connection pool

    Returns:
        JSON response with personalized welcome message
    """
    try:
        logger.info(f"GET /metaphors/welcome - type={background_type}, level={background_level}, lang={language}")

        # Validate input parameters
        valid_background_types = ["software", "hardware", "cooking", "other"]
        valid_background_levels = ["beginner", "intermediate", "expert"]
        valid_languages = ["EN", "UR", "AR", "ES", "FR", "FA"]

        if background_type not in valid_background_types:
            raise HTTPException(status_code=400, detail=f"background_type must be one of: {', '.join(valid_background_types)}")

        if background_level not in valid_background_levels:
            raise HTTPException(status_code=400, detail=f"background_level must be one of: {', '.join(valid_background_levels)}")

        if language not in valid_languages:
            raise HTTPException(status_code=400, detail=f"language must be one of: {', '.join(valid_languages)}")

        # Create metaphor service instance
        metaphor_service = MetaphorService()

        # Get personalized welcome message
        welcome_message = await metaphor_service.get_welcome_message(
            db_pool=db_pool,
            background_type=background_type,
            background_level=background_level,
            language=language
        )

        if not welcome_message:
            # Fallback message
            welcome_message = f"Welcome! Enjoy your personalized cooking experience based on your {background_type} background."

        logger.info(f"✓ Returned personalized welcome message for {background_type} {background_level}")
        return {
            "message": welcome_message,
            "background_type": background_type,
            "background_level": background_level,
            "language": language
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"✗ Error getting welcome message: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/personalized-message")
async def get_personalized_message(
    context: str = Query(..., description="Context for the message (welcome_message, recipe_explanation, safety_tips)", regex="^(welcome_message|recipe_explanation|safety_tips|cooking_tips)$"),
    background_type: str = Query(..., description="User's background type (software, hardware, cooking, other)", regex="^(software|hardware|cooking|other)$"),
    background_level: str = Query(..., description="User's background level (beginner, intermediate, expert)", regex="^(beginner|intermediate|expert)$"),
    language: str = Query("EN", description="Language code for the message", regex="^(EN|UR|AR|ES|FR|FA)$"),
    db_pool: asyncpg.Pool = Depends(get_db_pool)
):
    """
    Get a personalized message based on user background and context.

    Args:
        context: Context for the message (welcome_message, recipe_explanation, safety_tips, cooking_tips)
        background_type: Type of background (software, hardware, cooking, other)
        background_level: Level of background (beginner, intermediate, expert)
        language: Language code for the message (EN, UR, AR, ES, FR, FA)
        db_pool: Database connection pool

    Returns:
        JSON response with personalized message
    """
    try:
        logger.info(f"GET /metaphors/personalized-message - context={context}, type={background_type}, level={background_level}, lang={language}")

        # Validate input parameters
        valid_contexts = ["welcome_message", "recipe_explanation", "safety_tips", "cooking_tips"]
        valid_background_types = ["software", "hardware", "cooking", "other"]
        valid_background_levels = ["beginner", "intermediate", "expert"]
        valid_languages = ["EN", "UR", "AR", "ES", "FR", "FA"]

        if context not in valid_contexts:
            raise HTTPException(status_code=400, detail=f"context must be one of: {', '.join(valid_contexts)}")

        if background_type not in valid_background_types:
            raise HTTPException(status_code=400, detail=f"background_type must be one of: {', '.join(valid_background_types)}")

        if background_level not in valid_background_levels:
            raise HTTPException(status_code=400, detail=f"background_level must be one of: {', '.join(valid_background_levels)}")

        if language not in valid_languages:
            raise HTTPException(status_code=400, detail=f"language must be one of: {', '.join(valid_languages)}")

        # Create metaphor service instance
        metaphor_service = MetaphorService()

        # Get personalized message
        message = await metaphor_service.get_personalized_message(
            db_pool=db_pool,
            background_type=background_type,
            background_level=background_level,
            context=context,
            language=language
        )

        if not message:
            # Fallback message
            message = f"Here's a personalized tip based on your {background_type} background for {context.replace('_', ' ')}."

        logger.info(f"✓ Returned personalized message for {context} in {background_type} {background_level}")
        return {
            "message": message,
            "context": context,
            "background_type": background_type,
            "background_level": background_level,
            "language": language
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"✗ Error getting personalized message: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")