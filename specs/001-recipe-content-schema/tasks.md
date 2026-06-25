# Tasks: Recipe Content Schema for Global Masterpieces

**Feature**: 001-recipe-content-schema
**Input**: Design documents from `/specs/001-recipe-content-schema/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: Tests are OPTIONAL and NOT included in this task list unless explicitly requested.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a web application with:
- **Backend**: `backend/src/` (FastAPI + Python 3.11)
- **Frontend**: `frontend/src/` (Docusaurus + React + TypeScript)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and database/service configuration

- [X] T001 Create backend database models directory structure in backend/src/models/
- [X] T002 Create backend services directory structure in backend/src/services/
- [X] T003 Create backend API routes directory structure in backend/src/api/
- [X] T004 [P] Create frontend recipe components directory in frontend/src/components/recipes/
- [X] T005 [P] Create frontend locales directory structure for 6 languages in frontend/src/locales/
- [X] T006 [P] Create frontend utils directory for metaphor mapping in frontend/src/utils/
- [X] T007 Add required Python dependencies to backend/requirements.txt (qdrant-client, openai, alembic)
- [X] T008 Add required frontend dependencies to frontend/package.json (i18next, react-i18next, @qdrant/js-client-rest)

**Checkpoint**: Project structure ready for database and service implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T009 Create Alembic migration for Recipe entity in backend/src/db/migrations/ (recipe_id, name, origin_country, difficulty, prep_time, cook_time, total_time, servings, created_at, updated_at, is_active)
- [X] T010 Create Alembic migration for RecipeTranslation entity in backend/src/db/migrations/ (translation_id, recipe_id FK, language_code, name, kitchen_guard, ingredients JSON, created_at, updated_at)
- [X] T011 Create Alembic migration for RecipeStep entity in backend/src/db/migrations/ (step_id, recipe_id FK, step_number, instruction, audio_clip_url, image_url, created_at)
- [X] T012 Create Alembic migration for RecipeStepTranslation entity in backend/src/db/migrations/ (step_translation_id, step_id FK, language_code, instruction, created_at)
- [X] T013 Create Alembic migration for UserBackground entity in backend/src/db/migrations/ (user_id, software_background, hardware_background, cooking_level, dietary_restrictions, preferred_language, preferred_voice)
- [X] T014 Create Alembic migration for MetaphorMapping entity in backend/src/db/migrations/ (mapping_id, background_type, background_level, context, metaphor_template, is_active)
- [X] T015 Run Alembic migrations to create database schema with command: alembic upgrade head
- [X] T016 Configure Qdrant Cloud connection in backend/src/config.py (QDRANT_URL, QDRANT_API_KEY from environment)
- [X] T017 Configure OpenAI API connection in backend/src/config.py (OPENAI_API_KEY from environment)
- [X] T018 Create Qdrant collection setup script in backend/scripts/setup_qdrant.py (recipes collection with vector embeddings)
- [X] T019 Run Qdrant setup script to create collections with command: python backend/scripts/setup_qdrant.py
- [X] T020 Configure i18next for 6 languages in frontend/src/i18n/config.ts (EN, UR, AR, ES, FR, FA)
- [X] T021 Create base error handling middleware in backend/src/middleware/error_handler.py
- [X] T022 Create base logging configuration in backend/src/utils/logger.py

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Chatbot Retrieves Recipe Information (Priority: P1) 🎯 MVP

**Goal**: Enable AI voice assistant to retrieve and provide recipe data with all required fields intact, supporting multilingual queries

**Independent Test**: Query the system for recipe information (e.g., "How do I make authentic Pad Thai?") and verify the AI can generate natural responses with complete recipe data in the requested language

### Implementation for User Story 1

- [X] T023 [P] [US1] Create Recipe Pydantic model in backend/src/models/recipe.py (with all fields from data-model.md)
- [X] T024 [P] [US1] Create RecipeTranslation Pydantic model in backend/src/models/recipe.py (with language_code, name, kitchen_guard, ingredients)
- [X] T025 [P] [US1] Create RecipeStep Pydantic model in backend/src/models/recipe.py (with step_number 1-5, instruction, audio_clip_url, image_url)
- [X] T026 [P] [US1] Create RecipeStepTranslation Pydantic model in backend/src/models/recipe.py (with step_id FK, language_code, instruction)
- [X] T027 [US1] Create seed migration for 5 global recipes in backend/src/db/migrations/ (Pasta-Italy, Sajji-Pakistan, Guacamole-Mexico, Shakshuka-MiddleEast, Gomen-Ethiopia)
- [X] T028 [US1] Add recipe translations for all 6 languages to seed migration (EN, UR, AR, ES, FR, FA with culturally appropriate content)
- [X] T029 [US1] Add recipe steps (max 5 steps, one action per step) with translations to seed migration
- [X] T030 [US1] Run seed migration to populate database with 5 recipes: alembic upgrade head
- [X] T031 [US1] Implement RecipeService.get_recipe_by_id() in backend/src/services/recipe_service.py (fetch recipe with translations)
- [X] T032 [US1] Implement RecipeService.list_recipes() in backend/src/services/recipe_service.py (with language and difficulty filters)
- [X] T033 [US1] Implement RecipeService.get_recipe_translation() in backend/src/services/recipe_service.py (fetch specific language version)
- [X] T034 [US1] Implement recipe embedding generation in backend/src/services/rag_service.py (using OpenAI embeddings API)
- [X] T035 [US1] Implement script to generate and store embeddings for all recipes in backend/scripts/generate_embeddings.py
- [X] T036 [US1] Run embedding generation script: python backend/scripts/generate_embeddings.py
- [X] T037 [US1] Implement RAG search functionality in backend/src/services/rag_service.py (vector search in Qdrant with relevance scoring)
- [X] T038 [US1] Implement RAG context retrieval in backend/src/services/rag_service.py (fetch relevant recipe content for LLM)
- [X] T039 [US1] Create GET /recipes endpoint in backend/src/api/recipes.py (with language and difficulty query parameters)
- [X] T040 [US1] Create GET /recipes/{recipeId} endpoint in backend/src/api/recipes.py (with language query parameter)
- [X] T041 [US1] Create POST /recipes/search endpoint in backend/src/api/recipes.py (RAG-based natural language search)
- [X] T042 [US1] Create GET /recipes/{recipeId}/translate endpoint in backend/src/api/recipes.py (fetch specific language translation)
- [X] T043 [US1] Add validation for language codes in backend/src/api/recipes.py (ensure only EN, UR, AR, ES, FR, FA accepted)
- [X] T044 [US1] Add validation for difficulty levels in backend/src/api/recipes.py (ensure only 'Absolute Beginner', 'Beginner', 'Beginner+')
- [X] T045 [US1] Add error handling for recipe not found in backend/src/api/recipes.py (return 404 with proper error response)
- [X] T046 [P] [US1] Create English recipe translation file in frontend/src/locales/recipes/en.json (with all 5 recipes)
- [X] T047 [P] [US1] Create Urdu recipe translation file in frontend/src/locales/recipes/ur.json (with all 5 recipes)
- [X] T048 [P] [US1] Create Arabic recipe translation file in frontend/src/locales/recipes/ar.json (with all 5 recipes, RTL support)
- [X] T049 [P] [US1] Create Spanish recipe translation file in frontend/src/locales/recipes/es.json (with all 5 recipes)
- [X] T050 [P] [US1] Create French recipe translation file in frontend/src/locales/recipes/fr.json (with all 5 recipes)
- [X] T051 [P] [US1] Create Persian recipe translation file in frontend/src/locales/recipes/fa.json (with all 5 recipes, RTL support)
- [X] T052 [US1] Create recipeService.ts API client in frontend/src/services/recipeService.ts (with methods for all recipe endpoints)
- [X] T053 [US1] Create ragService.ts API client in frontend/src/services/ragService.ts (with search method)
- [X] T054 [P] [US1] Create RecipeList component in frontend/src/components/recipes/RecipeList.tsx (displays recipe summaries with filtering)
- [X] T055 [P] [US1] Create RecipeDetail component in frontend/src/components/recipes/RecipeDetail.tsx (displays full recipe with steps and ingredients)
- [X] T056 [P] [US1] Create RecipeSteps component in frontend/src/components/recipes/RecipeSteps.tsx (displays numbered steps 1-5)
- [X] T057 [P] [US1] Create RecipeSearch component in frontend/src/components/recipes/RecipeSearch.tsx (voice and text search with RAG)
- [X] T058 [US1] Integrate language switching in RecipeDetail component in frontend/src/components/recipes/RecipeDetail.tsx (using i18next)
- [X] T059 [US1] Add recipe voice navigation support in frontend/src/components/voice/VoiceRecipeNavigator.tsx (read steps aloud)
- [X] T060 [US1] Add logging for recipe retrieval operations in backend/src/services/recipe_service.py
- [X] T061 [US1] Add logging for RAG search operations in backend/src/services/rag_service.py

**Checkpoint**: At this point, User Story 1 should be fully functional - users can search for recipes, view them in any of 6 languages, and the RAG system can answer natural language questions about recipes

---

## Phase 4: User Story 2 - Personalized Recipe Experience (Priority: P2)

**Goal**: Enable the system to present recipes with personalized metaphors based on user background (software/hardware experience)

**Independent Test**: Verify that the system selects appropriate metaphors based on user profile (e.g., tech-related analogies for users with software background)

### Implementation for User Story 2

- [X] T062 [P] [US2] Create UserBackground Pydantic model in backend/src/models/user.py (with all fields from data-model.md)
- [X] T063 [P] [US2] Create MetaphorMapping Pydantic model in backend/src/models/metaphor.py (with background_type, background_level, context, metaphor_template)
- [X] T064 [US2] Create seed migration for metaphor mappings in backend/src/db/migrations/ (software beginner/intermediate/expert, hardware beginner/intermediate/expert, cooking contexts)
- [X] T065 [US2] Add metaphor templates for recipe explanations to seed migration (with placeholders for personalization)
- [X] T066 [US2] Add metaphor templates for welcome messages to seed migration (with placeholders for user context)
- [X] T067 [US2] Run metaphor seed migration: alembic upgrade head
- [X] T068 [US2] Implement MetaphorService.get_welcome_message() in backend/src/services/metaphor_service.py (select message based on user background)
- [X] T069 [US2] Implement MetaphorService.get_recipe_metaphor() in backend/src/services/metaphor_service.py (select cooking metaphor based on user context)
- [X] T070 [US2] Implement UserBackgroundService.get_user_background() in backend/src/services/user_service.py (fetch user background from database)
- [X] T071 [US2] Implement UserBackgroundService.update_user_background() in backend/src/services/user_service.py (update user preferences)
- [X] T072 [US2] Create GET /metaphors/welcome endpoint in backend/src/api/metaphors.py (with background_type, background_level, language query parameters)
- [X] T073 [US2] Add validation for background_type in backend/src/api/metaphors.py (ensure only software, hardware, cooking, other accepted)
- [X] T074 [US2] Add validation for background_level in backend/src/api/metaphors.py (ensure only beginner, intermediate, expert accepted)
- [X] T075 [P] [US2] Create English metaphor translation file in frontend/src/locales/metaphors/en.json (with welcome messages for all background types/levels)
- [X] T076 [P] [US2] Create Urdu metaphor translation file in frontend/src/locales/metaphors/ur.json (with culturally appropriate metaphors)
- [X] T077 [P] [US2] Create Arabic metaphor translation file in frontend/src/locales/metaphors/ar.json (with culturally appropriate metaphors, RTL)
- [X] T078 [P] [US2] Create Spanish metaphor translation file in frontend/src/locales/metaphors/es.json (with culturally appropriate metaphors)
- [X] T079 [P] [US2] Create French metaphor translation file in frontend/src/locales/metaphors/fr.json (with culturally appropriate metaphors)
- [X] T080 [P] [US2] Create Persian metaphor translation file in frontend/src/locales/metaphors/fa.json (with culturally appropriate metaphors, RTL)
- [X] T081 [US2] Create metaphorMapper utility in frontend/src/utils/metaphorMapper.ts (maps user background to appropriate metaphors)
- [X] T082 [US2] Create PersonalizedDashboard component in frontend/src/components/dashboard/PersonalizedDashboard.tsx (displays welcome message with metaphors)
- [X] T083 [US2] Integrate user background from Better-Auth context in frontend/src/components/dashboard/PersonalizedDashboard.tsx
- [X] T084 [US2] Update RecipeDetail component to show personalized cooking tips in frontend/src/components/recipes/RecipeDetail.tsx (based on user background)
- [X] T085 [US2] Add logging for metaphor selection in backend/src/services/metaphor_service.py

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - recipes can be retrieved (US1) and personalized messages are shown based on user background (US2)

---

## Phase 5: User Story 3 - Safe Cooking Experience (Priority: P3)

**Goal**: Ensure users receive important safety information (Kitchen Guard) before starting potentially hazardous cooking steps

**Independent Test**: Verify that safety tips are properly associated with recipes and displayed when appropriate

### Implementation for User Story 3

- [X] T086 [US3] Verify Kitchen Guard safety tips are present in all 5 recipes in database (check seed migration from T027-T029)
- [X] T087 [US3] Verify Kitchen Guard translations exist for all 6 languages in database (check seed migration from T028)
- [X] T088 [US3] Create KitchenGuard component in frontend/src/components/recipes/KitchenGuard.tsx (displays safety warnings prominently)
- [X] T089 [US3] Integrate KitchenGuard component into RecipeDetail page in frontend/src/components/recipes/RecipeDetail.tsx (shown before steps)
- [X] T090 [US3] Add Kitchen Guard voice announcement in frontend/src/components/voice/VoiceRecipeNavigator.tsx (read safety tip before starting recipe)
- [X] T091 [US3] Add visual styling for Kitchen Guard warnings in frontend/src/components/recipes/KitchenGuard.tsx (use warning colors, icon)
- [X] T092 [US3] Ensure Kitchen Guard is included in RAG context in backend/src/services/rag_service.py (so chatbot can reference safety tips)
- [X] T093 [US3] Add validation to ensure all new recipes include Kitchen Guard field in backend/src/services/recipe_service.py
- [X] T094 [US3] Add logging for Kitchen Guard display in frontend/src/components/recipes/KitchenGuard.tsx

**Checkpoint**: All user stories should now be independently functional - recipes retrievable (US1), personalized (US2), and safe (US3)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [X] T095 [P] Add API documentation to backend/src/api/ docstrings (following OpenAPI spec from contracts/recipes-openapi.yaml)
- [X] T096 [P] Update README.md with setup instructions for recipe content schema
- [X] T097 [P] Verify all recipe steps follow max 5 steps constraint across all 5 recipes
- [X] T098 [P] Verify all recipe steps contain only one action per step across all 5 recipes
- [X] T099 [P] Verify all 6 language translations are culturally appropriate and complete
- [X] T100 [P] Run quickstart.md validation following steps 1-12 in specs/001-recipe-content-schema/quickstart.md

### Global Plate Specific Testing

- [X] T101 [P] Voice testing: Verify recipe steps are clearly audible with kitchen background noise
- [X] T102 [P] Language testing: Verify language switching works for all 6 languages (EN, UR, AR, ES, FR, FA) with <500ms response time
- [X] T103 [P] Accessibility testing: Verify WCAG 2.1 AA compliance for RecipeDetail and KitchenGuard components
- [X] T104 [P] Performance testing: Verify RAG search response time <1s p95
- [X] T105 [P] Performance testing: Verify voice response time <2s p95
- [X] T106 [P] Recipe compliance: Verify all recipes have Kitchen Guard safety sections
- [X] T107 [P] RTL testing: Verify Arabic and Persian languages display correctly with RTL layout

---

## Phase 7: Spec v1.1 Implementation (Voice Query & Performance Benchmarks)

**Purpose**: Implement new requirements from spec v1.1 refinement (FR-005 Voice Query, SC clarifications)

### Voice Query Implementation (FR-005)

- [X] T108 [P] Implement Web Speech API integration for Speech-to-Text (STT) in frontend/src/components/recipes/RecipeSearch.tsx
- [X] T109 [P] Add microphone UI component with visual feedback in frontend/src/components/recipes/VoiceSearchButton.tsx

### Cultural Review & Performance Benchmarking

- [X] T110 [P] Add cultural appropriateness review task for each language translation (beyond format validation)
- [X] T111 [P] Add RAG performance benchmarking task to validate SC-001 (<500ms retrieval) and SC-003 (95% relevance)

**Checkpoint**: All spec v1.1 requirements implemented and validated

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories ✅
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 but independently testable ✅
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Integrates with US1 but independently testable ✅

### Within Each User Story

- **User Story 1**: Models (T023-T026) → Seed data (T027-T030) → Services (T031-T038) → API endpoints (T039-T045) → Frontend translations (T046-T051) → Frontend services (T052-T053) → Frontend components (T054-T059) → Logging (T060-T061)
- **User Story 2**: Models (T062-T063) → Seed data (T064-T067) → Services (T068-T071) → API endpoints (T072-T074) → Frontend translations (T075-T080) → Frontend utils (T081) → Frontend components (T082-T084) → Logging (T085)
- **User Story 3**: Verification (T086-T087) → Frontend component (T088) → Integration (T089-T092) → Validation (T093) → Logging (T094)

### Parallel Opportunities

**Phase 1 (Setup)**:
- T004, T005, T006 can run in parallel (different frontend directories)
- T001, T002, T003 are sequential (backend structure)
- T007, T008 can run after directory structure is ready

**Phase 2 (Foundational)**:
- T009-T014 can run in parallel (separate migration files)
- T016, T017 can run in parallel (different config areas)
- T018, T020, T021, T022 can run in parallel (different files)

**Phase 3 (User Story 1)**:
- T023-T026 can run in parallel (different model classes in same file, but recommend sequential editing)
- T046-T051 can run in parallel (different translation files)
- T054-T057 can run in parallel (different React components)

**Phase 4 (User Story 2)**:
- T062-T063 can run in parallel (different model files)
- T075-T080 can run in parallel (different translation files)

**Phase 6 (Polish)**:
- T095-T100 can run in parallel (different files/validation tasks)
- T101-T107 can run in parallel (different testing areas)

---

## Parallel Example: User Story 1

```bash
# After models are complete (T023-T026), launch frontend translations in parallel:
Task T046: "Create English recipe translation file in frontend/src/locales/recipes/en.json"
Task T047: "Create Urdu recipe translation file in frontend/src/locales/recipes/ur.json"
Task T048: "Create Arabic recipe translation file in frontend/src/locales/recipes/ar.json"
Task T049: "Create Spanish recipe translation file in frontend/src/locales/recipes/es.json"
Task T050: "Create French recipe translation file in frontend/src/locales/recipes/fr.json"
Task T051: "Create Persian recipe translation file in frontend/src/locales/recipes/fa.json"

