# Implementation Plan: Recipe Content Schema Implementation

**Branch**: `001-recipe-content-schema` | **Date**: 2025-12-24 | **Spec**: [link]
**Input**: Feature specification from `/specs/001-recipe-content-schema/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implementation of the first 5 global recipes (Pasta, Sajji, Guacamole, Shakshuka, Gomen) with a complete technical stack including database population, RAG infrastructure, multilingual support, and personalization logic. This plan covers populating the Neon Postgres database, setting up Qdrant vector store for RAG, implementing 6-language translations, and creating metaphor mapping for personalized dashboard messages.

## Technical Context

**Language/Version**: Python 3.11 (backend), TypeScript 5.x (frontend)
**Primary Dependencies**: FastAPI, Qdrant Cloud, Neon Postgres, i18next, OpenAI API
**Storage**: Neon Serverless Postgres for recipe data, Qdrant Cloud for vector embeddings
**Testing**: pytest for backend, Jest for frontend
**Target Platform**: Web application with Docusaurus frontend and FastAPI backend
**Project Type**: Web application with frontend/backend separation
**Performance Goals**: <1s vector search (RAG), <500ms language switching, <2s voice response (p95)
**Constraints**: <5 steps per recipe, 6 language support, Kitchen Guard safety sections, personalization based on user background
**Scale/Scope**: 5 initial recipes with 6 language translations, scalable for future recipes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Review against Global Plate Constitution principles:

- [X] **Accessibility-First**: Feature supports voice-first navigation and all 6 languages (EN, UR, AR, ES, FR, FA)
- [X] **Beginner-Centric**: All recipes follow max 5 steps, one action per step requirement
- [X] **Safety Mandatory**: All recipes include Kitchen Guard safety sections
- [X] **Tech Stack Discipline**: Uses defined stack (FastAPI, Qdrant Cloud, Neon Postgres, Better-Auth)
- [X] **Multi-Modal Excellence**: Includes voice + visual components for recipe presentation
- [X] **Personalization Required**: Uses Better-Auth context for personalized welcome messages

**Deviations**: None

## Project Structure

### Documentation (this feature)

```text
specs/001-recipe-content-schema/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   ├── recipe.py          # Recipe data models
│   │   └── user.py            # User profile models
│   ├── services/
│   │   ├── recipe_service.py  # Recipe management and RAG integration
│   │   ├── translation_service.py # Multilingual support
│   │   └── metaphor_service.py # Personalization logic
│   ├── api/
│   │   ├── recipes.py         # Recipe endpoints
│   │   └── rag.py             # RAG endpoints
│   └── db/
│       └── migrations/        # Database migration scripts
└── tests/

frontend/
├── src/
│   ├── components/
│   │   ├── recipes/           # Recipe display components
│   │   ├── voice/             # Voice interaction components
│   │   └── dashboard/         # Dashboard components with personalized messages
│   ├── services/
│   │   ├── recipeService.ts   # Recipe API client
│   │   └── ragService.ts      # RAG API client
│   ├── utils/
│   │   └── metaphorMapper.ts  # Metaphor mapping logic
│   └── locales/               # Translation files for 6 languages
└── tests/
```

**Structure Decision**: Web application with separate backend (FastAPI) and frontend (Docusaurus React) following the existing Global Plate architecture.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | None | None |
