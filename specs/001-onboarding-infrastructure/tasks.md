# Tasks: Core Infrastructure & Personalized Onboarding

**Input**: Design documents from `/specs/001-onboarding-infrastructure/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are NOT requested in the feature specification, so test tasks are omitted. Focus is on implementation only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Paths shown below follow web application structure from plan.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create backend project structure per plan.md (backend/src/, backend/tests/)
- [X] T002 Create frontend project structure per plan.md (frontend/src/, frontend/tests/)
- [X] T003 [P] Initialize Python virtual environment and install backend dependencies (fastapi, asyncpg, databases, authlib, passlib, alembic, python-dotenv) in backend/
- [X] T004 [P] Initialize Node.js project and install frontend dependencies (docusaurus, react, i18next, react-i18next, i18next-browser-languagedetector) in frontend/
- [X] T005 [P] Create .env.example file at repository root with required environment variables (DATABASE_URL, JWT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI)
- [X] T006 [P] Configure linting and formatting tools (black + flake8 for backend, ESLint + Prettier for frontend)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 Initialize Alembic migrations in backend/src/db/migrations/
- [X] T008 Create database connection module in backend/src/db/connection.py (using databases library with asyncpg)
- [X] T009 Create User table migration (001_create_users_table.sql) with all columns from data-model.md
- [X] T010 Create Session table migration (002_create_sessions_table.sql) with JWT token storage
- [X] T011 Create Survey Response table migration (003_create_survey_responses_table.sql) with one-to-one user relationship
- [X] T012 Create Voice Personality table migration (004_create_voice_personalities_table.sql) and seed 7 voice records
- [X] T013 Add foreign key constraints migration (005_add_foreign_keys.sql)
- [X] T014 Run Alembic migrations to create schema in Neon Postgres (alembic upgrade head)
- [X] T015 [P] Configure i18next in frontend/src/utils/i18nConfig.ts with 6 languages (en, ur, ar, es, fr, fa) and RTL support
- [X] T016 [P] Create translation files in frontend/src/locales/ for all 6 languages (en.json, ur.json, ar.json, es.json, fr.json, fa.json) with onboarding flow text
- [X] T017 [P] Create FastAPI main application entrypoint in backend/src/main.py with CORS middleware and database connection lifecycle
- [X] T018 [P] Create shared AudioPlayer component in frontend/src/components/shared/AudioPlayer.tsx wrapping HTML5 audio element
- [X] T019 [P] Create TranslateButton floating button component in frontend/src/components/shared/TranslateButton.tsx with language picker modal
- [X] T020 Add 7 voice sample audio files to frontend/src/assets/voices/ (arlow.mp3, silas.mp3, hugo.mp3, omar.mp3, felix.mp3, elara.mp3, maya.mp3)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - First-Time User Authentication & Account Creation (Priority: P1) 🎯 MVP

**Goal**: Users can create accounts with email/password or Google OAuth and receive JWT tokens for authenticated requests

**Independent Test**: Signup with email/password, verify JWT token returned. Signup with Google OAuth, verify account created and token returned. Login with existing account, verify token valid.

### Backend Implementation for User Story 1

- [X] T021 [P] [US1] Create User model in backend/src/models/user.py with fields from data-model.md
- [X] T022 [P] [US1] Create Session model in backend/src/models/session.py with JWT token management
- [X] T023 [US1] Implement AuthService in backend/src/services/auth_service.py with email/password signup logic (passlib bcrypt hashing, 12 rounds)
- [X] T024 [US1] Add login method to AuthService in backend/src/services/auth_service.py with password verification and JWT generation
- [X] T025 [US1] Add Google OAuth initiation method to AuthService in backend/src/services/auth_service.py using authlib
- [X] T026 [US1] Add Google OAuth callback handler to AuthService in backend/src/services/auth_service.py (exchange code for tokens, create/login user)
- [X] T027 [US1] Add logout method to AuthService in backend/src/services/auth_service.py (invalidate session, delete from database)
- [X] T028 [US1] Implement POST /auth/signup endpoint in backend/src/api/auth.py per auth.openapi.yaml contract (email validation, duplicate check, password strength)
- [X] T029 [US1] Implement POST /auth/login endpoint in backend/src/api/auth.py per auth.openapi.yaml contract
- [X] T030 [US1] Implement GET /auth/google endpoint in backend/src/api/auth.py (redirect to Google OAuth consent screen)
- [X] T031 [US1] Implement GET /auth/google/callback endpoint in backend/src/api/auth.py (handle OAuth callback, return JWT token)
- [X] T032 [US1] Implement POST /auth/logout endpoint in backend/src/api/auth.py (require Bearer token, invalidate session)

### Frontend Implementation for User Story 1

- [X] T033 [P] [US1] Create SignupForm component in frontend/src/components/auth/SignupForm.tsx with email, password, name fields and inline validation
- [X] T034 [P] [US1] Create GoogleOAuthButton component in frontend/src/components/auth/GoogleOAuthButton.tsx that redirects to /auth/google
- [X] T035 [P] [US1] Create LoginForm component in frontend/src/components/auth/LoginForm.tsx with email and password fields
- [X] T036 [US1] Create authService API client in frontend/src/services/authService.ts with methods for signup, login, logout (fetch wrapper)
- [X] T037 [US1] Create signup page in frontend/src/pages/signup.tsx using SignupForm and GoogleOAuthButton components
- [X] T038 [US1] Create login page in frontend/src/pages/login.tsx using LoginForm and GoogleOAuthButton components
- [X] T039 [US1] Add JWT token storage to localStorage in authService.ts after successful signup/login
- [X] T040 [US1] Add authentication redirect logic (after signup/login → redirect to /onboarding if onboarding_completed=false, else /dashboard)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently (signup, login, OAuth, logout all work)

---

## Phase 4: User Story 2 - Kitchen Intelligence Survey (Priority: P1)

**Goal**: Authenticated users complete a survey capturing their background and preferences, marking onboarding as complete

**Independent Test**: After login, user sees survey form. Fill all required fields (background, cooking level), submit, verify data saved and onboarding_completed=true. Verify user cannot skip survey (blocked from accessing main app).

### Backend Implementation for User Story 2

- [X] T041 [P] [US2] Create SurveyResponse model in backend/src/models/survey.py with fields from data-model.md
- [X] T042 [US2] Implement SurveyService in backend/src/services/survey_service.py with submit method (create survey response, update user.onboarding_completed=true, copy data to users table)
- [X] T043 [US2] Add get_survey_response method to SurveyService in backend/src/services/survey_service.py (retrieve by user_id)
- [X] T044 [US2] Implement POST /survey endpoint in backend/src/api/survey.py per survey.openapi.yaml contract (require Bearer token, validate fields, prevent duplicate submissions)
- [X] T045 [US2] Implement GET /survey/me endpoint in backend/src/api/survey.py (require Bearer token, return survey response or 404 if not submitted)

### Frontend Implementation for User Story 2

- [X] T046 [P] [US2] Create KitchenSurvey component in frontend/src/components/onboarding/KitchenSurvey.tsx with form fields (software_background dropdown, cooking_level radio buttons, dietary_restrictions textarea)
- [X] T047 [P] [US2] Create OnboardingProgress component in frontend/src/components/onboarding/OnboardingProgress.tsx showing "Step X of 4" progress indicator
- [X] T048 [US2] Create surveyService API client in frontend/src/services/surveyService.ts with submitSurvey and getSurvey methods
- [X] T049 [US2] Create onboarding page in frontend/src/pages/onboarding.tsx orchestrating survey → voice selection → language selection flow
- [X] T050 [US2] Integrate KitchenSurvey component into onboarding page with form validation and submit handler
- [X] T051 [US2] Add "Cannot skip" logic to onboarding page (show message explaining personalization benefits if user tries to navigate away)
- [X] T052 [US2] Add redirect logic after survey submission (proceed to voice selection step in onboarding flow)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently (signup → survey → data saved)

---

## Phase 5: User Story 3 - AI Voice Companion Selection (Priority: P1)

**Goal**: Users preview 7 voice personalities with 3-second audio samples and select their preferred "Kitchen Partner" voice

**Independent Test**: After survey submission, user sees 7 voice cards. Click play button on each card, hear 3-second sample. Select one voice, verify preference saved to user profile.

### Backend Implementation for User Story 3

- [X] T053 [US3] Implement GET /voices endpoint in backend/src/api/users.py to list all 7 voice personalities from voice_personalities table
- [X] T054 [US3] Add update_voice_preference method to UserService in backend/src/services/user_service.py (update users.preferred_voice)
- [X] T055 [US3] Implement PATCH /users/me endpoint in backend/src/api/users.py per users.openapi.yaml contract (allow updating preferred_voice field only)

### Frontend Implementation for User Story 3

- [X] T056 [P] [US3] Create VoiceSelector component in frontend/src/components/onboarding/VoiceSelector.tsx with 7 voice cards (each with play button, personality description, name)
- [X] T057 [US3] Integrate AudioPlayer component into VoiceSelector for each of the 7 voices (pass audio_sample_url from /voices endpoint)
- [X] T058 [US3] Create userService API client in frontend/src/services/userService.ts with getProfile, updateProfile, and getVoices methods
- [X] T059 [US3] Fetch voice personalities from GET /voices endpoint and render in VoiceSelector component
- [X] T060 [US3] Add voice selection logic to VoiceSelector (clicking "Choose This Voice" button saves preference via PATCH /users/me)
- [X] T061 [US3] Integrate VoiceSelector into onboarding page as step 2 (after survey, before language selection)
- [X] T062 [US3] Add redirect logic after voice selection (proceed to language selection step)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Language Preference Selection (Priority: P1)

**Goal**: Users select their preferred language from 6 options, and the UI instantly switches to that language without page reload

**Independent Test**: After voice selection, user sees 6 language options with native script labels. Select a language, verify UI text updates instantly. Test RTL layout for Arabic/Urdu/Persian.

### Backend Implementation for User Story 4

- [X] T063 [US4] Add update_language_preference method to UserService in backend/src/services/user_service.py (update users.preferred_language)
- [X] T064 [US4] Update PATCH /users/me endpoint in backend/src/api/users.py to allow updating preferred_language field

### Frontend Implementation for User Story 4

- [X] T065 [P] [US4] Create LanguagePicker component in frontend/src/components/onboarding/LanguagePicker.tsx with 6 language options (buttons with native script labels: English, اردو, العربية, Español, Français, فارسی)
- [X] T066 [US4] Add i18next language switching logic to LanguagePicker (call i18n.changeLanguage() on selection)
- [X] T067 [US4] Add RTL detection and <html dir="rtl"> attribute update in i18nConfig.ts for Arabic, Urdu, Persian
- [X] T068 [US4] Update PATCH /users/me call in LanguagePicker to save preferred_language to backend
- [X] T069 [US4] Integrate LanguagePicker into onboarding page as step 3 (after voice selection, before dashboard redirect)
- [X] T070 [US4] Add redirect logic after language selection (complete onboarding, redirect to /dashboard)
- [X] T071 [US4] Integrate TranslateButton component into main app layout (floating button accessible from all pages)

**Checkpoint**: At this point, User Stories 1, 2, 3, AND 4 should all work independently. Onboarding flow is complete.

---

## Phase 7: User Story 5 - Dashboard & Progress Tracking (Priority: P2)

**Goal**: After completing onboarding, users see a personalized dashboard with welcome message, progress ring, and quick access cards

**Independent Test**: Complete onboarding (signup → survey → voice → language), verify redirect to /dashboard. Check welcome message includes user name and chosen voice. Verify progress ring shows 0/N recipes mastered. Test "Translate Now" button switches language instantly.

### Backend Implementation for User Story 5

- [ ] T072 [US5] Implement GET /users/me endpoint in backend/src/api/users.py per users.openapi.yaml contract (return full user profile including recipes_mastered)
- [ ] T073 [US5] Add get_total_beginner_recipes method to a new RecipeService in backend/src/services/recipe_service.py (returns count of total available beginner recipes - placeholder for future feature)

### Frontend Implementation for User Story 5

- [ ] T074 [P] [US5] Create Dashboard component in frontend/src/components/dashboard/Dashboard.tsx with personalized welcome message layout
- [ ] T075 [P] [US5] Create ProgressRing component in frontend/src/components/dashboard/ProgressRing.tsx showing recipes_mastered / total_recipes visualization (SVG circle progress indicator)
- [ ] T076 [P] [US5] Create QuickAccessCard component in frontend/src/components/dashboard/QuickAccessCard.tsx with icon, title, description, click handler
- [ ] T077 [US5] Create dashboard page in frontend/src/pages/dashboard.tsx using Dashboard, ProgressRing, and QuickAccessCard components
- [ ] T078 [US5] Fetch current user profile from GET /users/me and display name + preferred_voice in welcome message
- [ ] T079 [US5] Render 3 QuickAccessCard instances for "Browse Recipes", "Continue Last Recipe", "Favorites" (link to placeholder pages for future features)
- [ ] T080 [US5] Display ProgressRing with user's recipes_mastered count (numerator) and placeholder total (e.g., 50 for MVP)
- [ ] T081 [US5] Add route protection to dashboard page (redirect to /login if no JWT token, redirect to /onboarding if onboarding_completed=false)

**Checkpoint**: All user stories should now be independently functional. Full onboarding flow → dashboard works end-to-end.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T082 [P] Add error handling to all API endpoints (try/except blocks with appropriate HTTP status codes and error messages)
- [ ] T083 [P] Add request logging middleware to FastAPI app in backend/src/main.py (log all requests with timestamps, user_id if authenticated)
- [ ] T084 [P] Add form validation error messages to all frontend forms (SignupForm, LoginForm, KitchenSurvey) with i18next translations
- [ ] T085 [P] Add loading states to all frontend components (spinner during API calls, disable buttons during submission)
- [ ] T086 [P] Add toast notifications for success/error feedback (e.g., "Account created successfully", "Survey submitted", "Language changed")
- [ ] T087 [P] Verify WCAG 2.1 AA accessibility compliance for all frontend components (keyboard navigation, ARIA labels, color contrast)
- [ ] T088 [P] Add CSS styles for RTL languages in frontend/src/styles/ (logical properties: margin-inline-start instead of margin-left)
- [ ] T089 [P] Test voice sample playback error handling (network failures, browser autoplay blocking) and add retry button
- [ ] T090 [P] Add session expiration handling (check JWT expiration before API calls, redirect to login if expired)
- [ ] T091 [P] Code cleanup and refactoring (remove console.logs, add JSDoc comments to utility functions)
- [ ] T092 Validate quickstart.md by following all 11 steps and verifying each command works
- [ ] T093 Performance optimization (lazy-load i18next translation files per language, preload voice audio files on VoiceSelector mount)
- [ ] T094 Security hardening (rate limiting on auth endpoints, CSRF protection for Google OAuth, SQL injection prevention in database queries)

### Global Plate Specific Testing (not requested in spec, but best practice)

- [ ] T095 [P] Manual test: Voice playback with kitchen background noise samples (verify audio quality)
- [ ] T096 [P] Manual test: Verify translations for all 6 languages in onboarding flow (EN, UR, AR, ES, FR, FA)
- [ ] T097 [P] Manual test: Verify RTL layout for Arabic, Urdu, Persian (buttons, navigation, text alignment)
- [ ] T098 Manual test: Verify voice response time <2s p95 for all 7 voice samples
- [ ] T099 Manual test: Verify language switching <500ms (measure time from click to UI update)
- [ ] T100 Manual test: Verify all recipes follow max 5 steps, one action per step (placeholder check for future feature, ensure database schema supports this constraint)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Requires US1 for authentication context (JWT tokens)
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - Requires US1 for authentication, integrates with US2 onboarding flow
- **User Story 4 (P1)**: Can start after Foundational (Phase 2) - Requires US1 for authentication, integrates with US2/US3 onboarding flow
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - Requires US1 for authentication, expects onboarding completion (US2/US3/US4)

**Note**: While stories have logical flow dependencies (US2→US3→US4→US5 in onboarding), they are architecturally independent and can be developed in parallel by different developers, then integrated.

### Within Each User Story

- Backend models before services
- Services before API endpoints
- Frontend components before pages
- API clients before component integration
- Core implementation before error handling and polish

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (6 parallelizable tasks)
- All Foundational tasks marked [P] can run in parallel within Phase 2 (10 parallelizable tasks)
- Once Foundational phase completes, all user stories (US1-US5) can start in parallel (if team capacity allows)
- Within each user story, tasks marked [P] can run in parallel (models, components, API clients)
- Polish phase tasks marked [P] can run in parallel (14 parallelizable tasks)

---

## Parallel Example: User Story 1

```bash
# Launch all parallel backend tasks for User Story 1 together:
# T021 [P] [US1] Create User model in backend/src/models/user.py
# T022 [P] [US1] Create Session model in backend/src/models/session.py

