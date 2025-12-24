"""
Users API endpoints.

This module implements the user profile and voice personality endpoints.
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List

from ..models.user import User, UserUpdate
from ..models.voice import VoicePersonality
from ..services.user_service import UserService
from ..services.auth_service import AuthService
from ..services.recipe_service import RecipeService

router = APIRouter()
security = HTTPBearer()


def get_user_service(request: Request) -> UserService:
    """Dependency to get user service instance from app state."""
    return UserService(request.app.state.db)


def get_auth_service(request: Request) -> AuthService:
    """Dependency to get auth service instance from app state."""
    return AuthService(request.app.state.db)


def get_recipe_service(request: Request) -> RecipeService:
    """Dependency to get recipe service instance from app state."""
    return RecipeService(request.app.state.db)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthService = Depends(get_auth_service),
    user_service: UserService = Depends(get_user_service)
) -> User:
    """
    Dependency to get the current authenticated user from JWT token.

    Args:
        credentials: Bearer token from Authorization header
        auth_service: Auth service instance
        user_service: User service instance

    Returns:
        User object for the authenticated user

    Raises:
        HTTPException: If token is invalid or user not found
    """
    token = credentials.credentials

    # Verify token and get user_id
    payload = auth_service.verify_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=401,
            detail={"error": "Invalid or expired token", "code": "INVALID_TOKEN"}
        )

    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=401,
            detail={"error": "Invalid token payload", "code": "INVALID_TOKEN"}
        )

    # Get user from database
    user = await user_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail={"error": "User not found", "code": "USER_NOT_FOUND"}
        )

    return user


@router.get("/voices", response_model=List[VoicePersonality])
async def get_voices(
    user_service: UserService = Depends(get_user_service)
):
    """
    List all voice personalities.

    Retrieves all 7 available AI voice personalities with metadata.
    This endpoint does not require authentication.

    Returns:
        List of VoicePersonality objects
    """
    try:
        voices = await user_service.get_all_voices()
        return voices
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"error": "Failed to retrieve voice personalities", "code": "INTERNAL_ERROR"}
        )


@router.get("/me", response_model=dict)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    recipe_service: RecipeService = Depends(get_recipe_service)
):
    """
    Get current user profile.

    Retrieves the authenticated user's profile data.
    Requires Bearer token authentication.

    Returns:
        User profile object with recipe statistics
    """
    total_beginner_recipes = await recipe_service.get_total_beginner_recipes()

    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "software_background": current_user.software_background,
        "hardware_background": current_user.hardware_background,
        "cooking_level": current_user.cooking_level,
        "dietary_restrictions": current_user.dietary_restrictions,
        "preferred_voice": current_user.preferred_voice,
        "preferred_language": current_user.preferred_language,
        "recipes_mastered": current_user.recipes_mastered,
        "total_beginner_recipes": total_beginner_recipes,
        "onboarding_completed": current_user.onboarding_completed,
        "created_at": current_user.created_at,
        "last_login": current_user.last_login,
        "updated_at": current_user.updated_at
    }


@router.patch("/me", response_model=dict)
async def update_current_user_profile(
    updates: UserUpdate,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service)
):
    """
    Update current user profile.

    Updates user preferences (voice, language, dietary restrictions).
    Requires Bearer token authentication.

    Args:
        updates: UserUpdate object with fields to update

    Returns:
        Updated user profile object
    """
    try:
        updated_user = await user_service.update_user_profile(current_user.id, updates)

        if not updated_user:
            raise HTTPException(
                status_code=404,
                detail={"error": "User not found", "code": "USER_NOT_FOUND"}
            )

        return {
            "id": updated_user.id,
            "email": updated_user.email,
            "name": updated_user.name,
            "software_background": updated_user.software_background,
            "hardware_background": updated_user.hardware_background,
            "cooking_level": updated_user.cooking_level,
            "dietary_restrictions": updated_user.dietary_restrictions,
            "preferred_voice": updated_user.preferred_voice,
            "preferred_language": updated_user.preferred_language,
            "recipes_mastered": updated_user.recipes_mastered,
            "onboarding_completed": updated_user.onboarding_completed,
            "created_at": updated_user.created_at,
            "last_login": updated_user.last_login,
            "updated_at": updated_user.updated_at
        }
    except ValueError as e:
        # Handle validation errors
        raise HTTPException(
            status_code=400,
            detail={"error": str(e), "code": "VALIDATION_ERROR"}
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"error": "An unexpected error occurred during profile update", "code": "INTERNAL_ERROR"}
        )
