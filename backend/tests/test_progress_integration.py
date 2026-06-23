import asyncio
import os
import sys
import uuid
from dotenv import load_dotenv

# Add backend/src to path
sys.path.insert(0, '/home/waterprooffish99/projects/recipe-cook-book/backend')

import asyncpg
from src.services.recipe_service import RecipeService

async def main():
    load_dotenv('/home/waterprooffish99/projects/recipe-cook-book/backend/.env')
    pool = await asyncpg.create_pool(os.getenv("DATABASE_URL"))

    # 1. Fetch a recipe
    recipes = await pool.fetch("SELECT recipe_id, name FROM recipes LIMIT 1")
    if not recipes:
        print("No recipes in db")
        await pool.close()
        return

    recipe_id = recipes[0]["recipe_id"]
    print(f"Testing recipe: {recipes[0]['name']} ({recipe_id})")

    # 2. Insert dummy user
    user_id = uuid.uuid4()
    email = f"test_{user_id.hex[:6]}@example.com"
    print(f"Inserting dummy user: {email} ({user_id})")
    await pool.execute("""
        INSERT INTO users (id, email, name, cooking_level, onboarding_completed, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    """, user_id, email, 'Test User', 'Absolute Beginner', True)

    service = RecipeService(pool)

    try:
        # Test update progress
        print("Updating progress to step 2 (in_progress)...")
        progress = await service.update_recipe_progress(
            user_id=user_id,
            recipe_id=recipe_id,
            current_step=2,
            step_status="in_progress",
            cook_mode_active=True
        )
        print(f"Progress updated successfully!")
        print(f"  current_step: {progress.current_step}")
        print(f"  cook_mode_active: {progress.cook_mode_active}")
        print(f"  steps count: {len(progress.step_progress)}")
        for step in progress.step_progress:
            print(f"    Step {step.step_number} ({step.step_id}): {step.status}")

        # Test toggle checkbox
        print("\nToggling ingredient checkbox 'ingredient_1' to checked...")
        ok = await service.toggle_ingredient_checkbox(
            user_id=user_id,
            recipe_id=recipe_id,
            ingredient_id="ingredient_1",
            is_checked=True
        )
        print(f"Checkbox toggle result: {ok}")

        # Test get progress again
        print("\nRetrieving progress...")
        progress = await service.get_recipe_progress(user_id, recipe_id)
        print("Progress retrieved successfully!")
        print(f"  current_step: {progress.current_step}")
        print(f"  cook_mode_active: {progress.cook_mode_active}")
        print(f"  progress_percentage: {progress.progress_percentage}%")
        print(f"  checkboxes count: {len(progress.ingredient_checkboxes)}")
        for cb in progress.ingredient_checkboxes:
            print(f"    Checkbox '{cb.ingredient_id}': {cb.is_checked} (checked_at: {cb.checked_at})")

        # Test mark step 2 complete
        print("\nUpdating progress to step 2 (completed)...")
        progress = await service.update_recipe_progress(
            user_id=user_id,
            recipe_id=recipe_id,
            current_step=2,
            step_status="completed",
            cook_mode_active=True
        )
        print(f"Progress retrieved successfully!")
        print(f"  current_step: {progress.current_step}")
        print(f"  progress_percentage: {progress.progress_percentage}%")
        for step in progress.step_progress:
            print(f"    Step {step.step_number}: {step.status} (completed_at: {step.completed_at})")

    finally:
        # Clean up
        print("\nCleaning up test data...")
        await pool.execute("DELETE FROM step_progress WHERE progress_user_id = $1", user_id)
        await pool.execute("DELETE FROM ingredient_checkboxes WHERE progress_user_id = $1", user_id)
        await pool.execute("DELETE FROM user_recipe_progress WHERE user_id = $1", user_id)
        await pool.execute("DELETE FROM users WHERE id = $1", user_id)
        print("Cleanup complete.")

    await pool.close()

if __name__ == "__main__":
    asyncio.run(main())
