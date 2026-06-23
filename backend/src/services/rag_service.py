"""
RAG Service (T034, T037, T038, T130)
Handles recipe embedding generation, vector search, context retrieval for LLM,
and Chef AI system prompt construction (Phase 9).
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
from src.models.chef_ai import FridgeIngredient, DietaryRestriction
from src.services.recipe_service import RecipeService
from src.utils.logger import get_logger

logger = get_logger(__name__)


class RAGService:
    """Service for RAG (Retrieval-Augmented Generation) operations"""
    _in_memory_client = None
    _in_memory_seeded = False
    _remote_failed = False

    def __init__(self, db_pool: asyncpg.Pool):
        self.db_pool = db_pool
        self.openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)
        clean_url = QDRANT_URL.strip().rstrip('/')
        self.qdrant_client = QdrantClient(
            url=clean_url,
            api_key=QDRANT_API_KEY,
            prefer_grpc=False
        )
        self.recipe_service = RecipeService(db_pool)

    def _get_in_memory_client(self):
        if RAGService._in_memory_client is None:
            logger.info("Initializing in-memory Qdrant client fallback")
            RAGService._in_memory_client = QdrantClient(":memory:")
            # Create collection
            RAGService._in_memory_client.recreate_collection(
                collection_name=QDRANT_COLLECTION_NAME,
                vectors_config=VectorParams(
                    size=QDRANT_VECTOR_SIZE,
                    distance=Distance.COSINE
                )
            )
        return RAGService._in_memory_client

    async def _seed_in_memory_if_needed(self):
        if not RAGService._in_memory_seeded:
            logger.info("Seeding in-memory Qdrant client fallback with recipe embeddings")
            client = self._get_in_memory_client()
            try:
                recipes = await self.recipe_service.list_recipes(language=LanguageCode.EN, limit=100)
                for recipe_summary in recipes:
                    try:
                        emb = await self.generate_recipe_embedding(recipe_summary.recipe_id, LanguageCode.EN)
                        point = PointStruct(
                            id=str(recipe_summary.recipe_id),
                            vector=emb,
                            payload={
                                "name": recipe_summary.name,
                                "origin_country": recipe_summary.origin_country,
                                "difficulty": recipe_summary.difficulty.value,
                                "prep_time": recipe_summary.prep_time,
                                "cook_time": recipe_summary.cook_time,
                                "language": "EN"
                            }
                        )
                        client.upsert(collection_name=QDRANT_COLLECTION_NAME, points=[point])
                    except Exception as e:
                        logger.error(f"Failed to seed recipe {recipe_summary.recipe_id} in-memory: {e}")
                RAGService._in_memory_seeded = True
                logger.info("Successfully seeded in-memory Qdrant client")
            except Exception as e:
                logger.error(f"Failed to list recipes for seeding: {e}")

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

        try:
            self.qdrant_client.upsert(
                collection_name=QDRANT_COLLECTION_NAME,
                points=[point]
            )
            logger.info(f"✓ Stored embedding for recipe {recipe_id} in remote Qdrant")
        except Exception as e:
            logger.warning(f"Failed to store embedding in remote Qdrant, falling back to in-memory: {e}")
            client = self._get_in_memory_client()
            client.upsert(
                collection_name=QDRANT_COLLECTION_NAME,
                points=[point]
            )
            logger.info(f"✓ Stored embedding for recipe {recipe_id} in-memory Qdrant")

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
        use_fallback = RAGService._remote_failed
        search_results = []
        if not use_fallback:
            try:
                search_response = self.qdrant_client.query_points(
                    collection_name=QDRANT_COLLECTION_NAME,
                    query=query_embedding,
                    limit=limit,
                    score_threshold=RAG_SCORE_THRESHOLD,
                    query_filter=search_filter
                )
                search_results = search_response.points
            except Exception as e:
                logger.warning(f"Remote Qdrant search failed, falling back to in-memory: {e}")
                RAGService._remote_failed = True
                use_fallback = True

        if use_fallback:
            await self._seed_in_memory_if_needed()
            fallback_client = self._get_in_memory_client()
            search_response = fallback_client.query_points(
                collection_name=QDRANT_COLLECTION_NAME,
                query=query_embedding,
                limit=limit,
                score_threshold=RAG_SCORE_THRESHOLD,
                query_filter=search_filter
            )
            search_results = search_response.points

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

    # ─── Phase 9: Chef AI System Prompt Builder (T130) ─────────────────────

    def build_chef_ai_system_prompt(
        self,
        user_inventory: Optional[List[FridgeIngredient]] = None,
        dietary_restrictions: Optional[List[DietaryRestriction]] = None,
        recipe_context: Optional[str] = None,
    ) -> str:
        """
        T130: Build a structured system prompt for Chef AI conversations.

        Dynamically injects:
          - User's fridge inventory (for fridge-logic queries)
          - Dietary restrictions (Halal compliance mandate)
          - Retrieved RAG recipe context (from Qdrant vector search)
          - Substitution guidelines

        Args:
            user_inventory: List of FridgeIngredient items the user has available.
            dietary_restrictions: List of DietaryRestriction enums to enforce.
            recipe_context: Pre-fetched RAG context string (from get_chef_ai_rag_context).

        Returns:
            Formatted system prompt string ready for OpenAI chat completion.
        """
        sections = []

        # ── Core identity ────────────────────────────────────────────────────
        sections.append(
            "You are Chef AI — the expert cooking assistant for Global Plate, "
            "a multilingual recipe platform. You help users with ingredient substitutions, "
            "recipe suggestions from available ingredients, and cooking guidance. "
            "You respond in clear, friendly, beginner-accessible English. "
            "Keep responses concise (max 150 words) and always provide actionable advice."
        )

        # ── Halal compliance mandate (always present, non-negotiable) ────────
        halal_block = (
            "\n## HALAL COMPLIANCE — MANDATORY\n"
            "You MUST NEVER suggest, recommend, or reference the following ingredients "
            "or their derivatives under any circumstances: pork, ham, bacon, lard, prosciutto, "
            "pancetta, chorizo, salami, pepperoni, wine, beer, alcohol, vodka, rum, whiskey, "
            "brandy, sake, mirin, sherry, port, wine vinegar, red wine vinegar, "
            "white wine vinegar, pork gelatin. "
            "If a user asks about a haram ingredient, immediately redirect to a Halal-certified "
            "alternative. Do not apologize excessively — simply provide the best Halal substitute."
        )
        sections.append(halal_block)

        # ── Additional dietary restrictions ──────────────────────────────────
        if dietary_restrictions:
            restriction_labels = [r.value for r in dietary_restrictions if r != DietaryRestriction.HALAL]
            if restriction_labels:
                sections.append(
                    f"\n## ADDITIONAL DIETARY REQUIREMENTS\n"
                    f"The user also requires: {', '.join(restriction_labels)}. "
                    f"Ensure all suggestions comply with these restrictions."
                )

        # ── Substitution guidance ────────────────────────────────────────────
        sections.append(
            "\n## SUBSTITUTION GUIDANCE\n"
            "When providing substitutions, always specify:\n"
            "1. The substitute ingredient name\n"
            "2. The ratio (e.g., '1:1', '3/4 cup per 1 cup')\n"
            "3. A brief practical note on how it affects the dish\n"
            "Prefer Halal-certified, widely available ingredients."
        )

        # ── User's fridge inventory (conditional) ────────────────────────────
        if user_inventory:
            inventory_lines = []
            for item in user_inventory:
                qty = f" ({item.quantity})" if item.quantity else ""
                inventory_lines.append(f"  • {item.name}{qty}")
            sections.append(
                f"\n## USER'S AVAILABLE INGREDIENTS (FRIDGE/PANTRY)\n"
                f"The user currently has these ingredients:\n"
                + "\n".join(inventory_lines)
                + "\nPrioritize recipe suggestions and substitutions that use these ingredients."
            )

        # ── RAG recipe context (conditional) ─────────────────────────────────
        if recipe_context and recipe_context.strip():
            sections.append(
                f"\n## RECIPE KNOWLEDGE BASE (from Global Plate database)\n"
                f"{recipe_context}\n"
                f"Use this data to answer questions accurately. "
                f"If the user's question cannot be answered from this context, "
                f"draw on your culinary knowledge but flag it as general guidance."
            )

        # ── Response format rules ────────────────────────────────────────────
        sections.append(
            "\n## RESPONSE RULES\n"
            "- If you are unsure, say so and offer your best culinary judgment\n"
            "- Never fabricate recipe data not present in the knowledge base\n"
            "- For food safety claims, cite the principle (e.g., 'USDA recommends')\n"
            "- Never produce content that conflicts with Halal compliance above"
        )

        return "\n".join(sections)

    async def get_chef_ai_rag_context(
        self,
        query: str,
        language: LanguageCode = LanguageCode.EN,
        recipe_context_id: Optional[UUID] = None,
        max_recipes: int = 2,
    ) -> str:
        """
        T130: Retrieve RAG context specifically for Chef AI chat.

        If recipe_context_id is provided, fetches that specific recipe's context.
        Otherwise performs a semantic search for relevant recipes.

        Args:
            query: User's message text.
            language: Language code for recipe content.
            recipe_context_id: Optional recipe UUID to scope context.
            max_recipes: Max recipes to pull via semantic search.

        Returns:
            Formatted context string for injection into system prompt.
        """
        if recipe_context_id:
            # Fetch the specific recipe the user is currently viewing
            recipe = await self.recipe_service.get_recipe_by_id(recipe_context_id, language)
            if recipe:
                ingredients_text = ", ".join([
                    ing.get("name", "") for ing in (recipe.ingredients or [])
                    if isinstance(ing, dict)
                ])
                steps_text = "\n".join([
                    f"  {s['step_number']}. {s['instruction']}" for s in recipe.steps
                ])
                return (
                    f"Recipe: {recipe.name} ({recipe.origin_country})\n"
                    f"Difficulty: {recipe.difficulty.value}\n"
                    f"Time: {recipe.total_time} min | Servings: {recipe.servings}\n"
                    f"⚠️ Safety: {recipe.kitchen_guard or 'None'}\n"
                    f"Ingredients: {ingredients_text}\n"
                    f"Steps:\n{steps_text}"
                )

        # No specific recipe — do semantic search
        try:
            return await self.get_rag_context(query=query, language=language, max_recipes=max_recipes)
        except Exception as e:
            logger.warning(f"RAG context retrieval failed for Chef AI: {e}")
            return ""