# After frontend services are complete (T052-T053), launch components in parallel:
Task T054: "Create RecipeList component in frontend/src/components/recipes/RecipeList.tsx"
Task T055: "Create RecipeDetail component in frontend/src/components/recipes/RecipeDetail.tsx"
Task T056: "Create RecipeSteps component in frontend/src/components/recipes/RecipeSteps.tsx"
Task T057: "Create RecipeSearch component in frontend/src/components/recipes/RecipeSearch.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T008)
2. Complete Phase 2: Foundational (T009-T022) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T023-T061)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Can users search for recipes using natural language?
   - Do recipes display in all 6 languages?
   - Does the RAG system provide accurate recipe information?
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational (T001-T022) → Foundation ready
2. Add User Story 1 (T023-T061) → Test independently → Deploy/Demo (MVP! 🎯)
3. Add User Story 2 (T062-T085) → Test independently → Deploy/Demo
4. Add User Story 3 (T086-T094) → Test independently → Deploy/Demo
5. Add Polish (T095-T107) → Final validation → Deploy
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T022)
2. Once Foundational is done:
   - **Developer A**: User Story 1 (T023-T061) - Focus on RAG and multilingual support
   - **Developer B**: User Story 2 (T062-T085) - Focus on personalization
   - **Developer C**: User Story 3 (T086-T094) - Focus on safety features
