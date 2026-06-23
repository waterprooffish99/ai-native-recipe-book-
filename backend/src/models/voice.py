"""
Voice Personality model for AI voice companion selection.

This model represents the 7 available AI voice personalities.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class VoicePersonality(BaseModel):
    """
    Represents an AI voice personality available for selection.
    This is reference data, not user-specific.
    """
    id: str  # Voice ID: "arlow", "silas", "hugo", "omar", "felix", "elara", "maya"
    name: str  # Display name (e.g., "Arlow")
    gender: str  # "Male" or "Female"
    personality_description: str  # Short description
    audio_sample_url: str  # CDN URL to 3-second audio sample
    cultural_appropriateness: Optional[str] = None  # Cultural suitability notes
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