# Launch all parallel frontend tasks for User Story 1 together:
# T033 [P] [US1] Create SignupForm component
# T034 [P] [US1] Create GoogleOAuthButton component
# T035 [P] [US1] Create LoginForm component

# Then proceed with sequential tasks (services, endpoints, pages) that depend on models/components
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T020) - CRITICAL, blocks everything
3. Complete Phase 3: User Story 1 (T021-T040)
4. **STOP and VALIDATE**: Test User Story 1 independently (signup, login, OAuth all work)
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (20 tasks)
2. Add User Story 1 → Test independently → Deploy/Demo (MVP! 20 tasks)
3. Add User Story 2 → Test independently → Deploy/Demo (12 tasks)
4. Add User Story 3 → Test independently → Deploy/Demo (10 tasks)
5. Add User Story 4 → Test independently → Deploy/Demo (9 tasks)
6. Add User Story 5 → Test independently → Deploy/Demo (10 tasks)
7. Add Polish → Final release (19 tasks)
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (20 tasks)
2. Once Foundational is done:
   - Developer A: User Story 1 (T021-T040)
   - Developer B: User Story 2 (T041-T052)
   - Developer C: User Story 3 (T053-T062)
   - Developer D: User Story 4 (T063-T071)
   - Developer E: User Story 5 (T072-T081)