3. Stories complete and integrate independently

---

## Success Metrics (from spec.md)

- **SC-001**: Chatbot can retrieve and present any recipe within 500ms ✅ (Test with T104)
- **SC-002**: Users can complete recipes following 5-step format with 90% success rate ✅ (Validate with T097-T098)
- **SC-003**: 95% of recipe queries return relevant, complete information ✅ (Test with T041 RAG search)
- **SC-004**: Personalization engine adapts metaphor usage in 85% of interactions ✅ (Test with T068-T069)
- **SC-005**: All 6 target languages have complete recipe content ✅ (Validate with T099)

---

## Notes

- **[P]** tasks = different files, no dependencies, can run in parallel
- **[Story]** label maps task to specific user story for traceability
- **Each user story should be independently completable and testable**
- **Tests are NOT included** unless explicitly requested in specification
- Verify all recipe constraints: max 5 steps, one action per step, Kitchen Guard present
- All API endpoints must follow contracts/recipes-openapi.yaml specification
- All translations must be culturally appropriate for target languages
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **MVP = Phase 1 + Phase 2 + Phase 3 (User Story 1 only)**

---

## Phase 8: Interactive UX & Design System (Priority: P1) 🎯 Product-System Era

**Goal**: Transition from standard Docusaurus styling to custom Tailwind-based "Big-Tech" aesthetic with Cook Mode, ingredient checkboxes, and progress tracking

