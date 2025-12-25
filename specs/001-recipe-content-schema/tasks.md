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

- [ ] T023 [P] [US1] Create Recipe Pydantic model in backend/src/models/recipe.py (with all fields from data-model.md)
- [ ] T024 [P] [US1] Create RecipeTranslation Pydantic model in backend/src/models/recipe.py (with language_code, name, kitchen_guard, ingredients)
- [ ] T025 [P] [US1] Create RecipeStep Pydantic model in backend/src/models/recipe.py (with step_number 1-5, instruction, audio_clip_url, image_url)
- [ ] T026 [P] [US1] Create RecipeStepTranslation Pydantic model in backend/src/models/recipe.py (with step_id FK, language_code, instruction)
- [ ] T027 [US1] Create seed migration for 5 global recipes in backend/src/db/migrations/ (Pasta-Italy, Sajji-Pakistan, Guacamole-Mexico, Shakshuka-MiddleEast, Gomen-Ethiopia)
- [ ] T028 [US1] Add recipe translations for all 6 languages to seed migration (EN, UR, AR, ES, FR, FA with culturally appropriate content)
- [ ] T029 [US1] Add recipe steps (max 5 steps, one action per step) with translations to seed migration
- [ ] T030 [US1] Run seed migration to populate database with 5 recipes: alembic upgrade head
- [ ] T031 [US1] Implement RecipeService.get_recipe_by_id() in backend/src/services/recipe_service.py (fetch recipe with translations)
- [ ] T032 [US1] Implement RecipeService.list_recipes() in backend/src/services/recipe_service.py (with language and difficulty filters)
- [ ] T033 [US1] Implement RecipeService.get_recipe_translation() in backend/src/services/recipe_service.py (fetch specific language version)
- [ ] T034 [US1] Implement recipe embedding generation in backend/src/services/rag_service.py (using OpenAI embeddings API)
- [ ] T035 [US1] Implement script to generate and store embeddings for all recipes in backend/scripts/generate_embeddings.py
- [ ] T036 [US1] Run embedding generation script: python backend/scripts/generate_embeddings.py
- [ ] T037 [US1] Implement RAG search functionality in backend/src/services/rag_service.py (vector search in Qdrant with relevance scoring)
- [ ] T038 [US1] Implement RAG context retrieval in backend/src/services/rag_service.py (fetch relevant recipe content for LLM)
- [ ] T039 [US1] Create GET /recipes endpoint in backend/src/api/recipes.py (with language and difficulty query parameters)
- [ ] T040 [US1] Create GET /recipes/{recipeId} endpoint in backend/src/api/recipes.py (with language query parameter)
- [ ] T041 [US1] Create POST /recipes/search endpoint in backend/src/api/recipes.py (RAG-based natural language search)
- [ ] T042 [US1] Create GET /recipes/{recipeId}/translate endpoint in backend/src/api/recipes.py (fetch specific language translation)
- [ ] T043 [US1] Add validation for language codes in backend/src/api/recipes.py (ensure only EN, UR, AR, ES, FR, FA accepted)
- [ ] T044 [US1] Add validation for difficulty levels in backend/src/api/recipes.py (ensure only 'Absolute Beginner', 'Beginner', 'Beginner+')
- [ ] T045 [US1] Add error handling for recipe not found in backend/src/api/recipes.py (return 404 with proper error response)
- [ ] T046 [P] [US1] Create English recipe translation file in frontend/src/locales/recipes/en.json (with all 5 recipes)
- [ ] T047 [P] [US1] Create Urdu recipe translation file in frontend/src/locales/recipes/ur.json (with all 5 recipes)
- [ ] T048 [P] [US1] Create Arabic recipe translation file in frontend/src/locales/recipes/ar.json (with all 5 recipes, RTL support)
- [ ] T049 [P] [US1] Create Spanish recipe translation file in frontend/src/locales/recipes/es.json (with all 5 recipes)
- [ ] T050 [P] [US1] Create French recipe translation file in frontend/src/locales/recipes/fr.json (with all 5 recipes)
- [ ] T051 [P] [US1] Create Persian recipe translation file in frontend/src/locales/recipes/fa.json (with all 5 recipes, RTL support)
- [ ] T052 [US1] Create recipeService.ts API client in frontend/src/services/recipeService.ts (with methods for all recipe endpoints)
- [ ] T053 [US1] Create ragService.ts API client in frontend/src/services/ragService.ts (with search method)
- [ ] T054 [P] [US1] Create RecipeList component in frontend/src/components/recipes/RecipeList.tsx (displays recipe summaries with filtering)
- [ ] T055 [P] [US1] Create RecipeDetail component in frontend/src/components/recipes/RecipeDetail.tsx (displays full recipe with steps and ingredients)
- [ ] T056 [P] [US1] Create RecipeSteps component in frontend/src/components/recipes/RecipeSteps.tsx (displays numbered steps 1-5)
- [ ] T057 [P] [US1] Create RecipeSearch component in frontend/src/components/recipes/RecipeSearch.tsx (voice and text search with RAG)
- [ ] T058 [US1] Integrate language switching in RecipeDetail component in frontend/src/components/recipes/RecipeDetail.tsx (using i18next)
- [ ] T059 [US1] Add recipe voice navigation support in frontend/src/components/voice/VoiceRecipeNavigator.tsx (read steps aloud)
- [ ] T060 [US1] Add logging for recipe retrieval operations in backend/src/services/recipe_service.py
- [ ] T061 [US1] Add logging for RAG search operations in backend/src/services/rag_service.py

