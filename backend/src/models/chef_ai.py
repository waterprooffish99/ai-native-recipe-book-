"""
Chef AI Pydantic Models (T128)
Phase 9: Conversational Chef AI — request/response schemas, session context, citations
Architectural decisions:
  - Model: gpt-4o-mini
  - Halal filter: blocklist-first, deterministic
  - Session storage: Neon Postgres (chef_ai_sessions table)
  - i18n: English-only AI responses for MVP
"""
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from uuid import UUID, uuid4
from datetime import datetime
from enum import Enum


class DietaryRestriction(str, Enum):
    """Supported dietary restriction flags for Halal compliance filter."""
    HALAL = "halal"
    VEGETARIAN = "vegetarian"
    VEGAN = "vegan"
    GLUTEN_FREE = "gluten_free"
    DAIRY_FREE = "dairy_free"
    NUT_FREE = "nut_free"


class ChefAICitation(BaseModel):
    """Food safety citation attached to Chef AI responses (T139)."""
    text: str = Field(..., description="Source or authority label, e.g. 'USDA Food Safety'")
    url: Optional[str] = Field(None, description="Optional URL to the cited resource")


class ChefAIMessage(BaseModel):
    """A single turn in the Chef AI conversation history."""
    role: str = Field(..., description="'user' or 'assistant'")
    content: str = Field(..., min_length=1, description="Message text")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ChefAIChatRequest(BaseModel):
    """
    POST /chef-ai/chat — Request payload.
    Routes conversational query to Chef AI with optional recipe context.
    """
    session_id: Optional[UUID] = Field(
        default_factory=uuid4,
        description="Session UUID for conversation continuity. Auto-generated if not provided."
    )
    user_id: Optional[str] = Field(
        None,
        description="Optional user ID for authenticated session linking."
    )

    message: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="User's natural language query to Chef AI."
    )
    recipe_context_id: Optional[UUID] = Field(
        None,
        description="Optional recipe UUID to scope Chef AI responses to a specific recipe."
    )
    dietary_restrictions: List[DietaryRestriction] = Field(
        default_factory=list,
        description="List of dietary restrictions to enforce (always includes Halal blocklist)."
    )
    conversation_history: List[ChefAIMessage] = Field(
        default_factory=list,
        description="Prior turns in this session for context window. Max 10 turns kept."
    )

    @validator("conversation_history")
    def limit_history(cls, v):
        """Keep only the most recent 10 turns to avoid exceeding context window."""
        return v[-10:] if len(v) > 10 else v


class ChefAIChatResponse(BaseModel):
    """
    POST /chef-ai/chat — Response payload.
    Returns Chef AI reply with Halal compliance flag and optional citations.
    """
    session_id: UUID = Field(..., description="Session UUID for client to persist.")
    reply: str = Field(..., description="Chef AI natural language response.")
    is_halal_compliant: bool = Field(
        ...,
        description="True if response passed Halal blocklist filter."
    )
    citations: List[ChefAICitation] = Field(
        default_factory=list,
        description="Food safety or authority citations attached to this response."
    )
    suggested_recipe_ids: List[UUID] = Field(
        default_factory=list,
        description="Optional list of recipe UUIDs the AI is referencing."
    )
    tokens_used: Optional[int] = Field(
        None,
        description="OpenAI token usage for monitoring (gpt-4o-mini)."
    )


class FridgeIngredient(BaseModel):
    """A single ingredient in the user's fridge inventory."""
    name: str = Field(..., min_length=1, description="Ingredient name, e.g. 'chicken breast'")
    quantity: Optional[str] = Field(None, description="Optional quantity, e.g. '500g', '2 cups'")


class FridgeLogicRequest(BaseModel):
    """
    POST /chef-ai/fridge-logic — Request payload.
    Suggests matching recipes from available ingredients.
    """
    user_id: Optional[UUID] = Field(None, description="Optional user UUID.")
    available_ingredients: List[FridgeIngredient] = Field(
        ...,
        min_items=1,
        description="List of ingredients the user currently has available."
    )
    dietary_restrictions: List[DietaryRestriction] = Field(
        default_factory=list,
        description="Dietary restrictions to apply when filtering suggestions."
    )
    max_results: int = Field(
        default=3,
        ge=1,
        le=10,
        description="Maximum number of recipe suggestions to return."
    )


class RecipeSuggestion(BaseModel):
    """A single recipe suggestion from fridge-logic matching."""
    recipe_id: UUID
    name: str
    origin_country: str
    difficulty: str
    match_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Relevance score based on ingredient overlap (0.0 - 1.0)."
    )
    matched_ingredients: List[str] = Field(
        default_factory=list,
        description="Ingredients the user has that match this recipe."
    )
    missing_ingredients: List[str] = Field(
        default_factory=list,
        description="Ingredients needed that the user doesn't have."
    )


class FridgeLogicResponse(BaseModel):
    """
    POST /chef-ai/fridge-logic — Response payload.
    Returns ranked recipe suggestions based on available ingredients.
    """
    suggestions: List[RecipeSuggestion] = Field(
        default_factory=list,
        description="Ranked list of recipe suggestions."
    )
    total_recipes_checked: int = Field(
        ...,
        description="How many recipes were evaluated in the matching process."
    )


class ChefAISession(BaseModel):
    """
    DB-persisted Chef AI session (maps to chef_ai_sessions table).
    Stores conversation history and user inventory for cross-request continuity.
    """
    session_id: UUID = Field(default_factory=uuid4)
    user_id: Optional[str] = None
    conversation_history: List[ChefAIMessage] = Field(default_factory=list)
    user_inventory: List[FridgeIngredient] = Field(default_factory=list)
    dietary_restrictions: List[DietaryRestriction] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True