**Independent Test**: Can be tested by verifying: (1) Tailwind styles load correctly, (2) Cook Mode activates wake lock, (3) ingredient checkboxes persist state, (4) progress bar updates in real-time

### Implementation for Phase 8

- [X] T112 [P] [US5] Install and configure Tailwind CSS in frontend/docusaurus.config.ts with custom Global Plate theme (dark mode default, Geist/Inter fonts)
- [X] T113 [P] [US5] Create IngredientChecklist component in frontend/src/components/recipes/IngredientChecklist.tsx with checkbox state management
- [X] T114 [P] [US5] Create StepProgressBar component in frontend/src/components/recipes/StepProgressBar.tsx showing completed/in-progress/pending states
- [X] T115 [US5] Implement Cook Mode logic in frontend/src/components/recipes/CookMode.tsx using NoSleep.js for wake lock and Fullscreen API
- [X] T116 [US5] Create database migration for user_recipe_progress table in backend/src/db/migrations/ (user_id, recipe_id, current_step, cook_mode_active)
- [X] T117 [US5] Create database migration for ingredient_checkboxes table in backend/src/db/migrations/ (progress_id, ingredient_id, is_checked, checked_at)
- [X] T118 [US5] Create database migration for step_progress table in backend/src/db/migrations/ (progress_id, step_id, status, time_spent)
- [X] T119 [US5] Run Alembic migrations: alembic upgrade head
- [X] T120 [US5] Implement POST /recipes/{recipeId}/progress endpoint in backend/src/api/recipes.py (initialize/update user progress)
- [X] T121 [US5] Implement POST /recipes/{recipeId}/ingredients/check endpoint in backend/src/api/recipes.py (toggle ingredient checkbox)
- [X] T122 [US5] Implement React Query hooks for progress sync in frontend/src/hooks/useRecipeProgress.ts (optimistic updates, background sync)
- [X] T123 [US5] Integrate IngredientChecklist into RecipeDetail component in frontend/src/pages/recipe-detail.tsx
- [X] T124 [US5] Integrate StepProgressBar into RecipeDetail component in frontend/src/pages/recipe-detail.tsx
- [X] T125 [US5] Add Cook Mode toggle button to RecipeDetail component in frontend/src/pages/recipe-detail.tsx
- [X] T126 [US5] Add logging for progress tracking operations in backend/src/services/recipe_service.py

