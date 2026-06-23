"""
Metaphor service for personalization engine.

This service handles personalized welcome messages and metaphor selection
based on user background for cooking experiences.
"""
from typing import Optional
import asyncpg
import logging
from ..utils.logger import get_logger

logger = get_logger(__name__)


class MetaphorService:
    """
    Service class for handling personalized metaphors based on user background.
    """

    def __init__(self):
        """Initialize MetaphorService."""
        pass

    async def get_welcome_message(
        self,
        db_pool: asyncpg.Pool,
        background_type: str,
        background_level: str,
        language: str = 'EN'
    ) -> Optional[str]:
        """
        Get a personalized welcome message based on user background.

        Args:
            db_pool: Database connection pool
            background_type: Type of background (software, hardware, cooking)
            background_level: Level of background (beginner, intermediate, expert)
            language: Language code for the message

        Returns:
            Personalized welcome message or None if not found
        """
        try:
            async with db_pool.acquire() as connection:
                # Query for active metaphor mapping for welcome message
                query = """
                SELECT metaphor_template
                FROM metaphor_mappings
                WHERE background_type = $1
                  AND background_level = $2
                  AND context = 'welcome_message'
                  AND is_active = true
                LIMIT 1
                """
                result = await connection.fetchrow(query, background_type, background_level)

                if result:
                    # In a real implementation, we would translate the message
                    # For now, return the template as is
                    return result['metaphor_template']
                else:
                    # Fallback to general welcome message
                    return f"Welcome! Enjoy your personalized cooking experience based on your {background_type} background."

        except Exception as e:
            logger.error(f"Error getting welcome message: {str(e)}")
            return None

    async def get_recipe_metaphor(
        self,
        db_pool: asyncpg.Pool,
        background_type: str,
        background_level: str,
        recipe_context: str = 'recipe_explanation'
    ) -> Optional[str]:
        """
        Get a personalized recipe explanation metaphor based on user background.

        Args:
            db_pool: Database connection pool
            background_type: Type of background (software, hardware, cooking)
            background_level: Level of background (beginner, intermediate, expert)
            recipe_context: Context for the metaphor (recipe_explanation, safety_tips, etc.)

        Returns:
            Personalized recipe metaphor or None if not found
        """
        try:
            async with db_pool.acquire() as connection:
                query = """
                SELECT metaphor_template
                FROM metaphor_mappings
                WHERE background_type = $1
                  AND background_level = $2
                  AND context = $3
                  AND is_active = true
                LIMIT 1
                """
                result = await connection.fetchrow(query, background_type, background_level, recipe_context)

                if result:
                    return result['metaphor_template']
                else:
                    # Fallback to general message
                    return f"Here's how this recipe works based on your {background_type} background."

        except Exception as e:
            logger.error(f"Error getting recipe metaphor: {str(e)}")
            return None

    async def get_personalized_message(
        self,
        db_pool: asyncpg.Pool,
        background_type: str,
        background_level: str,
        context: str,
        language: str = 'EN'
    ) -> Optional[str]:
        """
        Get a personalized message based on user background and context.

        Args:
            db_pool: Database connection pool
            background_type: Type of background (software, hardware, cooking)
            background_level: Level of background (beginner, intermediate, expert)
            context: Context for the message (welcome_message, recipe_explanation, safety_tips)
            language: Language code for the message

        Returns:
            Personalized message or None if not found
        """
        try:
            async with db_pool.acquire() as connection:
                query = """
                SELECT metaphor_template
                FROM metaphor_mappings
                WHERE background_type = $1
                  AND background_level = $2
                  AND context = $3
                  AND is_active = true
                LIMIT 1
                """
                result = await connection.fetchrow(query, background_type, background_level, context)

                if result:
                    return result['metaphor_template']
                else:
                    return None

        except Exception as e:
            logger.error(f"Error getting personalized message: {str(e)}")
            return None