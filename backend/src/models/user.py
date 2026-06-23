"""
User model for authentication and profile data.

This model represents a registered user with authentication credentials and profile data.
Based on the data model defined in the specification.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, validator
import uuid


class UserBackground(BaseModel):
    """
    Represents a user's background information for personalization.
    Based on the data model defined in the specification.
    """
    user_id: str
    software_background: Optional[str] = None
    hardware_background: Optional[str] = None
    cooking_level: Optional[str] = None
    dietary_restrictions: Optional[str] = None
    preferred_language: Optional[str] = None
    preferred_voice: Optional[str] = None


class User(BaseModel):
    """
    Represents a registered user with authentication credentials and profile data.
    """
    id: str
    email: EmailStr
    password_hash: Optional[str] = None
    oauth_provider: Optional[str] = None
    oauth_provider_id: Optional[str] = None
    name: str
    software_background: Optional[str] = None
    hardware_background: Optional[str] = None
    cooking_level: str = "Absolute Beginner"
    dietary_restrictions: Optional[str] = None
    preferred_voice: Optional[str] = None
    preferred_language: str = "en"
    recipes_mastered: int = 0
    last_recipe_viewed: Optional[str] = None  # UUID as string
    onboarding_completed: bool = False
    created_at: datetime
    last_login: Optional[datetime] = None
    updated_at: datetime

    @validator('cooking_level')
    def validate_cooking_level(cls, v):
        valid_levels = ["Absolute Beginner", "Beginner", "Beginner+"]
        if v not in valid_levels:
            raise ValueError(f'cooking_level must be one of: {", ".join(valid_levels)}')
        return v

    @validator('preferred_voice')
    def validate_preferred_voice(cls, v):
        if v is None:
            return v
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


class UserCreate(BaseModel):
    """
    Schema for creating a new user (signup).
    """
    email: EmailStr
    password: str
    name: str

    @validator('password')
    def validate_password(cls, v):
        # Password must be at least 8 characters with one number or special character
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')

        has_number = any(c.isdigit() for c in v)
        has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in v)

        if not (has_number or has_special):
            raise ValueError('Password must contain at least one number or special character')

        return v


class UserUpdate(BaseModel):
    """
    Schema for updating user preferences.
    """
    preferred_voice: Optional[str] = None
    preferred_language: Optional[str] = None
    dietary_restrictions: Optional[str] = None

    @validator('preferred_voice')
    def validate_preferred_voice(cls, v):
        if v is None:
            return v
        valid_voices = ["arlow", "silas", "hugo", "omar", "felix", "elara", "maya"]
        if v not in valid_voices:
            raise ValueError(f'preferred_voice must be one of: {", ".join(valid_voices)}')
        return v

    @validator('preferred_language')
    def validate_preferred_language(cls, v):
        if v is None:
            return v
        valid_languages = ["en", "ur", "ar", "es", "fr", "fa"]
        if v not in valid_languages:
            raise ValueError(f'preferred_language must be one of: {", ".join(valid_languages)}')
        return v


class UserLogin(BaseModel):
    """
    Schema for user login.
    """
    email: EmailStr
    password: str


class UserInDB(User):
    """
    Schema for user data as stored in the database.
    Includes the password hash for authentication.
    """
    password_hash: Optional[str] = None