**Checkpoint**: At this point, users can track their cooking progress with interactive checkboxes, see visual progress bar, and activate Cook Mode to prevent screen sleep

---

## Phase 9: Conversational Chef AI (Priority: P1) 🎯 Product-System Era

**Goal**: Upgrade RAG system to conversational Chef AI capable of substitutions, fridge logic, and Halal-compliant suggestions

**Independent Test**: Can be tested by asking Chef AI: (1) "What can I substitute for buttermilk?" (2) "I have chicken and rice, what can I make?" (3) "Is this recipe beginner-friendly?"

### Implementation for Phase 9

- [X] T127 [P] [US4] Create substitution database in backend/src/data/substitutions.py (100+ common ingredient substitutions with ratios)
- [X] T128 [P] [US4] Create ChefAISession Pydantic model in backend/src/models/chef_ai.py (session_id, user_id, user_inventory, conversation_history)
- [X] T129 [P] [US4] Create database migration for chef_ai_sessions table in backend/src/db/migrations/ (session_id, user_id, user_inventory JSONB, dietary_restrictions JSONB)
- [X] T130 [US4] Enhance RAG prompt in backend/src/services/rag_service.py to handle substitution queries and fridge logic
- [X] T131 [US4] Implement Halal compliance filter in backend/src/services/chef_ai_service.py (filter pork, alcohol, non-Halal meat)
- [X] T132 [US4] Implement ChefAIService.chat() method in backend/src/services/chef_ai_service.py (conversational AI with context)
- [X] T133 [US4] Implement ChefAIService.get_fridge_logic_suggestions() in backend/src/services/chef_ai_service.py (recipe suggestions from available ingredients)
- [X] T134 [US4] Create POST /chef-ai/chat endpoint in backend/src/api/chef_ai.py (conversational interface)
- [X] T135 [US4] Create POST /chef-ai/fridge-logic endpoint in backend/src/api/chef_ai.py (recipe suggestions from inventory)
- [X] T136 [P] [US4] Create ChefAI floating chat button component in frontend/src/components/ai/ChefAiFab.tsx
- [X] T137 [P] [US4] Create ChefAI chat drawer component in frontend/src/components/ai/ChefAiDrawer.tsx with conversation history
- [X] T138 [US4] Implement ChefAI service in frontend/src/services/chefAiService.ts (API client for chat and fridge logic)
- [X] T139 [US4] Add citation display for food safety claims in frontend/src/components/ai/ChefAiDrawer.tsx
- [X] T140 [US4] Add logging for Chef AI operations in backend/src/services/chef_ai_service.py
- [X] T141 [US4] Add user feedback mechanism (thumbs up/down) in frontend/src/components/ai/ChefAiDrawer.tsx

