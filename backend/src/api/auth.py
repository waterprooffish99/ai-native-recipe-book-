"""
Authentication API endpoints.

This module implements the authentication endpoints as defined in the OpenAPI specification.
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import uuid
from datetime import datetime
from typing import Optional

from ..models.user import UserCreate, User, UserLogin
from ..services.auth_service import AuthService
from ..models.session import SessionInDB

router = APIRouter()
security = HTTPBearer()


def get_auth_service(request: Request) -> AuthService:
    """Dependency to get auth service instance from app state."""
    return AuthService(request.app.state.db)


@router.post("/signup", response_model=dict, status_code=201)
async def signup(
    user_data: UserCreate,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Sign up with email and password.
    Creates a new user account with email/password credentials.
    """
    try:
        # Create the user
        user = await auth_service.create_user(user_data)

        # Create JWT token
        token = auth_service.create_access_token(data={"user_id": user.id, "email": user.email})

        # Create session
        session = await auth_service.create_session(user_id=user.id, token=token)

        # Return auth response
        return {
            "token": token,
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "cooking_level": user.cooking_level,
                "preferred_language": user.preferred_language,
                "onboarding_completed": user.onboarding_completed,
                "recipes_mastered": user.recipes_mastered,
                "created_at": user.created_at,
                "last_login": user.last_login,
                "updated_at": user.updated_at
            }
        }
    except ValueError as e:
        # Handle validation errors (like email already exists, weak password)
        if "Email already registered" in str(e):
            raise HTTPException(
                status_code=409,
                detail={"error": "Email already registered. Please login instead.", "code": "EMAIL_EXISTS"}
            )
        else:
            # Handle other validation errors (like weak password)
            raise HTTPException(
                status_code=400,
                detail={"error": str(e), "code": "VALIDATION_ERROR"}
            )
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(
            status_code=500,
            detail={"error": "An unexpected error occurred during signup", "code": "INTERNAL_ERROR"}
        )


@router.post("/login", response_model=dict)
async def login(
    user_data: UserLogin,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Log in with email and password.
    Authenticates a user with email/password credentials.
    """
    user = await auth_service.authenticate_user(user_data.email, user_data.password)

    if not user:
        raise HTTPException(
            status_code=401,
            detail={"error": "Invalid email or password", "code": "INVALID_CREDENTIALS"}
        )

    # Create JWT token
    token = auth_service.create_access_token(data={"user_id": user.id, "email": user.email})

    # Create session
    session = await auth_service.create_session(user_id=user.id, token=token)

    # Return auth response
    return {
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "software_background": user.software_background,
            "hardware_background": user.hardware_background,
            "cooking_level": user.cooking_level,
            "dietary_restrictions": user.dietary_restrictions,
            "preferred_voice": user.preferred_voice,
            "preferred_language": user.preferred_language,
            "recipes_mastered": user.recipes_mastered,
            "onboarding_completed": user.onboarding_completed,
            "created_at": user.created_at,
            "last_login": user.last_login,
            "updated_at": user.updated_at
        }
    }


@router.get("/google")
async def google_oauth_init(
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Initiate Google OAuth flow.
    Redirects user to Google OAuth consent screen.
    """
    # Generate a random state parameter for CSRF protection
    state = str(uuid.uuid4())

    # Get the Google auth URL
    auth_url = auth_service.get_google_auth_url(state)

    # Return the URL for frontend to redirect
    return {"auth_url": auth_url, "state": state}


@router.get("/google/callback")
async def google_oauth_callback(
    code: str,
    state: str,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Google OAuth callback handler.
    Handles OAuth callback from Google and creates/logs in user.
    """
    if not code or not state:
        raise HTTPException(
            status_code=400,
            detail={"error": "Missing code or state parameter", "code": "MISSING_PARAMS"}
        )

    try:
        # Handle the Google OAuth callback
        user, token = await auth_service.handle_google_oauth_callback(code)

        # Return auth response
        return {
            "token": token,
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "software_background": user.software_background,
                "hardware_background": user.hardware_background,
                "cooking_level": user.cooking_level,
                "dietary_restrictions": user.dietary_restrictions,
                "preferred_voice": user.preferred_voice,
                "preferred_language": user.preferred_language,
                "recipes_mastered": user.recipes_mastered,
                "onboarding_completed": user.onboarding_completed,
                "created_at": user.created_at,
                "last_login": user.last_login,
                "updated_at": user.updated_at
            }
        }
    except ValueError as e:
        raise HTTPException(
            status_code=401,
            detail={"error": str(e), "code": "OAUTH_ERROR"}
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"error": "An unexpected error occurred during OAuth", "code": "INTERNAL_ERROR"}
        )


@router.post("/logout", status_code=204)
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Log out current user.
    Invalidates the current user session.
    """
    token = credentials.credentials

    # Logout the user (invalidate session)
    success = await auth_service.logout_user(token)

    if not success:
        raise HTTPException(
            status_code=401,
            detail={"error": "Invalid or expired token", "code": "INVALID_TOKEN"}
        )

    # Return 204 No Content on successful logout
    return