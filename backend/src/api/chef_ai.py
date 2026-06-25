"""Chef AI API Router (T134, T135)

Phase 9: Conversational Chef AI — API endpoints for Chat & Fridge Logic.
Defines endpoints for querying the Conversational Chef and matching inventory.
"""
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse, JSONResponse
import asyncpg
from typing import Union

from src.models.chef_ai import (
    ChefAIChatRequest,
    ChefAIChatResponse,
    FridgeLogicRequest,
    FridgeLogicResponse,
)
from src.services.chef_ai_service import ChefAIService
from src.middleware.auth import verify_clerk_token


router = APIRouter(prefix="/chef-ai", tags=["Chef AI"])


async def get_db_pool() -> asyncpg.Pool:
    """Dependency injection helper to retrieve the global asyncpg connection pool.

    Returns:
        asyncpg.Pool: The database connection pool instance for execution.
    """
    from src.main import db_pool
    return db_pool


async def get_chef_ai_service(db_pool: asyncpg.Pool = Depends(get_db_pool)) -> ChefAIService:
    """Dependency injection helper to initialize and inject ChefAIService with the active DB pool.

    Args:
        db_pool (asyncpg.Pool): The database connection pool injected from `get_db_pool`.

    Returns:
        ChefAIService: An initialized instance of ChefAIService.
    """
    return ChefAIService(db_pool)


@router.post("/chat", response_model=ChefAIChatResponse)
async def chat(
    request: ChefAIChatRequest,
    chef_ai_service: ChefAIService = Depends(get_chef_ai_service),
) -> ChefAIChatResponse:
    """Conversational chat endpoint (T134).

    Routes user queries to the RAG-assisted gpt-4o-mini completion model. 
    Implements pre-flight and post-flight verification filters to detect and intercept 
    non-Halal ingredients or unsafe food suggestions.

    Args:
        request (ChefAIChatRequest): Request payload containing session ID, user message,
            conversation history, and dietary restrictions.
        chef_ai_service (ChefAIService): Injected Chef AI service instance.

    Returns:
        ChefAIChatResponse: The AI response containing natural language reply, compliance flag,
            citations, and updated session reference.
    """
    return await chef_ai_service.chat(request)


@router.post("/fridge-logic", response_model=FridgeLogicResponse)
async def fridge_logic(
    request: FridgeLogicRequest,
    chef_ai_service: ChefAIService = Depends(get_chef_ai_service),
) -> FridgeLogicResponse:
    """Fridge-Logic matching suggestions endpoint (T135).

    Evaluates user inventory using Jaccard similarity against all active recipes,
    generating similarity-scored recipe suggestions. Excludes any recipes containing 
    Halal-violating ingredients.

    Args:
        request (FridgeLogicRequest): Request payload containing available ingredients,
            dietary restriction preferences, and result limits.
        chef_ai_service (ChefAIService): Injected Chef AI service instance.

    Returns:
        FridgeLogicResponse: List of suggestions matching user ingredients, detailed with
            which ingredients are owned and which are missing.
    """
    return await chef_ai_service.get_fridge_logic_suggestions(request)


router_v2 = APIRouter(prefix="/api/v2/chat", tags=["Chef AI V2"])


@router_v2.post("/stream", response_model=None)
async def chat_stream(
    request: ChefAIChatRequest,
    chef_ai_service: ChefAIService = Depends(get_chef_ai_service),
    current_user: dict = Depends(verify_clerk_token),
) -> Union[StreamingResponse, JSONResponse]:
    """Conversational chat endpoint with Server-Sent Events (SSE) streaming (T176, T177).

    Executes pre-flight Halal compliance filtering before initiating the stream.
    If violating ingredients are found, immediately returns HTTP 400.
    """
    # Set the user ID from the verified token payload context
    request.user_id = current_user.get("sub")

    # T177: Pre-flight check utilizing the existing deterministic blocklist filter
    violations = chef_ai_service._check_halal_compliance(request.message)
    if violations:
        return JSONResponse(
            status_code=400,
            content={
                "error": "Non-halal ingredient detected",
                "violations": violations
            }
        )

    # T176: Start FastAPI StreamingResponse using the async generator
    return StreamingResponse(
        chef_ai_service.chat_stream(request),
        media_type="text/event-stream"
    )

