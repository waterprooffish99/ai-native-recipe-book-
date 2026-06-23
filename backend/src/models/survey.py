"""
Survey Response model for the Kitchen Intelligence Survey.

This model represents the completed survey data as defined in the data model.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, validator
import uuid


class SurveyResponse(BaseModel):
    """
    Represents the completed Kitchen Intelligence Survey data (one-to-one with User).
    """
    id: str
    user_id: str  # UUID as string
    software_background: Optional[str] = None
    hardware_background: Optional[str] = None
    cooking_level: str
    dietary_restrictions: Optional[str] = None
    preferred_voice: str
    preferred_language: str
    submitted_at: datetime

    @validator('cooking_level')
    def validate_cooking_level(cls, v):
        valid_levels = ["Absolute Beginner", "Beginner", "Beginner+"]
        if v not in valid_levels:
            raise ValueError(f'cooking_level must be one of: {", ".join(valid_levels)}')
        return v

    @validator('preferred_voice')
    def validate_preferred_voice(cls, v):
        valid_voices = ["arlow", "silas", "hugo", "omar", "felix", "elara", "maya"]
        if v not in valid_voices:
            raise ValueError(f'preferred_voice must be one of: {", ".join(valid_voices)}')
        return v

    @validator('preferred_language')
    def validate_preferred_language(cls, v):
        valid_languages = ["en", "ur", "ar", "es", "fr", "fa"]
        if v not in valid_languages:
            raise ValueError(f'preferred_language must be one of: {", ".join(valid_languages)}')
        return v


class SurveyResponseCreate(BaseModel):
    """
    Schema for creating a new survey response.
    """
    software_background: Optional[str] = None
    hardware_background: Optional[str] = None
    cooking_level: str
    dietary_restrictions: Optional[str] = None
    preferred_voice: str
    preferred_language: str

    @validator('cooking_level')
    def validate_cooking_level(cls, v):
        valid_levels = ["Absolute Beginner", "Beginner", "Beginner+"]
        if v not in valid_levels:
            raise ValueError(f'cooking_level must be one of: {", ".join(valid_levels)}')
        return v

    @validator('preferred_voice')
    def validate_preferred_voice(cls, v):
        valid_voices = ["arlow", "silas", "hugo", "omar", "felix", "elara", "maya"]
        if v not in valid_voices:
            raise ValueError(f'preferred_voice must be one of: {", ".join(valid_voices)}')
        return v

    @validator('preferred_language')
    def validate_preferred_language(cls, v):
        valid_languages = ["en", "ur", "ar", "es", "fr", "fa"]
        if v not in valid_languages:
            raise ValueError(f'preferred_language must be one of: {", ".join(valid_languages)}')
        return v


class SurveyResponseInDB(SurveyResponse):
    """
    Schema for survey response data as stored in the database.
    """
    pass