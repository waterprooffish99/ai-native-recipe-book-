"""
Metaphor model for personalization engine.

This model represents metaphor mappings for personalized cooking experiences.
Based on the data model defined in the specification.
"""
from typing import Optional
from pydantic import BaseModel
import uuid


class MetaphorMapping(BaseModel):
    """
    Represents a metaphor mapping for personalized cooking experiences.
    Based on the data model defined in the specification.
    """
    mapping_id: str = str(uuid.uuid4())
    background_type: str  # e.g., 'software', 'hardware', 'cooking'
    background_level: str  # e.g., 'beginner', 'intermediate', 'expert'
    context: str  # e.g., 'recipe_explanation', 'safety_tips', 'welcome_message'
    metaphor_template: str  # Template with placeholders for personalization
    is_active: bool = True