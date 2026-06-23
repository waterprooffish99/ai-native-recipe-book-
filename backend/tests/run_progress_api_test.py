import asyncio
import os
import sys
from uuid import UUID, uuid4
from datetime import datetime
from dotenv import load_dotenv

# Add backend/src to path
sys.path.insert(0, '/home/waterprooffish99/projects/recipe-cook-book/backend')

from src.main import app
from src.api.users import get_current_user
from src.models.user import User
from fastapi.testclient import TestClient
import asyncpg

# Dummy authenticated user
DUMMY_USER_ID = uuid4()
DUMMY_EMAIL = f"api_test_{DUMMY_USER_ID.hex[:6]}@example.com"
DUMMY_USER = User(
    id=str(DUMMY_USER_ID),
    email=DUMMY_EMAIL,
    name="API Test User",
    cooking_level="Absolute Beginner",
    onboarding_completed=True,
    created_at=datetime.now(),
    updated_at=datetime.now()
)

async def override_get_current_user():
    return DUMMY_USER

async def run_tests():
    # Setup dependency overrides
    app.dependency_overrides[get_current_user] = override_get_current_user

    load_dotenv('/home/waterprooffish99/projects/recipe-cook-book/backend/.env')

    # 1. Fetch a recipe ID
    conn = await asyncpg.connect(os.getenv("DATABASE_URL"))
    recipe = await conn.fetchrow("SELECT recipe_id, name FROM recipes LIMIT 1")
    recipe_id = recipe["recipe_id"]
    recipe_name = recipe["name"]
    print(f"Testing recipe: {recipe_name} ({recipe_id})")

    # Clean up any leftover test users with this email just in case
    await conn.execute("DELETE FROM users WHERE email = $1", DUMMY_EMAIL)
    await conn.execute("DELETE FROM users WHERE email = 'api_test@example.com'")

    # Ensure our dummy user is in users table
    await conn.execute("""
        INSERT INTO users (id, email, name, cooking_level, onboarding_completed, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
    """, DUMMY_USER_ID, DUMMY_USER.email, DUMMY_USER.name, DUMMY_USER.cooking_level, DUMMY_USER.onboarding_completed)
    await conn.close()

    recipe_id_str = str(recipe_id)

    # Use with TestClient(app) as client to trigger FastAPI startup event handler (lifespan/db_pool init)
    with TestClient(app) as client:
        # 2. Get progress (should be 404 originally)
        print("GET /recipes/{recipeId}/progress (Initial progress check)...")
        response = client.get(f"/recipes/{recipe_id_str}/progress")
        print(f"  Response status: {response.status_code}")
        assert response.status_code in [404, 200]

        # 3. Post progress update (to Step 2, completed)
        print("POST /recipes/{recipeId}/progress (Set step 2 completed)...")
        response = client.post(
            f"/recipes/{recipe_id_str}/progress",
            json={"current_step": 2, "step_status": "completed", "cook_mode_active": True}
        )
        print(f"  Response status: {response.status_code}")
        assert response.status_code == 200
        data = response.json()
        assert data["current_step"] == 2
        assert data["cook_mode_active"] is True
        assert data["progress_percentage"] == 20.0
        print("  Progress updated successfully!")

        # 4. Get progress (should be 200 now)
        print("GET /recipes/{recipeId}/progress (Retrieve updated progress)...")
        response = client.get(f"/recipes/{recipe_id_str}/progress")
        assert response.status_code == 200
        data = response.json()
        assert data["current_step"] == 2
        assert data["progress_percentage"] == 20.0
        print("  Progress retrieved successfully!")

        # 5. Toggle ingredient check
        print("POST /recipes/{recipeId}/ingredients/check (Toggle checkbox)...")
        response = client.post(
            f"/recipes/{recipe_id_str}/ingredients/check",
            json={"ingredient_id": "onion_1", "is_checked": True}
        )
        print(f"  Response status: {response.status_code}")
        assert response.status_code == 200
        assert response.json() == {"message": "Checkbox toggled successfully"}
        print("  Checkbox toggled successfully!")

        # 6. Toggle cook-mode
        print("POST /recipes/{recipeId}/cook-mode (Toggle cook-mode)...")
        response = client.post(f"/recipes/{recipe_id_str}/cook-mode")
        print(f"  Response status: {response.status_code}")
        assert response.status_code == 200
        cook_data = response.json()
        assert cook_data["active"] is False  # toggled from True to False
        assert cook_data["current_step"] == 2
        assert cook_data["wake_lock_enabled"] is False
        assert cook_data["large_text_mode"] is False
        print("  Cook mode toggled successfully!")

    # 7. Clean up
    print("Cleaning up database...")
    conn = await asyncpg.connect(os.getenv("DATABASE_URL"))
    await conn.execute("DELETE FROM step_progress WHERE progress_user_id = $1", DUMMY_USER_ID)
    await conn.execute("DELETE FROM ingredient_checkboxes WHERE progress_user_id = $1", DUMMY_USER_ID)
    await conn.execute("DELETE FROM user_recipe_progress WHERE user_id = $1", DUMMY_USER_ID)
    await conn.execute("DELETE FROM users WHERE id = $1", DUMMY_USER_ID)
    await conn.close()
    print("Cleanup completed.")

    app.dependency_overrides.clear()
    print("\nALL API TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(run_tests())
