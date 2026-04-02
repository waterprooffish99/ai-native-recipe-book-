#!/usr/bin/env python3
"""
Test script to validate the ingredients validator fix
"""
import sys
import os
import json
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__))))

from src.models.recipe import RecipeDetail
from uuid import UUID
from datetime import datetime

def test_ingredients_validator():
    """Test the ingredients validator with various input types"""
    print("Testing ingredients validator...")

    # Create a mock UUID and datetime for testing
    mock_uuid = UUID('12345678-1234-5678-1234-567812345678')
    mock_datetime = datetime.now()

    # Test 1: ingredients as a list (should work as before)
    print("\n1. Testing with list of ingredients...")
    try:
        recipe1 = RecipeDetail(
            recipe_id=mock_uuid,
            name="Test Recipe",
            origin_country="Test Country",
            difficulty="Absolute Beginner",
            prep_time=10,
            cook_time=20,
            total_time=30,
            servings=4,
            kitchen_guard="Test safety tip",
            ingredients=[{"name": "flour", "quantity": "2 cups"}, {"name": "sugar", "quantity": "1 cup"}],
            steps=[{"step_number": 1, "instruction": "Mix ingredients"}],
            language="EN",
            created_at=mock_datetime  # This is needed for validation
        )
        print(f"   ✓ List input works: {recipe1.ingredients}")
    except Exception as e:
        print(f"   ✗ List input failed: {e}")

    # Test 2: ingredients as a stringified JSON (the problematic case)
    print("\n2. Testing with stringified JSON ingredients...")
    try:
        recipe2 = RecipeDetail(
            recipe_id=mock_uuid,
            name="Test Recipe",
            origin_country="Test Country",
            difficulty="Absolute Beginner",
            prep_time=10,
            cook_time=20,
            total_time=30,
            servings=4,
            kitchen_guard="Test safety tip",
            ingredients='{"name": "flour", "quantity": "2 cups"}',  # Stringified JSON dict
            steps=[{"step_number": 1, "instruction": "Mix ingredients"}],
            language="EN",
            created_at=mock_datetime
        )
        print(f"   ✓ Stringified JSON input works: {recipe2.ingredients}")
    except Exception as e:
        print(f"   ✗ Stringified JSON input failed: {e}")

    # Test 3: ingredients as a string (not JSON)
    print("\n3. Testing with plain string ingredients...")
    try:
        recipe3 = RecipeDetail(
            recipe_id=mock_uuid,
            name="Test Recipe",
            origin_country="Test Country",
            difficulty="Absolute Beginner",
            prep_time=10,
            cook_time=20,
            total_time=30,
            servings=4,
            kitchen_guard="Test safety tip",
            ingredients='flour',  # Plain string
            steps=[{"step_number": 1, "instruction": "Mix ingredients"}],
            language="EN",
            created_at=mock_datetime
        )
        print(f"   ✓ Plain string input works: {recipe3.ingredients}")
    except Exception as e:
        print(f"   ✗ Plain string input failed: {e}")

    # Test 4: ingredients as a dict (the other problematic case)
    print("\n4. Testing with dict ingredients...")
    try:
        recipe4 = RecipeDetail(
            recipe_id=mock_uuid,
            name="Test Recipe",
            origin_country="Test Country",
            difficulty="Absolute Beginner",
            prep_time=10,
            cook_time=20,
            total_time=30,
            servings=4,
            kitchen_guard="Test safety tip",
            ingredients={"name": "flour", "quantity": "2 cups"},  # Dict
            steps=[{"step_number": 1, "instruction": "Mix ingredients"}],
            language="EN",
            created_at=mock_datetime
        )
        print(f"   ✓ Dict input works: {recipe4.ingredients}")
    except Exception as e:
        print(f"   ✗ Dict input failed: {e}")

    # Test 5: ingredients as None
    print("\n5. Testing with None ingredients...")
    try:
        recipe5 = RecipeDetail(
            recipe_id=mock_uuid,
            name="Test Recipe",
            origin_country="Test Country",
            difficulty="Absolute Beginner",
            prep_time=10,
            cook_time=20,
            total_time=30,
            servings=4,
            kitchen_guard="Test safety tip",
            ingredients=None,  # None
            steps=[{"step_number": 1, "instruction": "Mix ingredients"}],
            language="EN",
            created_at=mock_datetime
        )
        print(f"   ✓ None input works: {recipe5.ingredients}")
    except Exception as e:
        print(f"   ✗ None input failed: {e}")

    print("\n✓ All tests completed successfully!")

if __name__ == "__main__":
    test_ingredients_validator()