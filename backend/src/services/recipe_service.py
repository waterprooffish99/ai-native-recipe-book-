"""
RecipeService (T031-T033)
Service layer for recipe operations with database queries
"""
from typing import List, Optional
from uuid import UUID
import asyncpg
from src.models.recipe import (
    Recipe, RecipeDetail, RecipeSummary, RecipeTranslation,
    RecipeStep, RecipeStepTranslation, LanguageCode, DifficultyLevel
)
from src.config import SUPPORTED_LANGUAGES
from src.middleware.error_handler import RecipeNotFoundError, TranslationNotFoundError, InvalidLanguageError


class RecipeService:
    """Service for managing recipe operations"""

    def __init__(self, db_pool: asyncpg.Pool):
        self.db_pool = db_pool

    async def get_recipe_by_id(
        self,
        recipe_id: UUID,
        language: LanguageCode = LanguageCode.EN
    ) -> Optional[RecipeDetail]:
        """
        T031: Get recipe by ID with all details in specified language

        Args:
            recipe_id: Recipe UUID
            language: Language code for translations

        Returns:
            RecipeDetail with translated content or None if not found
        """
        async with self.db_pool.acquire() as conn:
            # Get base recipe
            recipe_row = await conn.fetchrow("""
                SELECT recipe_id, name, origin_country, difficulty,
                       prep_time, cook_time, total_time, servings
                FROM recipes
                WHERE recipe_id = $1 AND is_active = true
            """, recipe_id)

            if not recipe_row:
                return None

            # Get translation
            translation_row = await conn.fetchrow("""
                SELECT name, kitchen_guard, ingredients
                FROM recipe_translations
                WHERE recipe_id = $1 AND language_code = $2
            """, recipe_id, language.value)

            if not translation_row:
                raise TranslationNotFoundError(str(recipe_id), language.value)

            # Get steps with translations
            step_rows = await conn.fetch("""
                SELECT rs.step_number, rst.instruction
                FROM recipe_steps rs
                LEFT JOIN recipe_step_translations rst ON rs.step_id = rst.step_id
                WHERE rs.recipe_id = $1 AND rst.language_code = $2
                ORDER BY rs.step_number
            """, recipe_id, language.value)

            steps = [
                {"step_number": row["step_number"], "instruction": row["instruction"]}
                for row in step_rows
            ]

            # Build RecipeDetail
            return RecipeDetail(
                recipe_id=recipe_row["recipe_id"],
                name=translation_row["name"],
                origin_country=recipe_row["origin_country"],
                difficulty=DifficultyLevel(recipe_row["difficulty"]),
                prep_time=recipe_row["prep_time"],
                cook_time=recipe_row["cook_time"],
                total_time=recipe_row["total_time"],
                servings=recipe_row["servings"],
                kitchen_guard=translation_row["kitchen_guard"],
                ingredients=translation_row["ingredients"] if translation_row["ingredients"] else [],
                steps=steps,
                language=language
            )

    async def list_recipes(
        self,
        language: LanguageCode = LanguageCode.EN,
        difficulty: Optional[DifficultyLevel] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[RecipeSummary]:
        """
        T032: List recipes with optional filters

        Args:
            language: Language code for translations
            difficulty: Optional difficulty filter
            limit: Maximum number of results
            offset: Pagination offset

        Returns:
            List of RecipeSummary objects
        """
        async with self.db_pool.acquire() as conn:
            # Build query
            query = """
                SELECT r.recipe_id, rt.name, r.origin_country, r.difficulty,
                       r.prep_time, r.cook_time, r.total_time, r.servings
                FROM recipes r
                INNER JOIN recipe_translations rt ON r.recipe_id = rt.recipe_id
                WHERE r.is_active = true AND rt.language_code = $1
            """
            params = [language.value]

            if difficulty:
                query += " AND r.difficulty = $" + str(len(params) + 1)
                params.append(difficulty.value)

            query += " ORDER BY r.name LIMIT $" + str(len(params) + 1) + " OFFSET $" + str(len(params) + 2)
            params.extend([limit, offset])

            rows = await conn.fetch(query, *params)

            return [
                RecipeSummary(
                    recipe_id=row["recipe_id"],
                    name=row["name"],
                    origin_country=row["origin_country"],
                    difficulty=DifficultyLevel(row["difficulty"]),
                    prep_time=row["prep_time"],
                    cook_time=row["cook_time"],
                    total_time=row["total_time"],
                    servings=row["servings"],
                    language=language
                )
                for row in rows
            ]

    async def get_recipe_translation(
        self,
        recipe_id: UUID,
        language: LanguageCode
    ) -> Optional[RecipeDetail]:
        """
        T033: Get recipe in specific language (delegates to get_recipe_by_id)

        Args:
            recipe_id: Recipe UUID
            language: Target language code

        Returns:
            RecipeDetail in requested language
        """
        # Validate language
        if language.value not in SUPPORTED_LANGUAGES:
            raise InvalidLanguageError(language.value, SUPPORTED_LANGUAGES)

        return await self.get_recipe_by_id(recipe_id, language)