**Checkpoint**: At this point, users can chat with Chef AI for substitutions, get recipe suggestions from available ingredients, and receive Halal-compliant cooking advice

---

## Phase 10: System Features (Priority: P2)

**Goal**: Implement Command+K search, smart scaling, PWA offline support, and PDF generation for print-ready recipes

**Independent Test**: Can be tested by: (1) Pressing Command+K and searching in <300ms, (2) Scaling recipe to different servings, (3) Using app offline, (4) Generating PDF

### Command+K Search (SC-006: <300ms)

- [X] T142 [P] Install cmdk library: npm install cmdk
- [X] T143 [P] Create CommandK component in frontend/src/components/search/CommandK.tsx with client-side search index
- [X] T144 [US1] Build search index from recipes in frontend/src/utils/searchIndex.ts (fuzzy matching, typo tolerance)
- [X] T145 [US1] Integrate CommandK into global layout in frontend/src/theme/Layout.tsx (always available)
- [X] T146 [US1] Add keyboard shortcut handler (Cmd+K / Ctrl+K) in frontend/src/components/search/CommandK.tsx

### Smart Scaling (FR-010)

- [X] T147 [P] Create ServingSizeScale Pydantic model in backend/src/models/recipe.py (base_servings, target_servings, scale_factor)
- [X] T148 [US1] Implement POST /recipes/{recipeId}/scale endpoint in backend/src/api/recipes.py (return scaled ingredients)
- [X] T149 [US1] Create ServingSizeScaler component in frontend/src/components/recipes/ServingSizeScaler.tsx (user input for target servings)
- [X] T150 [US1] Integrate ServingSizeScaler into RecipeDetail component in frontend/src/pages/recipe-detail.tsx
- [X] T151 [US1] Add auto-calculation logic for scaled quantities in frontend/src/utils/recipeScaling.ts

### PWA Offline Support (Phase 10 - Lyari Use Case)

- [X] T152 [P] Install PWA plugin: npm install -D @docusaurus/plugin-pwa
- [X] T153 [P] Configure PWA in frontend/docusaurus.config.ts (offline mode, cache strategies)
- [X] T154 [P] Create manifest.json in frontend/static/manifest.json (app name, icons, theme color)
- [X] T155 [P] Generate PWA icons (192x192, 512x512) in frontend/static/
- [X] T156 [US1] Add offline detection banner in frontend/src/components/PWA/OfflineBanner.tsx
- [X] T157 [US1] Cache recipes for offline access in frontend/src/service-worker-config.ts

### PDF Generation (Phase 10 - Print-Ready)

- [X] T158 [P] Install react-pdf: npm install @react-pdf/renderer
- [X] T159 [P] Create RecipePDF component in frontend/src/components/recipes/RecipePDF.tsx (print-optimized layout)
- [X] T160 [US1] Add "Download PDF" button to RecipeDetail component in frontend/src/pages/recipe-detail.tsx
- [X] T161 [US1] Implement PDF generation with QR code linking to video tutorial in frontend/src/components/recipes/RecipePDF.tsx

**Checkpoint**: At this point, users can search recipes instantly with Command+K, scale recipes to different servings, use app offline in Lyari, and print recipes as PDFs

---

## Phase 11: Polish & Cross-Cutting Concerns (Product-System Era)

**Purpose**: Final validation, performance optimization, and user testing

### Performance Validation

- [ ] T162 [P] Benchmark Command+K search performance (must be <300ms) in tests/performance/test-search.ts
- [ ] T163 [P] Test ingredient checkbox sync latency (must be <100ms) in tests/performance/test-progress-sync.ts
- [ ] T164 [P] Verify Cook Mode wake lock activation is instant in tests/e2e/test-cook-mode.ts
- [ ] T165 [P] Test PWA offline functionality in Lyari network conditions in tests/e2e/test-offline-mode.ts

### Accessibility & UX Validation

- [ ] T166 [P] Verify all touch targets are 44x44px minimum in tests/accessibility/test-touch-targets.ts
- [ ] T167 [P] Verify Cook Mode high-contrast typography meets WCAG 2.1 AA in tests/accessibility/test-contrast.ts
- [ ] T168 [P] Test Command+K keyboard navigation (Tab, Arrow keys, Enter) in tests/e2e/test-command-k.ts
- [ ] T169 [P] Verify Chef AI citations display for food safety claims in tests/e2e/test-chef-ai-citations.ts

### Halal Compliance & Cultural Sensitivity