**Checkpoint**: At this point, User Story 1 should be fully functional - users can search for recipes, view them in any of 6 languages, and the RAG system can answer natural language questions about recipes

---

## Phase 4: User Story 2 - Personalized Recipe Experience (Priority: P2)

**Goal**: Enable the system to present recipes with personalized metaphors based on user background (software/hardware experience)

**Independent Test**: Verify that the system selects appropriate metaphors based on user profile (e.g., tech-related analogies for users with software background)

### Implementation for User Story 2

- [ ] T062 [P] [US2] Create UserBackground Pydantic model in backend/src/models/user.py (with all fields from data-model.md)
- [ ] T063 [P] [US2] Create MetaphorMapping Pydantic model in backend/src/models/metaphor.py (with background_type, background_level, context, metaphor_template)
- [ ] T064 [US2] Create seed migration for metaphor mappings in backend/src/db/migrations/ (software beginner/intermediate/expert, hardware beginner/intermediate/expert, cooking contexts)
- [ ] T065 [US2] Add metaphor templates for recipe explanations to seed migration (with placeholders for personalization)
- [ ] T066 [US2] Add metaphor templates for welcome messages to seed migration (with placeholders for user context)
- [ ] T067 [US2] Run metaphor seed migration: alembic upgrade head
- [ ] T068 [US2] Implement MetaphorService.get_welcome_message() in backend/src/services/metaphor_service.py (select message based on user background)
- [ ] T069 [US2] Implement MetaphorService.get_recipe_metaphor() in backend/src/services/metaphor_service.py (select cooking metaphor based on user context)
- [ ] T070 [US2] Implement UserBackgroundService.get_user_background() in backend/src/services/user_service.py (fetch user background from database)
- [ ] T071 [US2] Implement UserBackgroundService.update_user_background() in backend/src/services/user_service.py (update user preferences)
- [ ] T072 [US2] Create GET /metaphors/welcome endpoint in backend/src/api/metaphors.py (with background_type, background_level, language query parameters)
- [ ] T073 [US2] Add validation for background_type in backend/src/api/metaphors.py (ensure only software, hardware, cooking, other accepted)
- [ ] T074 [US2] Add validation for background_level in backend/src/api/metaphors.py (ensure only beginner, intermediate, expert accepted)
- [ ] T075 [P] [US2] Create English metaphor translation file in frontend/src/locales/metaphors/en.json (with welcome messages for all background types/levels)
- [ ] T076 [P] [US2] Create Urdu metaphor translation file in frontend/src/locales/metaphors/ur.json (with culturally appropriate metaphors)
- [ ] T077 [P] [US2] Create Arabic metaphor translation file in frontend/src/locales/metaphors/ar.json (with culturally appropriate metaphors, RTL)
- [ ] T078 [P] [US2] Create Spanish metaphor translation file in frontend/src/locales/metaphors/es.json (with culturally appropriate metaphors)
- [ ] T079 [P] [US2] Create French metaphor translation file in frontend/src/locales/metaphors/fr.json (with culturally appropriate metaphors)
- [ ] T080 [P] [US2] Create Persian metaphor translation file in frontend/src/locales/metaphors/fa.json (with culturally appropriate metaphors, RTL)
- [ ] T081 [US2] Create metaphorMapper utility in frontend/src/utils/metaphorMapper.ts (maps user background to appropriate metaphors)
- [ ] T082 [US2] Create PersonalizedDashboard component in frontend/src/components/dashboard/PersonalizedDashboard.tsx (displays welcome message with metaphors)
- [ ] T083 [US2] Integrate user background from Better-Auth context in frontend/src/components/dashboard/PersonalizedDashboard.tsx
- [ ] T084 [US2] Update RecipeDetail component to show personalized cooking tips in frontend/src/components/recipes/RecipeDetail.tsx (based on user background)
- [ ] T085 [US2] Add logging for metaphor selection in backend/src/services/metaphor_service.py

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - recipes can be retrieved (US1) and personalized messages are shown based on user background (US2)