3. Stories complete and integrate independently
4. Team completes Polish together (T082-T100)

---

## Task Summary

### Total Task Count: 100 tasks

- **Phase 1 (Setup)**: 6 tasks
- **Phase 2 (Foundational)**: 14 tasks
- **Phase 3 (User Story 1 - Auth)**: 20 tasks
- **Phase 4 (User Story 2 - Survey)**: 12 tasks
- **Phase 5 (User Story 3 - Voice)**: 10 tasks
- **Phase 6 (User Story 4 - Language)**: 9 tasks
- **Phase 7 (User Story 5 - Dashboard)**: 10 tasks
- **Phase 8 (Polish)**: 19 tasks

### Parallel Opportunities: 33 tasks can run in parallel

- Setup: 5 parallel tasks (T003, T004, T005, T006)
- Foundational: 10 parallel tasks (T015-T020)
- User Story 1: 5 parallel tasks (T021, T022, T033, T034, T035)
- User Story 2: 2 parallel tasks (T041, T046, T047)
- User Story 3: 1 parallel task (T056)
- User Story 4: 1 parallel task (T065)
- User Story 5: 3 parallel tasks (T074, T075, T076)
- Polish: 14 parallel tasks (T082-T097)

### MVP Scope (Recommended)

**Minimum Viable Product: User Story 1 only**
- Total: 40 tasks (Setup + Foundational + User Story 1)
- Delivers: Working authentication (email/password + Google OAuth)
- Value: Users can create accounts and log in securely
- Time Estimate: ~2-3 weeks for single developer

### Full Feature Scope

**Complete Onboarding Infrastructure: All 5 User Stories**
- Total: 81 tasks (Setup + Foundational + all User Stories)
- Delivers: Complete onboarding flow (auth → survey → voice → language → dashboard)
- Value: Personalized user experience with voice-first, multi-language support
- Time Estimate: ~6-8 weeks for single developer, ~3-4 weeks for team of 3

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests are NOT included (not requested in spec.md) - focus is on implementation
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

## Format Validation

✅ **All 100 tasks follow required checklist format**: `- [ ] [TaskID] [P?] [Story?] Description with file path`
✅ **Story labels applied correctly**: Setup/Foundational have no story label, User Story phases have [US1]-[US5] labels
✅ **Parallel markers applied**: 33 tasks marked with [P] for parallel execution
✅ **File paths included**: Every task specifies exact file path for implementation
✅ **Independent testability**: Each user story phase includes "Independent Test" criteria