- [ ] T170 [P] Verify Chef AI Halal filter blocks pork, alcohol, non-Halal meat in tests/integration/test-halal-compliance.ts
- [ ] T171 [P] Verify Chef AI respects cultural authenticity for traditional dishes in tests/integration/test-cultural-sensitivity.ts
- [ ] T172 [P] Add user reporting for inappropriate AI suggestions in frontend/src/components/chef-ai/ChefAIDrawer.tsx

### Documentation & Quickstart

- [ ] T173 [P] Update quickstart.md with Phase 8-10 implementation steps
- [ ] T174 [P] Add API documentation for new endpoints in backend/src/api/ docstrings
- [ ] T175 [P] Update README.md with Product-System Era features

**Checkpoint**: All Product-System Era features validated for performance, accessibility, Halal compliance, and cultural sensitivity

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1-2**: Already complete (Setup + Foundational)
- **Phase 3-7**: Already complete (User Stories 1-3 + Spec v1.1)
- **Phase 8 (Interactive UX)**: Depends on Phase 2 (Foundational) - Can start immediately ✅
- **Phase 9 (Chef AI)**: Depends on Phase 2 (Foundational) - Can start immediately ✅
- **Phase 10 (System Features)**: Depends on Phase 2 (Foundational) - Can start immediately ✅
- **Phase 11 (Polish)**: Depends on Phases 8-10 completion

### User Story Dependencies (Product-System Era)

- **US4 (Busy Parent - Chef AI)**: Can start after Phase 2 - No dependencies on US5 ✅
- **US5 (Focused Cook - Cook Mode)**: Can start after Phase 2 - No dependencies on US4 ✅

### Within Each Phase

**Phase 8 (Interactive UX)**:
- T112 (Tailwind config) → T113-T115 (components) → T116-T118 (migrations) → T119 (run migrations) → T120-T121 (endpoints) → T122 (React Query) → T123-T125 (integration)

**Phase 9 (Chef AI)**:
- T127 (substitution DB) → T128-M129 (models/migrations) → T130-T133 (services) → T134-T135 (endpoints) → T136-T138 (frontend) → T139-T141 (UX enhancements)

**Phase 10 (System Features)**:
- Command+K: T142-T146 (can run in parallel with other Phase 10 tasks)
- Smart Scaling: T147-T151 (can run in parallel)
- PWA: T152-T157 (can run in parallel)
- PDF: T158-T161 (can run in parallel)

### Parallel Opportunities

**Phase 8**:
- T112, T113, T114, T115 can run in parallel (different components)
- T116, T117, T118 can run in parallel (different migrations)

**Phase 9**:
- T127, T128, T129 can run in parallel (different files)
- T136, T137 can run in parallel (different components)

**Phase 10**:
- T142-T146 (Command+K), T147-T151 (Scaling), T152-T157 (PWA), T158-T161 (PDF) can all run in parallel (different files)

**Phase 11**:
- All tasks T162-T175 can run in parallel (different test files/features)

---

## Parallel Example: Phase 8

```bash
# After Tailwind config (T112), launch component development in parallel:
Task T113: "Create IngredientChecklist component in frontend/src/components/recipes/IngredientChecklist.tsx"
Task T114: "Create StepProgressBar component in frontend/src/components/recipes/StepProgressBar.tsx"
Task T115: "Implement Cook Mode logic in frontend/src/components/recipes/CookMode.tsx"

# After migrations (T116-T118), run migration in parallel with endpoint implementation:
Task T119: "Run Alembic migrations: alembic upgrade head"
Task T120: "Implement POST /recipes/{recipeId}/progress endpoint"
Task T121: "Implement POST /recipes/{recipeId}/ingredients/check endpoint"
```

---

## Implementation Strategy

### MVP First (Phase 8 - Cook Mode Only)

1. Complete T112: Tailwind CSS configuration
2. Complete T115: Cook Mode component (wake lock, fullscreen)
3. Complete T113: Ingredient checkboxes
4. Complete T114: Progress bar
5. **STOP and VALIDATE**: Test Cook Mode prevents screen sleep, checkboxes persist

### Incremental Delivery

1. **Phase 8 Complete** → Interactive UX ready (Cook Mode, checkboxes, progress)
2. **Add Phase 9** → Chef AI ready (substitutions, fridge logic)
3. **Add Phase 10** → System features ready (Command+K, scaling, PWA, PDF)
4. **Phase 11** → Performance validated, accessibility verified

### Parallel Team Strategy

With multiple developers:

1. **Developer A**: Phase 8 (Interactive UX) - Focus on Cook Mode, checkboxes
2. **Developer B**: Phase 9 (Chef AI) - Focus on substitutions, Halal compliance
3. **Developer C**: Phase 10 (System Features) - Focus on Command+K, PWA, PDF
4. All converge on Phase 11 (Polish & Validation)

---

## Success Metrics (from spec.md v1.2)

- **SC-006**: Command+K search <300ms ✅ (Test with T162)
- **SC-007**: 100% mobile touch accuracy for checkboxes ✅ (Test with T166)
- **FR-009**: Ingredient checkboxes, progress bar ✅ (T113, T114, T120-T121)
- **FR-010**: Smart scaling ✅ (T147-T151)
- **FR-011**: Chef AI substitutions ✅ (T127-T141)
- **Constitution VII**: Systemic Interactivity ✅ (T112-T125)
- **Constitution VIII**: Big-Tech UI/UX ✅ (T112, T142-T146)
- **Constitution IX**: Conversational Chef AI ✅ (T127-T141)