---

## Phase 5: User Story 3 - Safe Cooking Experience (Priority: P3)

**Goal**: Ensure users receive important safety information (Kitchen Guard) before starting potentially hazardous cooking steps

**Independent Test**: Verify that safety tips are properly associated with recipes and displayed when appropriate

### Implementation for User Story 3

- [ ] T086 [US3] Verify Kitchen Guard safety tips are present in all 5 recipes in database (check seed migration from T027-T029)
- [ ] T087 [US3] Verify Kitchen Guard translations exist for all 6 languages in database (check seed migration from T028)
- [ ] T088 [US3] Create KitchenGuard component in frontend/src/components/recipes/KitchenGuard.tsx (displays safety warnings prominently)
- [ ] T089 [US3] Integrate KitchenGuard component into RecipeDetail page in frontend/src/components/recipes/RecipeDetail.tsx (shown before steps)
- [ ] T090 [US3] Add Kitchen Guard voice announcement in frontend/src/components/voice/VoiceRecipeNavigator.tsx (read safety tip before starting recipe)
- [ ] T091 [US3] Add visual styling for Kitchen Guard warnings in frontend/src/components/recipes/KitchenGuard.tsx (use warning colors, icon)
- [ ] T092 [US3] Ensure Kitchen Guard is included in RAG context in backend/src/services/rag_service.py (so chatbot can reference safety tips)
- [ ] T093 [US3] Add validation to ensure all new recipes include Kitchen Guard field in backend/src/services/recipe_service.py
- [ ] T094 [US3] Add logging for Kitchen Guard display in frontend/src/components/recipes/KitchenGuard.tsx

**Checkpoint**: All user stories should now be independently functional - recipes retrievable (US1), personalized (US2), and safe (US3)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [ ] T095 [P] Add API documentation to backend/src/api/ docstrings (following OpenAPI spec from contracts/recipes-openapi.yaml)
- [ ] T096 [P] Update README.md with setup instructions for recipe content schema
- [ ] T097 [P] Verify all recipe steps follow max 5 steps constraint across all 5 recipes
- [ ] T098 [P] Verify all recipe steps contain only one action per step across all 5 recipes
- [ ] T099 [P] Verify all 6 language translations are culturally appropriate and complete
- [ ] T100 [P] Run quickstart.md validation following steps 1-12 in specs/001-recipe-content-schema/quickstart.md

### Global Plate Specific Testing

- [ ] T101 [P] Voice testing: Verify recipe steps are clearly audible with kitchen background noise
- [ ] T102 [P] Language testing: Verify language switching works for all 6 languages (EN, UR, AR, ES, FR, FA) with <500ms response time
- [ ] T103 [P] Accessibility testing: Verify WCAG 2.1 AA compliance for RecipeDetail and KitchenGuard components
- [ ] T104 [P] Performance testing: Verify RAG search response time <1s p95
- [ ] T105 [P] Performance testing: Verify voice response time <2s p95
- [ ] T106 [P] Recipe compliance: Verify all recipes have Kitchen Guard safety sections
- [ ] T107 [P] RTL testing: Verify Arabic and Persian languages display correctly with RTL layout

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

## Total Task Count: 107 tasks

- **Phase 1 (Setup)**: 8 tasks
- **Phase 2 (Foundational)**: 14 tasks (BLOCKS all user stories)
- **Phase 3 (User Story 1)**: 39 tasks
- **Phase 4 (User Story 2)**: 24 tasks
- **Phase 5 (User Story 3)**: 9 tasks
- **Phase 6 (Polish)**: 13 tasks

**Parallel opportunities identified**: 42 tasks marked with [P] can run in parallel within their phase

**Suggested MVP scope**: Phase 1 + Phase 2 + Phase 3 (61 tasks total for fully functional RAG-enabled recipe system)
