# Research: Recipe Content Schema Implementation

## Decision: Recipe Data Model Structure
**Rationale**: Need to define a comprehensive recipe schema that supports all required fields (name, origin, difficulty, 5-step instructions, safety tips, metaphor fields) and is optimized for RAG retrieval.
**Alternatives considered**:
- Simple flat structure vs. normalized relational model
- JSONB field vs. separate tables for translations
- Single table vs. separate tables for steps and safety tips

**Chosen approach**: Normalized model with main recipe table and related tables for steps, translations, and safety tips to maintain data integrity while supporting multilingual content.

## Decision: RAG Infrastructure Setup
**Rationale**: Need to implement Retrieval-Augmented Generation to enable the chatbot to answer questions about recipes.
**Alternatives considered**:
- Using OpenAI embeddings API with Qdrant vector store
- Using PostgreSQL with pgvector extension
- Using dedicated vector database like Pinecone

**Chosen approach**: Qdrant Cloud as specified in the constitution for vector storage, with OpenAI embeddings API for generating recipe content embeddings.

## Decision: Multilingual Implementation
**Rationale**: Need to support all 6 target languages (EN, UR, AR, ES, FR, FA) for the 5 recipes.
**Alternatives considered**:
- JSONB fields in database vs. separate translation table
- Runtime translation vs. pre-translated content
- Centralized vs. decentralized translation storage

**Chosen approach**: Separate translation table with recipe_id, language_code, and translated_content fields to allow efficient language switching and maintain cultural appropriateness.

## Decision: Metaphor Mapping Logic
**Rationale**: Need to personalize dashboard welcome messages based on user background from onboarding survey.
**Alternatives considered**:
- Simple if/else logic vs. rule-based system
- Client-side vs. server-side personalization
- Hardcoded mappings vs. configurable mapping system

**Chosen approach**: Server-side metaphor mapping service that uses user profile data to select appropriate welcome message with relevant metaphors.

## Decision: Database Seeding Strategy
**Rationale**: Need to populate Neon Postgres with the 5 initial recipes (Pasta, Sajji, Guacamole, Shakshuka, Gomen).
**Alternatives considered**:
- Manual SQL inserts vs. Alembic migrations vs. seed scripts
- Single vs. multiple migration files
- Inline recipe data vs. external data files

**Chosen approach**: Alembic seed migration that inserts the 5 recipes with all required fields and language translations.

## Decision: API Endpoints Design
**Rationale**: Need to design endpoints for recipe retrieval, RAG queries, and language-specific content.
**Alternatives considered**:
- REST vs. GraphQL
- Single endpoint with query parameters vs. multiple specialized endpoints
- Flat vs. nested resource structure

**Chosen approach**: REST endpoints following standard patterns: `/recipes`, `/recipes/{id}`, `/recipes/search`, `/recipes/translate/{id}`.