---

## Phase 12: Version 2.0 (World-Class Scale)

**Goal**: Upgrade system to production-grade streaming, telemetry, passwordless auth, automated checks, and edge caching

**Independent Test**: Verify: (1) Chef AI response streaming token-by-token, (2) errors logged in Sentry, events tracked in PostHog, (3) auth protected endpoints with Clerk, (4) CI/CD checks pass, (5) Redis/in-memory cache retrieval latency <500ms.

### Real-Time Streaming
- [X] T176 [P] Implement backend Chef AI streaming in `backend/src/api/chef_ai.py` with FastAPI StreamingResponse and async generators
- [X] T177 Implement pre-flight Halal compliance filters for streaming in `backend/src/services/chef_ai_service.py`
- [X] T178 [P] Integrate EventSource/stream reader in `frontend/src/components/ai/ChefAiDrawer.tsx` to handle chunked SSE data
- [X] T179 [P] Implement progressive markdown rendering and dynamic chat auto-scroll in `frontend/src/components/ai/ChefAiDrawer.tsx`


### Telemetry & Observability
- [X] T180 Configure backend `sentry-sdk` in `backend/src/main.py` and `config.py` with FastAPI middleware and performance transaction tracing
- [X] T181 Configure frontend `@sentry/react` in `frontend/src/theme/Layout.tsx` for tracking runtime errors and routing performance
- [X] T182 Integrate PostHog JavaScript SDK in `frontend/src/theme/Layout.tsx` to track events (`cook_mode_toggled`, `recipe_scaled`, `command_k_search`)


### Passwordless Auth (Clerk)
- [X] T183 Integrate Clerk frontend SDK and customize auth modals to match default dark-mode design system in `frontend/src/pages/`
- [X] T184 Refactor user context hooks and dashboards in `frontend/src/components/dashboard/` to retrieve metadata from Clerk sessions
- [X] T185 Implement FastAPI JWKS verification middleware in `backend/src/middleware/auth.py` to authenticate routes using Clerk session tokens



### CI/CD Pipelines
- [X] T186 Create GitHub Actions build/test pipeline `.github/workflows/ci.yml` running tests, ESLint, and Black/Ruff formatting checks
- [X] T187 Create custom test script for Constitution Check (`backend/scripts/check_constitution.py`) and write `.github/workflows/constitution-check.yml`
- [X] T188 Create deployment workflow `.github/workflows/cd.yml` with pre-deploy Alembic migration hooks and production deployment triggers


### Edge Caching
- [X] T189 Install and configure Redis client (`redis-py` / `aioredis`) connecting to Upstash Redis in `backend/src/config.py`
- [X] T190 Implement thread-safe local in-memory fallback cache (using cachetools) in `backend/src/services/cache_service.py`
- [X] T191 Integrate caching logic into recipe retrieval routes with automatic invalidation on updates in `backend/src/api/recipes.py`


**Checkpoint**: Phase 12 infrastructure complete - system achieves world-class scale with streaming, telemetry, Clerk auth, caching, and CI/CD gates.

---

## Notes

- **[P]** tasks = different files, no dependencies, can run in parallel
- **[Story]** label maps task to specific user story for traceability
- **Each user story should be independently completable and testable**
- **Tests are NOT included** unless explicitly requested in specification
- Verify all Constitution Principle VII, VIII, IX requirements met
- All API endpoints must follow contracts/interactive-openapi.yaml specification
- Chef AI MUST maintain Halal compliance (T131, T170)
- Commit after each task or logical group
- Stop at any checkpoint to validate phase independently
- **Product-System MVP = Phase 8 (Interactive UX) only**

---

## Total Task Count: 191 tasks

- **Phase 1 (Setup)**: 8 tasks ✅ Complete
- **Phase 2 (Foundational)**: 14 tasks ✅ Complete
- **Phase 3 (User Story 1)**: 39 tasks
- **Phase 4 (User Story 2)**: 24 tasks
- **Phase 5 (User Story 3)**: 9 tasks
- **Phase 6 (Polish)**: 13 tasks
- **Phase 7 (Spec v1.1 Implementation)**: 4 tasks
- **Phase 8 (Interactive UX)**: 14 tasks (NEW - Product-System Era)
- **Phase 9 (Chef AI)**: 15 tasks (NEW - Product-System Era)
- **Phase 10 (System Features)**: 20 tasks (NEW - Product-System Era)
- **Phase 11 (Polish & Validation)**: 14 tasks (NEW - Product-System Era)
- **Phase 12 (Version 2.0 World-Class Scale)**: 16 tasks (NEW - Version 2.0.0 Expansion)

**Parallel opportunities identified**: 78 tasks marked with [P] can run in parallel within their phase

**Suggested MVP scope**: Phase 1 + Phase 2 + Phase 3 (61 tasks for RAG-enabled recipe system)

**Product-System Era MVP**: Phase 8 only (14 tasks for Cook Mode, checkboxes, progress tracking)
