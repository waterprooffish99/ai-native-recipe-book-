"""
Recipe Pydantic Models (T023-T026)
Data models for Recipe, RecipeTranslation, RecipeStep, and RecipeStepTranslation
"""
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from enum import Enum


class DifficultyLevel(str, Enum):
    """Recipe difficulty levels"""
    ABSOLUTE_BEGINNER = "Absolute Beginner"
    BEGINNER = "Beginner"
    BEGINNER_PLUS = "Beginner+"


class LanguageCode(str, Enum):
    """Supported language codes"""
    EN = "EN"
    UR = "UR"
    AR = "AR"
    ES = "ES"
    FR = "FR"
    FA = "FA"


# T025: RecipeStep Pydantic Model
class RecipeStepBase(BaseModel):
    """Base model for recipe step"""
    step_number: int = Field(..., ge=1, le=5, description="Step number (1-5)")
    instruction: str = Field(..., min_length=1, description="Single action instruction")
    audio_clip_url: Optional[str] = Field(None, description="Optional audio clip URL")
    image_url: Optional[str] = Field(None, description="Optional image URL")

    @validator('instruction')
    def validate_single_action(cls, v):
        """Ensure instruction contains only one action"""
        # Basic validation: instruction should be concise
        if len(v) > 500:
            raise ValueError("Instruction too long - should be a single action")
        return v


class RecipeStep(RecipeStepBase):
    """Recipe step with database fields"""
    step_id: UUID
    recipe_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class RecipeStepCreate(RecipeStepBase):
    """Model for creating a recipe step"""
    pass


# T026: RecipeStepTranslation Pydantic Model
class RecipeStepTranslationBase(BaseModel):
    """Base model for recipe step translation"""
    language_code: LanguageCode
    instruction: str = Field(..., min_length=1, description="Translated instruction")


class RecipeStepTranslation(RecipeStepTranslationBase):
    """Recipe step translation with database fields"""
    step_translation_id: UUID
    step_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class RecipeStepTranslationCreate(RecipeStepTranslationBase):
    """Model for creating a recipe step translation"""
    pass


# T024: RecipeTranslation Pydantic Model
class RecipeTranslationBase(BaseModel):
    """Base model for recipe translation"""
    language_code: LanguageCode
    name: str = Field(..., min_length=1, max_length=255, description="Translated recipe name")
    kitchen_guard: Optional[str] = Field(None, description="Safety tips in translated language")
    ingredients: Optional[Dict[str, Any]] = Field(None, description="Translated ingredients with quantities")


class RecipeTranslation(RecipeTranslationBase):
    """Recipe translation with database fields"""
    translation_id: UUID
    recipe_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RecipeTranslationCreate(RecipeTranslationBase):
    """Model for creating a recipe translation"""
    pass


# T023: Recipe Pydantic Model
class RecipeBase(BaseModel):
    """Base model for recipe"""
    name: str = Field(..., min_length=1, max_length=255, description="Recipe name in default language")
    origin_country: str = Field(..., min_length=1, max_length=100, description="Country of origin")
    difficulty: DifficultyLevel = Field(..., description="Recipe difficulty level")
    prep_time: Optional[int] = Field(None, ge=0, description="Preparation time in minutes")
    cook_time: Optional[int] = Field(None, ge=0, description="Cooking time in minutes")
    total_time: Optional[int] = Field(None, ge=0, description="Total time in minutes")
    servings: Optional[int] = Field(None, ge=1, description="Number of servings")


class Recipe(RecipeBase):
    """Recipe with database fields"""
    recipe_id: UUID
    created_at: datetime
    updated_at: datetime
    is_active: bool = True

    class Config:
        from_attributes = True


class RecipeCreate(RecipeBase):
    """Model for creating a recipe"""
    pass


# Composite Models for API responses
class RecipeStepWithTranslations(RecipeStep):
    """Recipe step with all translations"""
    translations: List[RecipeStepTranslation] = []


class RecipeWithTranslations(Recipe):
    """Recipe with all translations and steps"""
    translations: List[RecipeTranslation] = []
    steps: List[RecipeStepWithTranslations] = []


class RecipeDetail(BaseModel):
    """Detailed recipe information for API responses"""
    recipe_id: UUID
    name: str
    origin_country: str
    difficulty: DifficultyLevel
    prep_time: Optional[int]
    cook_time: Optional[int]
    total_time: Optional[int]
    servings: Optional[int]
    kitchen_guard: Optional[str]
    ingredients: Optional[List[Dict[str, Any]]]
    steps: List[Dict[str, Any]]
    language: LanguageCode

    class Config:
        from_attributes = True


class RecipeSummary(BaseModel):
    """Summary recipe information for listing"""
    recipe_id: UUID
    name: str
    origin_country: str
    difficulty: DifficultyLevel
    prep_time: Optional[int]
    cook_time: Optional[int]
    total_time: Optional[int]
    servings: Optional[int]
    language: LanguageCode

    class Config:
        from_attributes = True


class RecipeSearchResult(BaseModel):
    """Recipe search result with relevance score"""
    recipe: RecipeDetail
    relevance_score: float = Field(..., ge=0.0, le=1.0, description="Relevance score from vector search")
    matched_content: str = Field(..., description="Excerpt that matched the query")

    class Config:
        from_attributes = True
