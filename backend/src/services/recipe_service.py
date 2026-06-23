"""
RecipeService (T031-T033)
Service layer for recipe operations with database queries
"""
from typing import List, Optional
from uuid import UUID
from datetime import datetime
import asyncpg
from src.models.recipe import (
    Recipe, RecipeDetail, RecipeSummary, RecipeTranslation,
    RecipeStep, RecipeStepTranslation, LanguageCode, DifficultyLevel,
    UserRecipeProgress, IngredientCheckboxState, StepProgressState
)
from src.config import SUPPORTED_LANGUAGES
from src.middleware.error_handler import RecipeNotFoundError, TranslationNotFoundError, InvalidLanguageError
from src.utils.logger import get_logger

logger = get_logger(__name__)



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

            # Get steps with translations, falling back to base instruction if translation missing
            step_rows = await conn.fetch("""
                SELECT rs.step_number, rs.instruction AS base_instruction, rst.instruction AS trans_instruction
                FROM recipe_steps rs
                LEFT JOIN recipe_step_translations rst ON rs.step_id = rst.step_id AND rst.language_code = $2
                WHERE rs.recipe_id = $1
                ORDER BY rs.step_number
            """, recipe_id, language.value)

            steps = [
                {
                    "step_number": row["step_number"],
                    "instruction": row["trans_instruction"] if row["trans_instruction"] else row["base_instruction"]
                }
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

    async def validate_recipe_kitchen_guard(
        self,
        recipe_id: UUID,
        language: LanguageCode = LanguageCode.EN
    ) -> bool:
        """
        T093: Validation to ensure recipe includes Kitchen Guard field

        Args:
            recipe_id: Recipe UUID to validate
            language: Language code for validation

        Returns:
            True if recipe has Kitchen Guard field, False otherwise
        """
        async with self.db_pool.acquire() as conn:
            # Get translation to check for kitchen_guard
            translation_row = await conn.fetchrow("""
                SELECT kitchen_guard
                FROM recipe_translations
                WHERE recipe_id = $1 AND language_code = $2
            """, recipe_id, language.value)

            if not translation_row:
                return False

            kitchen_guard = translation_row["kitchen_guard"]
            # Check if kitchen_guard exists and is not empty/null
            return kitchen_guard is not None and len(str(kitchen_guard).strip()) > 0

    async def validate_all_recipes_have_kitchen_guard(self) -> List[UUID]:
        """
        Validate all recipes in the database have Kitchen Guard field

        Returns:
            List of recipe IDs that are missing Kitchen Guard
        """
        async with self.db_pool.acquire() as conn:
            # Get all recipe IDs
            recipe_ids = await conn.fetch("SELECT DISTINCT recipe_id FROM recipes WHERE is_active = true")

            missing_kitchen_guard = []
            for row in recipe_ids:
                recipe_id = row["recipe_id"]

                # Check if this recipe has a kitchen_guard for at least one language
                has_guard = await conn.fetchval("""
                    SELECT COUNT(*) > 0
                    FROM recipe_translations
                    WHERE recipe_id = $1 AND kitchen_guard IS NOT NULL AND TRIM(kitchen_guard) != ''
                """, recipe_id)

                if not has_guard:
                    missing_kitchen_guard.append(recipe_id)

            return missing_kitchen_guard

    async def get_recipe_progress(
        self,
        user_id: UUID,
        recipe_id: UUID
    ) -> Optional[UserRecipeProgress]:
        """
        Get user's progress for a recipe.
        """
        logger.info(f"Retrieving progress for user_id={user_id}, recipe_id={recipe_id}")
        async with self.db_pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT user_id, recipe_id, current_step, total_steps, cook_mode_active, last_synced_at
                FROM user_recipe_progress
                WHERE user_id = $1 AND recipe_id = $2
            """, user_id, recipe_id)

            if not row:
                return None

            checkbox_rows = await conn.fetch("""
                SELECT ingredient_id, is_checked, checked_at
                FROM ingredient_checkboxes
                WHERE progress_user_id = $1 AND progress_recipe_id = $2
            """, user_id, recipe_id)

            checkboxes = [
                IngredientCheckboxState(
                    ingredient_id=r["ingredient_id"],
                    is_checked=r["is_checked"],
                    checked_at=r["checked_at"]
                )
                for r in checkbox_rows
            ]

            step_rows = await conn.fetch("""
                SELECT step_id, step_number, status, completed_at
                FROM step_progress
                WHERE progress_user_id = $1 AND progress_recipe_id = $2
                ORDER BY step_number
            """, user_id, recipe_id)

            step_progress = [
                StepProgressState(
                    step_id=r["step_id"],
                    step_number=r["step_number"],
                    status=r["status"],
                    completed_at=r["completed_at"]
                )
                for r in step_rows
            ]

            total_steps = row["total_steps"] or 5
            completed_steps = sum(1 for s in step_progress if s.status == "completed")
            progress_percentage = (completed_steps / total_steps) * 100.0 if total_steps > 0 else 0.0

            return UserRecipeProgress(
                user_id=row["user_id"],
                recipe_id=row["recipe_id"],
                current_step=row["current_step"],
                total_steps=total_steps,
                progress_percentage=progress_percentage,
                ingredient_checkboxes=checkboxes,
                step_progress=step_progress,
                cook_mode_active=row["cook_mode_active"],
                last_synced_at=row["last_synced_at"]
            )

    async def update_recipe_progress(
        self,
        user_id: UUID,
        recipe_id: UUID,
        current_step: int,
        step_status: str,
        cook_mode_active: bool = False
    ) -> UserRecipeProgress:
        """
        Initialize or update user's step progress for a recipe.
        """
        logger.info(f"Updating progress for user_id={user_id}, recipe_id={recipe_id} to step {current_step} ({step_status}), cook_mode={cook_mode_active}")
        async with self.db_pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT user_id, recipe_id, total_steps
                FROM user_recipe_progress
                WHERE user_id = $1 AND recipe_id = $2
            """, user_id, recipe_id)

            if not row:
                total_steps_count = await conn.fetchval("""
                    SELECT COUNT(*)
                    FROM recipe_steps
                    WHERE recipe_id = $1
                """, recipe_id) or 5

                await conn.execute("""
                    INSERT INTO user_recipe_progress (user_id, recipe_id, current_step, total_steps, cook_mode_active, last_synced_at)
                    VALUES ($1, $2, $3, $4, $5, NOW())
                """, user_id, recipe_id, current_step, total_steps_count, cook_mode_active)

                steps = await conn.fetch("""
                    SELECT step_id, step_number
                    FROM recipe_steps
                    WHERE recipe_id = $1
                    ORDER BY step_number
                """, recipe_id)

                for s in steps:
                    status = step_status if s["step_number"] == current_step else "pending"
                    completed_at = datetime.now() if status == "completed" else None
                    await conn.execute("""
                        INSERT INTO step_progress (progress_user_id, progress_recipe_id, step_id, step_number, status, started_at, completed_at, time_spent)
                        VALUES ($1, $2, $3, $4, $5, NOW(), $6, 0)
                    """, user_id, recipe_id, s["step_id"], s["step_number"], status, completed_at)
            else:
                await conn.execute("""
                    UPDATE user_recipe_progress
                    SET current_step = $3, cook_mode_active = $4, last_synced_at = NOW()
                    WHERE user_id = $1 AND recipe_id = $2
                """, user_id, recipe_id, current_step, cook_mode_active)

                step_id = await conn.fetchval("""
                    SELECT step_id
                    FROM recipe_steps
                    WHERE recipe_id = $1 AND step_number = $2
                """, recipe_id, current_step)

                if step_id:
                    completed_at_val = datetime.now() if step_status == "completed" else None
                    await conn.execute("""
                        INSERT INTO step_progress (progress_user_id, progress_recipe_id, step_id, step_number, status, started_at, completed_at, time_spent)
                        VALUES ($1, $2, $3, $4, $5, NOW(), $6, 0)
                        ON CONFLICT (progress_user_id, progress_recipe_id, step_id)
                        DO UPDATE SET status = EXCLUDED.status, completed_at = EXCLUDED.completed_at
                    """, user_id, recipe_id, step_id, current_step, step_status, completed_at_val)

            updated = await self.get_recipe_progress(user_id, recipe_id)
            if updated is None:
                raise ValueError("Failed to retrieve updated progress")
            return updated

    async def toggle_ingredient_checkbox(
        self,
        user_id: UUID,
        recipe_id: UUID,
        ingredient_id: str,
        is_checked: bool
    ) -> bool:
        """
        Toggle checked state of an ingredient checkbox.
        """
        logger.info(f"Toggling ingredient checkbox for user_id={user_id}, recipe_id={recipe_id}, ingredient_id='{ingredient_id}' to is_checked={is_checked}")
        async with self.db_pool.acquire() as conn:
            exists = await conn.fetchval("""
                SELECT COUNT(*) > 0
                FROM user_recipe_progress
                WHERE user_id = $1 AND recipe_id = $2
            """, user_id, recipe_id)

            if not exists:
                total_steps_count = await conn.fetchval("""
                    SELECT COUNT(*)
                    FROM recipe_steps
                    WHERE recipe_id = $1
                """, recipe_id) or 5

                await conn.execute("""
                    INSERT INTO user_recipe_progress (user_id, recipe_id, current_step, total_steps, cook_mode_active, last_synced_at)
                    VALUES ($1, $2, 1, $3, false, NOW())
                """, user_id, recipe_id, total_steps_count)

                steps = await conn.fetch("""
                    SELECT step_id, step_number
                    FROM recipe_steps
                    WHERE recipe_id = $1
                    ORDER BY step_number
                """, recipe_id)
                for s in steps:
                    await conn.execute("""
                        INSERT INTO step_progress (progress_user_id, progress_recipe_id, step_id, step_number, status, started_at, completed_at, time_spent)
                        VALUES ($1, $2, $3, $4, 'pending', NOW(), NULL, 0)
                    """, user_id, recipe_id, s["step_id"], s["step_number"])

            await conn.execute("""
                INSERT INTO ingredient_checkboxes (progress_user_id, progress_recipe_id, ingredient_id, is_checked, checked_at)
                VALUES ($1, $2, $3, $4, NOW())
                ON CONFLICT (progress_user_id, progress_recipe_id, ingredient_id)
                DO UPDATE SET is_checked = EXCLUDED.is_checked, checked_at = NOW()
            """, user_id, recipe_id, ingredient_id, is_checked)

            return True