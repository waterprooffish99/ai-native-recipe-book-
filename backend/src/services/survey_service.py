"""
Survey service for handling Kitchen Intelligence Survey operations.

This service handles survey submission, retrieval, and updates to user profiles.
"""
import uuid
from datetime import datetime
from typing import Optional
import databases
from ..models.survey import SurveyResponseCreate, SurveyResponseInDB
from ..models.user import User


class SurveyService:
    """Service class for handling survey operations."""

    def __init__(self, database: databases.Database):
        self.db = database

    async def submit_survey(self, user_id: str, survey_data: SurveyResponseCreate) -> SurveyResponseInDB:
        """Submit a new survey response and update user's onboarding status."""
        # Check if user already submitted a survey
        existing_survey = await self.get_survey_response(user_id)
        if existing_survey:
            raise ValueError("Survey already submitted for this user")

        # Create survey response in database
        survey_id = str(uuid.uuid4())
        submitted_at = datetime.utcnow()

        query = """
            INSERT INTO survey_responses (
                id, user_id, software_background, hardware_background, cooking_level,
                dietary_restrictions, preferred_voice, preferred_language, submitted_at
            ) VALUES (
                :id, :user_id, :software_background, :hardware_background, :cooking_level,
                :dietary_restrictions, :preferred_voice, :preferred_language, :submitted_at
            ) RETURNING id, user_id, software_background, hardware_background, cooking_level,
                      dietary_restrictions, preferred_voice, preferred_language, submitted_at
        """
        values = {
            "id": survey_id,
            "user_id": user_id,
            "software_background": survey_data.software_background,
            "hardware_background": survey_data.hardware_background,
            "cooking_level": survey_data.cooking_level,
            "dietary_restrictions": survey_data.dietary_restrictions,
            "preferred_voice": survey_data.preferred_voice,
            "preferred_language": survey_data.preferred_language,
            "submitted_at": submitted_at
        }

        result = await self.db.fetch_one(query=query, values=values)

        # Update user's onboarding_completed status and copy survey data to user profile
        update_user_query = """
            UPDATE users
            SET onboarding_completed = TRUE,
                software_background = :software_background,
                hardware_background = :hardware_background,
                cooking_level = :cooking_level,
                dietary_restrictions = :dietary_restrictions,
                preferred_voice = :preferred_voice,
                preferred_language = :preferred_language,
                updated_at = :updated_at
            WHERE id = :user_id
        """
        await self.db.execute(
            query=update_user_query,
            values={
                "software_background": survey_data.software_background,
                "hardware_background": survey_data.hardware_background,
                "cooking_level": survey_data.cooking_level,
                "dietary_restrictions": survey_data.dietary_restrictions,
                "preferred_voice": survey_data.preferred_voice,
                "preferred_language": survey_data.preferred_language,
                "updated_at": datetime.utcnow(),
                "user_id": user_id
            }
        )

        return SurveyResponseInDB(
            id=result["id"],
            user_id=result["user_id"],
            software_background=result["software_background"],
            hardware_background=result["hardware_background"],
            cooking_level=result["cooking_level"],
            dietary_restrictions=result["dietary_restrictions"],
            preferred_voice=result["preferred_voice"],
            preferred_language=result["preferred_language"],
            submitted_at=result["submitted_at"]
        )

    async def get_survey_response(self, user_id: str) -> Optional[SurveyResponseInDB]:
        """Get a user's survey response."""
        query = "SELECT * FROM survey_responses WHERE user_id = :user_id"
        result = await self.db.fetch_one(query=query, values={"user_id": user_id})

        if result:
            return SurveyResponseInDB(
                id=str(result["id"]),
                user_id=str(result["user_id"]),
                software_background=result["software_background"],
                hardware_background=result["hardware_background"],
                cooking_level=result["cooking_level"],
                dietary_restrictions=result["dietary_restrictions"],
                preferred_voice=result["preferred_voice"],
                preferred_language=result["preferred_language"],
                submitted_at=result["submitted_at"]
            )
        return None