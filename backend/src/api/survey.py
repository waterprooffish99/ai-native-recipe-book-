"""
Survey API endpoints.

This module implements the survey endpoints as defined in the OpenAPI specification.
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from slowapi import Limiter
from slowapi.util import get_remote_address
from jose import jwt, JWTError
import os

from ..models.survey import SurveyResponseCreate
from ..services.survey_service import SurveyService

# Initialize rate limiter for this router
limiter = Limiter(key_func=get_remote_address)

router = APIRouter()
security = HTTPBearer()


def get_survey_service(request: Request) -> SurveyService:
    """Dependency to get survey service instance from app state."""
    return SurveyService(request.app.state.db)


def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Extract user ID from JWT token."""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, os.getenv("JWT_SECRET", "your-secret-key-change-in-production"), algorithms=["HS256"])
        user_id: str = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")


@router.post("/survey", status_code=201)
@limiter.limit("5/hour")  # Limit survey submissions to 5 per hour per authenticated user
async def submit_survey(
    request: Request,  # Need to include request for rate limiting
    survey_data: SurveyResponseCreate,
    user_id: str = Depends(get_current_user_id),
    survey_service: SurveyService = Depends(get_survey_service)
):
    """
    Submit Kitchen Intelligence Survey.
    Submits the onboarding survey and marks user as onboarding_completed.
    """
    try:
        # Submit the survey
        survey_response = await survey_service.submit_survey(user_id, survey_data)

        # Return the created survey response
        return {
            "id": survey_response.id,
            "user_id": survey_response.user_id,
            "software_background": survey_response.software_background,
            "hardware_background": survey_response.hardware_background,
            "cooking_level": survey_response.cooking_level,
            "dietary_restrictions": survey_response.dietary_restrictions,
            "preferred_voice": survey_response.preferred_voice,
            "preferred_language": survey_response.preferred_language,
            "submitted_at": survey_response.submitted_at
        }
    except ValueError as e:
        # Handle validation errors (like survey already submitted)
        if "already submitted" in str(e).lower():
            raise HTTPException(
                status_code=409,
                detail={"error": "Survey already submitted for this user", "code": "SURVEY_EXISTS"}
            )
        else:
            raise HTTPException(
                status_code=400,
                detail={"error": str(e), "code": "VALIDATION_ERROR"}
            )
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(
            status_code=500,
            detail={"error": "An unexpected error occurred during survey submission", "code": "INTERNAL_ERROR"}
        )


@router.get("/survey/me")
@limiter.limit("30/minute")  # Limit survey retrieval to 30 per minute per authenticated user
async def get_user_survey(
    request: Request,  # Need to include request for rate limiting
    user_id: str = Depends(get_current_user_id),
    survey_service: SurveyService = Depends(get_survey_service)
):
    """
    Retrieve user's survey response.
    Retrieves the authenticated user's survey data.
    """
    try:
        survey_response = await survey_service.get_survey_response(user_id)

        if not survey_response:
            raise HTTPException(
                status_code=404,
                detail={"error": "Survey response not found", "code": "SURVEY_NOT_FOUND"}
            )

        # Return the survey response
        return {
            "id": survey_response.id,
            "user_id": survey_response.user_id,
            "software_background": survey_response.software_background,
            "hardware_background": survey_response.hardware_background,
            "cooking_level": survey_response.cooking_level,
            "dietary_restrictions": survey_response.dietary_restrictions,
            "preferred_voice": survey_response.preferred_voice,
            "preferred_language": survey_response.preferred_language,
            "submitted_at": survey_response.submitted_at
        }
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(
            status_code=500,
            detail={"error": "An unexpected error occurred while retrieving survey", "code": "INTERNAL_ERROR"}
        )