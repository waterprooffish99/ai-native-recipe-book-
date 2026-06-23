"""
User Service for profile management operations.

This service handles user profile updates, voice preferences, and related operations.
"""
from typing import List, Optional
from datetime import datetime
from databases import Database

from ..models.user import User, UserUpdate, UserBackground
from ..models.voice import VoicePersonality


class UserService:
    """Service for user profile management."""

    def __init__(self, db: Database):
        """Initialize UserService with database connection."""
        self.db = db

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """
        Retrieve a user by their ID.

        Args:
            user_id: UUID string of the user

        Returns:
            User object if found, None otherwise
        """
        query = """
        SELECT id, email, password_hash, oauth_provider, oauth_provider_id,
               name, software_background, hardware_background, cooking_level,
               dietary_restrictions, preferred_voice, preferred_language,
               recipes_mastered, last_recipe_viewed, onboarding_completed,
               created_at, last_login, updated_at
        FROM users
        WHERE id = :user_id
        """
        result = await self.db.fetch_one(query=query, values={"user_id": user_id})

        if result:
            return User(**dict(result))
        return None

    async def update_voice_preference(self, user_id: str, voice_id: str) -> Optional[User]:
        """
        Update user's preferred voice personality.

        Args:
            user_id: UUID string of the user
            voice_id: Voice personality ID (e.g., "arlow", "maya")

        Returns:
            Updated User object if successful, None if user not found

        Raises:
            ValueError: If voice_id is invalid
        """
        # Validate voice_id
        valid_voices = ["arlow", "silas", "hugo", "omar", "felix", "elara", "maya"]
        if voice_id not in valid_voices:
            raise ValueError(f"Invalid voice_id. Must be one of: {', '.join(valid_voices)}")

        # Update the user's preferred voice
        query = """
        UPDATE users
        SET preferred_voice = :voice_id, updated_at = :updated_at
        WHERE id = :user_id
        RETURNING id, email, password_hash, oauth_provider, oauth_provider_id,
                  name, software_background, hardware_background, cooking_level,
                  dietary_restrictions, preferred_voice, preferred_language,
                  recipes_mastered, last_recipe_viewed, onboarding_completed,
                  created_at, last_login, updated_at
        """
        result = await self.db.fetch_one(
            query=query,
            values={
                "voice_id": voice_id,
                "user_id": user_id,
                "updated_at": datetime.utcnow()
            }
        )

        if result:
            return User(**dict(result))
        return None

    async def update_user_profile(self, user_id: str, updates: UserUpdate) -> Optional[User]:
        """
        Update user profile with multiple fields.

        Args:
            user_id: UUID string of the user
            updates: UserUpdate object with fields to update

        Returns:
            Updated User object if successful, None if user not found
        """
        # Build dynamic update query based on provided fields
        update_fields = []
        values = {"user_id": user_id, "updated_at": datetime.utcnow()}

        if updates.preferred_voice is not None:
            update_fields.append("preferred_voice = :preferred_voice")
            values["preferred_voice"] = updates.preferred_voice

        if updates.preferred_language is not None:
            update_fields.append("preferred_language = :preferred_language")
            values["preferred_language"] = updates.preferred_language

        if updates.dietary_restrictions is not None:
            update_fields.append("dietary_restrictions = :dietary_restrictions")
            values["dietary_restrictions"] = updates.dietary_restrictions

        # Always update the updated_at timestamp
        update_fields.append("updated_at = :updated_at")

        if not update_fields:
            # No fields to update, just return current user
            return await self.get_user_by_id(user_id)

        query = f"""
        UPDATE users
        SET {', '.join(update_fields)}
        WHERE id = :user_id
        RETURNING id, email, password_hash, oauth_provider, oauth_provider_id,
                  name, software_background, hardware_background, cooking_level,
                  dietary_restrictions, preferred_voice, preferred_language,
                  recipes_mastered, last_recipe_viewed, onboarding_completed,
                  created_at, last_login, updated_at
        """

        result = await self.db.fetch_one(query=query, values=values)

        if result:
            return User(**dict(result))
        return None

    async def get_all_voices(self) -> List[VoicePersonality]:
        """
        Retrieve all available voice personalities.

        Returns:
            List of VoicePersonality objects (7 total)
        """
        query = """
        SELECT id, name, gender, personality_description, audio_sample_url,
               cultural_appropriateness, created_at
        FROM voice_personalities
        ORDER BY id
        """
        results = await self.db.fetch_all(query=query)

        return [VoicePersonality(**dict(row)) for row in results]

    async def get_user_background(self, user_id: str) -> Optional[UserBackground]:
        """
        Retrieve user background information for personalization.

        Args:
            user_id: UUID string of the user

        Returns:
            UserBackground object if found, None otherwise
        """
        query = """
        SELECT id as user_id, software_background, hardware_background,
               cooking_level, dietary_restrictions, preferred_language,
               preferred_voice
        FROM users
        WHERE id = :user_id
        """
        result = await self.db.fetch_one(query=query, values={"user_id": user_id})

        if result:
            # Create UserBackground from the user record
            user_data = dict(result)
            # Rename id to user_id to match the UserBackground model
            user_data['user_id'] = user_data.pop('id')
            return UserBackground(**user_data)
        return None

    async def update_user_background(self, user_id: str, background_data: dict) -> Optional[UserBackground]:
        """
        Update user background information for personalization.

        Args:
            user_id: UUID string of the user
            background_data: Dictionary with background fields to update

        Returns:
            Updated UserBackground object if successful, None if user not found
        """
        # Build dynamic update query based on provided fields
        update_fields = []
        values = {"user_id": user_id}

        valid_fields = [
            'software_background', 'hardware_background', 'cooking_level',
            'dietary_restrictions', 'preferred_language', 'preferred_voice'
        ]

        for field in valid_fields:
            if field in background_data and background_data[field] is not None:
                update_fields.append(f"{field} = :{field}")
                values[field] = background_data[field]

        if not update_fields:
            # No fields to update, just return current background
            return await self.get_user_background(user_id)

        query = f"""
        UPDATE users
        SET {', '.join(update_fields)}, updated_at = :updated_at
        WHERE id = :user_id
        RETURNING id as user_id, software_background, hardware_background,
                  cooking_level, dietary_restrictions, preferred_language,
                  preferred_voice
        """

        values['updated_at'] = datetime.utcnow()

        result = await self.db.fetch_one(query=query, values=values)

        if result:
            # Create UserBackground from the updated user record
            user_data = dict(result)
            # Rename id to user_id to match the UserBackground model
            user_data['user_id'] = user_data.pop('user_id')
            return UserBackground(**user_data)
        return None
