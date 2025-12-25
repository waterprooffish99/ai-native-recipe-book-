"""
RAG Service (T034, T037, T038)
Handles recipe embedding generation, vector search, and context retrieval for LLM
"""
from typing import List, Dict, Any, Optional
from uuid import UUID
import asyncpg
from openai import AsyncOpenAI
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue
from src.config import (
    OPENAI_API_KEY, OPENAI_EMBEDDING_MODEL,
    QDRANT_URL, QDRANT_API_KEY, QDRANT_COLLECTION_NAME,
    QDRANT_VECTOR_SIZE, RAG_SEARCH_LIMIT, RAG_SCORE_THRESHOLD
)
from src.models.recipe import RecipeSearchResult, RecipeDetail, LanguageCode
from src.services.recipe_service import RecipeService
from src.utils.logger import get_logger

logger = get_logger(__name__)


class RAGService:
    """Service for RAG (Retrieval-Augmented Generation) operations"""

    def __init__(self, db_pool: asyncpg.Pool):
        self.db_pool = db_pool
        self.openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)
        self.qdrant_client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
        self.recipe_service = RecipeService(db_pool)

    async def generate_recipe_embedding(
        self,
        recipe_id: UUID,
        language: LanguageCode = LanguageCode.EN
    ) -> List[float]:
        """
        T034: Generate embedding for a recipe using OpenAI embeddings API

        Args:
            recipe_id: Recipe UUID
            language: Language code for content

        Returns:
            List of floats representing the embedding vector
        """
        # Get recipe details
        recipe = await self.recipe_service.get_recipe_by_id(recipe_id, language)
        if not recipe:
            raise ValueError(f"Recipe {recipe_id} not found")

        # Create comprehensive text for embedding
        # Include: name, origin, difficulty, ingredients, steps, kitchen guard
        ingredients_text = ", ".join([
            ing.get("name", "") for ing in recipe.ingredients if isinstance(ing, dict)
        ]) if recipe.ingredients else ""

        steps_text = " ".join([
            f"Step {step['step_number']}: {step['instruction']}"
            for step in recipe.steps
        ])

        embedding_text = f"""
        Recipe: {recipe.name}
        Origin: {recipe.origin_country}
        Difficulty: {recipe.difficulty.value}
        Preparation Time: {recipe.prep_time} minutes
        Cooking Time: {recipe.cook_time} minutes
        Ingredients: {ingredients_text}
        Instructions: {steps_text}
        Safety Tips: {recipe.kitchen_guard or 'None'}
        """.strip()

        logger.info(f"Generating embedding for recipe {recipe_id} ({recipe.name})")

        # Generate embedding using OpenAI
        response = await self.openai_client.embeddings.create(
            model=OPENAI_EMBEDDING_MODEL,
            input=embedding_text
        )

        embedding = response.data[0].embedding
        logger.info(f"✓ Generated embedding with {len(embedding)} dimensions")

        return embedding

    async def store_recipe_embedding(
        self,
        recipe_id: UUID,
        embedding: List[float],
        metadata: Dict[str, Any]
    ) -> None:
        """
        Store recipe embedding in Qdrant vector database

        Args:
            recipe_id: Recipe UUID
            embedding: Embedding vector
            metadata: Recipe metadata for filtering
        """
        point = PointStruct(
            id=str(recipe_id),
            vector=embedding,
            payload=metadata
        )

        self.qdrant_client.upsert(
            collection_name=QDRANT_COLLECTION_NAME,
            points=[point]
        )

        logger.info(f"✓ Stored embedding for recipe {recipe_id} in Qdrant")

    async def search_recipes(
        self,
        query: str,
        language: LanguageCode = LanguageCode.EN,
        difficulty: Optional[str] = None,
        limit: int = RAG_SEARCH_LIMIT
    ) -> List[RecipeSearchResult]:
        """
        T037: RAG search functionality - vector search in Qdrant with relevance scoring

        Args:
            query: Natural language search query
            language: Language code for results
            difficulty: Optional difficulty filter
            limit: Maximum number of results

        Returns:
            List of RecipeSearchResult with relevance scores
        """
        logger.info(f"RAG search query: '{query}' (language: {language.value})")

        # Generate query embedding
        response = await self.openai_client.embeddings.create(
            model=OPENAI_EMBEDDING_MODEL,
            input=query
        )
        query_embedding = response.data[0].embedding

        # Build Qdrant filter
        search_filter = None
        if difficulty:
            search_filter = Filter(
                must=[
                    FieldCondition(
                        key="difficulty",
                        match=MatchValue(value=difficulty)
                    )
                ]
            )

        # Perform vector search
        search_results = self.qdrant_client.search(
            collection_name=QDRANT_COLLECTION_NAME,
            query_vector=query_embedding,
            limit=limit,
            score_threshold=RAG_SCORE_THRESHOLD,
            query_filter=search_filter
        )

        logger.info(f"✓ Found {len(search_results)} recipes matching query")

        # Convert to RecipeSearchResult
        results = []
        for result in search_results:
            recipe_id = UUID(result.id)
            score = result.score

            # Get full recipe details
            recipe = await self.recipe_service.get_recipe_by_id(recipe_id, language)
            if not recipe:
                continue

            # Extract matched content (first step as excerpt)
            matched_content = recipe.steps[0]["instruction"] if recipe.steps else ""

            results.append(
                RecipeSearchResult(
                    recipe=recipe,
                    relevance_score=score,
                    matched_content=matched_content
                )
            )

        return results

    async def get_rag_context(
        self,
        query: str,
        language: LanguageCode = LanguageCode.EN,
        max_recipes: int = 3
    ) -> str:
        """
        T038: RAG context retrieval - fetch relevant recipe content for LLM

        Args:
            query: User's natural language query
            language: Language for content
            max_recipes: Maximum recipes to include in context

        Returns:
            Formatted context string for LLM
        """
        # Search for relevant recipes
        search_results = await self.search_recipes(
            query=query,
            language=language,
            limit=max_recipes
        )

        if not search_results:
            return "No relevant recipes found for your query."

        # Format context for LLM
        context_parts = []
        context_parts.append(f"Found {len(search_results)} relevant recipes:\n")

        for idx, result in enumerate(search_results, 1):
            recipe = result.recipe
            context_parts.append(f"\n--- Recipe {idx}: {recipe.name} ({recipe.origin_country}) ---")
            context_parts.append(f"Difficulty: {recipe.difficulty.value}")
            context_parts.append(f"Time: {recipe.total_time} minutes (Prep: {recipe.prep_time}, Cook: {recipe.cook_time})")
            context_parts.append(f"Servings: {recipe.servings}")

            # Add safety tip
            if recipe.kitchen_guard:
                context_parts.append(f"⚠️ Safety: {recipe.kitchen_guard}")

            # Add ingredients
            if recipe.ingredients:
                context_parts.append("\nIngredients:")
                for ing in recipe.ingredients[:5]:  # Limit to 5 ingredients
                    if isinstance(ing, dict):
                        context_parts.append(f"  • {ing.get('name', 'Unknown')}: {ing.get('quantity', '')}")

            # Add steps
            context_parts.append("\nInstructions:")
            for step in recipe.steps:
                context_parts.append(f"  {step['step_number']}. {step['instruction']}")

            context_parts.append(f"\nRelevance Score: {result.relevance_score:.2f}")

        return "\n".join(context_parts)

    async def generate_all_embeddings(self, language: LanguageCode = LanguageCode.EN) -> int:
        """
        Generate and store embeddings for all active recipes

        Args:
            language: Language code for embeddings

        Returns:
            Number of recipes processed
        """
        # Get all recipes
        recipes = await self.recipe_service.list_recipes(
            language=language,
            limit=1000  # Get all recipes
        )

        logger.info(f"Generating embeddings for {len(recipes)} recipes...")

        count = 0
        for recipe_summary in recipes:
            try:
                # Generate embedding
                embedding = await self.generate_recipe_embedding(
                    recipe_summary.recipe_id,
                    language
                )

                # Prepare metadata
                metadata = {
                    "name": recipe_summary.name,
                    "origin_country": recipe_summary.origin_country,
                    "difficulty": recipe_summary.difficulty.value,
                    "prep_time": recipe_summary.prep_time,
                    "cook_time": recipe_summary.cook_time,
                    "language": language.value
                }

                # Store in Qdrant
                await self.store_recipe_embedding(
                    recipe_summary.recipe_id,
                    embedding,
                    metadata
                )

                count += 1
                logger.info(f"✓ Processed {count}/{len(recipes)}: {recipe_summary.name}")

            except Exception as e:
                logger.error(f"✗ Failed to process recipe {recipe_summary.recipe_id}: {e}")

        logger.info(f"✅ Successfully generated embeddings for {count} recipes")
        return count
