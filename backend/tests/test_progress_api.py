import pytest
from fastapi.testclient import TestClient
from uuid import UUID, uuid4
from src.main import app
from src.api.users import get_current_user
from src.models.user import User
from datetime import datetime
import asyncio
import os
import asyncpg
from dotenv import load_dotenv

# Dummy authenticated user
DUMMY_USER_ID = uuid4()
DUMMY_USER = User(
    id=str(DUMMY_USER_ID),
    email="api_test@example.com",
    name="API Test User",
    cooking_level="Absolute Beginner",
    onboarding_completed=True,
    created_at=datetime.now(),
    updated_at=datetime.now()
)

async def override_get_current_user():
    return DUMMY_USER

@pytest.fixture(autouse=True)
def setup_dependency_overrides():
    app.dependency_overrides[get_current_user] = override_get_current_user
    yield
    app.dependency_overrides.clear()

def test_interactive_progress_flow():
    client = TestClient(app)

    load_dotenv()

    async def get_test_data():
        conn = await asyncpg.connect(os.getenv("DATABASE_URL"))
        recipe = await conn.fetchrow("SELECT recipe_id FROM recipes LIMIT 1")
        # Ensure our dummy user is in users table
        await conn.execute("""
            INSERT INTO users (id, email, name, cooking_level, onboarding_completed, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
            ON CONFLICT (id) DO NOTHING
        """, DUMMY_USER_ID, DUMMY_USER.email, DUMMY_USER.name, DUMMY_USER.cooking_level, DUMMY_USER.onboarding_completed)
        await conn.close()
        return recipe["recipe_id"]

    recipe_id = asyncio.run(get_test_data())
    recipe_id_str = str(recipe_id)

    # 1. Get progress (should be 404 originally)
    response = client.get(f"/recipes/{recipe_id_str}/progress")
    assert response.status_code in [404, 200]

    # 2. Post progress update (to Step 2, completed)
    response = client.post(
        f"/recipes/{recipe_id_str}/progress",
        json={"current_step": 2, "step_status": "completed", "cook_mode_active": True}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["current_step"] == 2
    assert data["cook_mode_active"] is True
    assert data["progress_percentage"] == 20.0

    # 3. Get progress (should be 200 now)
    response = client.get(f"/recipes/{recipe_id_str}/progress")
    assert response.status_code == 200
    data = response.json()
    assert data["current_step"] == 2
    assert data["progress_percentage"] == 20.0

    # 4. Toggle ingredient check
    response = client.post(
        f"/recipes/{recipe_id_str}/ingredients/check",
        json={"ingredient_id": "onion_1", "is_checked": True}
    )
    assert response.status_code == 200
    assert response.json() == {"message": "Checkbox toggled successfully"}

    # 5. Toggle cook-mode
    response = client.post(f"/recipes/{recipe_id_str}/cook-mode")
    assert response.status_code == 200
    cook_data = response.json()
    assert cook_data["active"] is False # toggled from True to False
    assert cook_data["current_step"] == 2
    assert cook_data["wake_lock_enabled"] is False
    assert cook_data["large_text_mode"] is False

    # 6. Clean up
    async def cleanup_test_data():
        conn = await asyncpg.connect(os.getenv("DATABASE_URL"))
        await conn.execute("DELETE FROM step_progress WHERE progress_user_id = $1", DUMMY_USER_ID)
        await conn.execute("DELETE FROM ingredient_checkboxes WHERE progress_user_id = $1", DUMMY_USER_ID)
        await conn.execute("DELETE FROM user_recipe_progress WHERE user_id = $1", DUMMY_USER_ID)
        await conn.execute("DELETE FROM users WHERE id = $1", DUMMY_USER_ID)
        await conn.close()

    asyncio.run(cleanup_test_data())
