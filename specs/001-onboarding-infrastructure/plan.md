# Implementation Plan: Core Infrastructure & Personalized Onboarding

**Branch**: `001-onboarding-infrastructure` | **Date**: 2025-12-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-onboarding-infrastructure/spec.md`

## Summary

This plan implements the foundational authentication and personalization infrastructure for Global Plate. Users will authenticate via Better-Auth (email/password or Google OAuth), complete a Kitchen Intelligence Survey capturing their background and preferences, select an AI voice companion from 7 personalities, choose their preferred language from 6 options, and land on a personalized dashboard. The technical approach uses Docusaurus (React) for the frontend, FastAPI for the backend API, Neon Postgres for user data storage, HTML5 Audio for voice samples, and a utility function for personalization metaphors.

## Technical Context

**Language/Version**: TypeScript 5.x (frontend), Python 3.11+ (backend)
**Primary Dependencies**: Docusaurus 3.x, React 18+, Better-Auth 2.x, FastAPI 0.100+, Neon Postgres, i18next (internationalization)
**Storage**: Neon Serverless Postgres (user profiles, sessions, survey responses)
**Testing**: Jest + React Testing Library (frontend), pytest (backend), Playwright (E2E)
**Target Platform**: Web (desktop + mobile browsers), deployed via GitHub Pages (frontend), cloud hosting for FastAPI backend
**Project Type**: Web application (frontend + backend)
**Performance Goals**: <500ms language switching, <2s voice sample playback, <3s dashboard load on 3G, 99.9% auth uptime
**Constraints**: Must support 6 languages (EN, UR, AR, ES, FR, FA) with RTL for Arabic/Urdu/Persian, WCAG 2.1 AA accessibility, mobile-responsive design
**Scale/Scope**: MVP targeting 10k initial users, extensible to 100k+ users with horizontal scaling

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Review against Global Plate Constitution principles:

- [x] **Accessibility-First**: ✅ Supports voice output (HTML5 Audio for 7 voice samples), all 6 languages via i18next with instant switching, RTL support for Arabic/Urdu/Persian
- [x] **Beginner-Centric**: ✅ Onboarding flow is linear (max 4-5 screens), each step has single clear action (e.g., "Choose Email or Google" → "Fill Survey" → "Select Voice" → "Pick Language" → "View Dashboard")
- [x] **Safety Mandatory**: ✅ Not applicable - this feature handles authentication/onboarding, no cooking instructions or Kitchen Guard needed
- [x] **Tech Stack Discipline**: ✅ Follows defined stack: Docusaurus (React frontend), FastAPI (backend), Neon Postgres (database), Better-Auth (authentication)
- [x] **Multi-Modal Excellence**: ✅ Voice output (audio samples for 7 personalities), visual components (form fields with icons, progress indicators, voice selection cards with personality descriptions)
- [x] **Personalization Required**: ✅ Better-Auth captures user profile data via Kitchen Intelligence Survey, utility function maps software background to cooking metaphors for later use

**Deviations**: None. All constitutional principles are satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/001-onboarding-infrastructure/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   ├── auth.openapi.yaml
│   ├── users.openapi.yaml
│   └── survey.openapi.yaml
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   ├── user.py          # User entity with Better-Auth integration
│   │   ├── session.py       # Session management
│   │   └── survey.py        # Survey response entity
│   ├── services/
│   │   ├── auth_service.py  # Better-Auth wrapper for email/password + OAuth
│   │   ├── user_service.py  # User CRUD operations
│   │   └── survey_service.py # Survey data capture and retrieval
│   ├── api/
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── users.py         # User profile endpoints
│   │   └── survey.py        # Survey endpoints
│   ├── db/
│   │   ├── connection.py    # Neon Postgres connection management
│   │   └── migrations/      # Database schema migrations
│   └── main.py              # FastAPI app entrypoint
└── tests/
    ├── contract/            # OpenAPI contract tests
    ├── integration/         # API integration tests
    └── unit/                # Service/model unit tests

frontend/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── SignupForm.tsx      # Email/password signup form
│   │   │   ├── GoogleOAuthButton.tsx # Google OAuth button
│   │   │   └── LoginForm.tsx       # Login form
│   │   ├── onboarding/
│   │   │   ├── KitchenSurvey.tsx   # Survey form component
│   │   │   ├── VoiceSelector.tsx   # Voice selection cards with audio samples
│   │   │   ├── LanguagePicker.tsx  # Language selection component
│   │   │   └── OnboardingProgress.tsx # Progress indicator (Step X of Y)
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx       # Main dashboard container
│   │   │   ├── ProgressRing.tsx    # Recipes mastered visualization
│   │   │   └── QuickAccessCard.tsx # Browse/Continue/Favorites cards
│   │   └── shared/
│   │       ├── TranslateButton.tsx # Floating "Translate Now" button
│   │       └── AudioPlayer.tsx     # HTML5 Audio wrapper component
│   ├── pages/
│   │   ├── signup.tsx              # Signup page
│   │   ├── login.tsx               # Login page
│   │   ├── onboarding.tsx          # Onboarding flow orchestrator
│   │   └── dashboard.tsx           # Dashboard page
│   ├── services/
│   │   ├── authService.ts          # API client for auth endpoints
│   │   ├── userService.ts          # API client for user endpoints
│   │   └── surveyService.ts        # API client for survey endpoints
│   ├── utils/
│   │   ├── metaphorMapper.ts       # Maps software background to cooking metaphors
│   │   └── i18nConfig.ts           # i18next configuration for 6 languages
│   ├── locales/                    # Translation files
│   │   ├── en.json
│   │   ├── ur.json
│   │   ├── ar.json
│   │   ├── es.json
│   │   ├── fr.json
│   │   └── fa.json
│   └── assets/
│       └── voices/                 # 3-second voice sample audio files
│           ├── arlow.mp3
│           ├── silas.mp3
│           ├── hugo.mp3
│           ├── omar.mp3
│           ├── felix.mp3
│           ├── elara.mp3
│           └── maya.mp3
└── tests/
    ├── components/                 # Component unit tests
    ├── e2e/                        # Playwright E2E tests
    └── integration/                # API integration tests

.env.example                        # Environment variable template
```

**Structure Decision**: Web application structure selected because the feature involves a React-based frontend (Docusaurus) and a separate FastAPI backend. Frontend handles UI/UX (forms, voice selection, dashboard), backend handles authentication, database operations, and API logic. This separation enables independent scaling and deployment.

## Complexity Tracking

> **No violations** - Constitution Check passed all principles.

## Phase 0: Research & Resolution

### Research Topics

1. **Better-Auth Integration with FastAPI**
   - How to configure Better-Auth for email/password + Google OAuth in a Python/FastAPI backend
   - Session management strategy (JWT tokens vs server-side sessions)
   - Neon Postgres schema requirements for Better-Auth

2. **Neon Postgres Connection Patterns**
   - Best practices for serverless Postgres connections in FastAPI
   - Connection pooling configuration for Neon
   - Migration strategy (Alembic vs raw SQL)

3. **i18next Configuration for 6 Languages**
   - How to configure i18next for EN, UR, AR, ES, FR, FA in Docusaurus/React
   - RTL language support (Arabic, Urdu, Persian) in React
   - Language switching without page reload

4. **HTML5 Audio in React Best Practices**
   - How to implement audio playback controls in React components
   - Preloading audio files for fast playback
   - Handling audio playback failures and browser autoplay policies

5. **Personalization Metaphor Utility Function**
   - Design pattern for mapping software backgrounds to cooking term metaphors
   - Extensibility for adding new backgrounds and metaphors
   - Integration with RAG system (future feature)

### Research Output

**Decision 1: Better-Auth + FastAPI Integration**
- **Rationale**: Better-Auth is a TypeScript/Node.js library, not Python-compatible. We'll use **FastAPI native authentication** with OAuth2 via `python-social-auth` or `authlib` for Google OAuth, and manual email/password handling with `passlib` for hashing.
- **Alternatives Considered**: Better-Auth requires Node.js backend. Alternatives: Auth0 (SaaS, adds dependency), Firebase Auth (adds GCP dependency), FastAPI native (full control, no external dependencies).
- **Chosen Approach**: FastAPI native with `authlib` for OAuth2 and `passlib` for password hashing. Store user sessions in Neon Postgres with JWT tokens.

**Decision 2: Neon Postgres Connection**
- **Rationale**: Neon Postgres is a serverless Postgres-compatible database. Use `asyncpg` driver for FastAPI async operations. Connection pooling managed via `databases` library.
- **Alternatives Considered**: `psycopg2` (sync only, not async), SQLAlchemy ORM (adds abstraction layer), raw `asyncpg` (more control).
- **Chosen Approach**: `databases` library with `asyncpg` backend for async connection pooling. Migrations via Alembic for schema versioning.

**Decision 3: i18next Configuration**
- **Rationale**: i18next is the de facto standard for React internationalization. Supports RTL via `dir` attribute and CSS. Language switching handled via React Context + localStorage for persistence.
- **Alternatives Considered**: react-intl (more boilerplate), native browser i18n (limited control), custom solution (reinventing wheel).
- **Chosen Approach**: i18next with `react-i18next` bindings. Translation files in `/locales/` directory. RTL languages auto-detected and applied via `<html dir="rtl">`.

**Decision 4: HTML5 Audio in React**
- **Rationale**: HTML5 `<audio>` element is native, no external libraries needed. Wrap in React component with useRef hook for playback control.
- **Alternatives Considered**: Howler.js (adds 30KB), react-player (overkill for simple audio), Web Audio API (low-level, more complexity).
- **Chosen Approach**: Custom `AudioPlayer.tsx` component wrapping `<audio>` element with play/pause/retry logic. Preload audio files via `preload="auto"` attribute.

**Decision 5: Personalization Metaphor Utility**
- **Rationale**: Simple mapping function is sufficient for MVP. Store mappings in JSON file for easy editing. Future: integrate with RAG system for dynamic metaphor generation.
- **Alternatives Considered**: Database-stored mappings (adds DB queries), hardcoded mappings (not extensible), AI-generated metaphors (requires LLM call, adds latency).
- **Chosen Approach**: `metaphorMapper.ts` utility function with JSON file storing `{ software_background: string, cooking_term: string, metaphor: string }[]`. Example: `{ software_background: "Developer", cooking_term: "Sauté", metaphor: "Sauté is like running a watch loop—constant attention prevents burning" }`.

## Phase 1: Data Model & Contracts

### Data Model

**See [data-model.md](./data-model.md) for full entity definitions.**

Key entities:
- **User**: Authentication credentials, profile data (name, software_background, hardware_background, cooking_level, dietary_restrictions, preferred_voice, preferred_language), progress tracking
- **Session**: JWT token, user_id, expiration, device info
- **Survey Response**: One-to-one with User, captures all onboarding survey data
- **Voice Personality**: Reference data for 7 voice options (not user-specific)

### API Contracts

**See [contracts/](./contracts/) directory for full OpenAPI specifications.**

Key endpoints:
- `POST /auth/signup` - Email/password signup
- `POST /auth/login` - Email/password login
- `GET /auth/google` - Google OAuth initiation
- `GET /auth/google/callback` - Google OAuth callback
- `POST /auth/logout` - Logout (invalidate session)
- `GET /users/me` - Get current user profile
- `PATCH /users/me` - Update user profile (voice, language preferences)
- `POST /survey` - Submit Kitchen Intelligence Survey
- `GET /survey/me` - Retrieve user's survey response
- `GET /voices` - List all 7 voice personalities with metadata

### Quickstart

**See [quickstart.md](./quickstart.md) for step-by-step developer setup guide.**

High-level steps:
1. Clone repo and checkout `001-onboarding-infrastructure` branch
2. Set up Neon Postgres database and configure `.env`
3. Run Alembic migrations to create schema
4. Start FastAPI backend (`uvicorn main:app --reload`)
5. Install frontend dependencies and configure i18next locales
6. Start Docusaurus dev server (`npm run start`)
7. Test signup flow, survey completion, voice selection, language switching

## Phase 2: Task Breakdown

**Tasks are generated via `/sp.tasks` command (NOT part of this planning phase).**

Expected task categories:
- Setup: Initialize project structure, configure dependencies
- Foundational: Database schema, authentication middleware, i18n setup
- User Story 1: Signup/login components, auth API endpoints
- User Story 2: Survey form component, survey API endpoints
- User Story 3: Voice selector component, audio playback
- User Story 4: Language picker component, i18next integration
- User Story 5: Dashboard component, progress ring visualization
- Polish: E2E tests, accessibility audits, performance optimization

## Risk Analysis

### High Priority Risks

1. **Risk**: Google OAuth setup complexity in FastAPI
   - **Mitigation**: Use `authlib` library with comprehensive docs. Allocate extra time for OAuth flow testing.
   - **Blast Radius**: Blocks P1 User Story 1 (authentication)
   - **Kill Switch**: Provide email/password fallback if OAuth fails

2. **Risk**: Translation quality for 6 languages (especially Urdu, Persian, Arabic)
   - **Mitigation**: Use professional translation service, not machine translation. Review with native speakers.
   - **Blast Radius**: Affects P1 User Story 4 (language selection) and all UI text
   - **Guardrail**: Launch with English-only if translations not ready, add languages incrementally

3. **Risk**: Voice sample audio files not provided before implementation
   - **Mitigation**: Coordinate with content team early. Use placeholder samples for development.
   - **Blast Radius**: Blocks P1 User Story 3 (voice selection)
   - **Kill Switch**: Defer voice selection to post-MVP if samples unavailable

### Medium Priority Risks

4. **Risk**: RTL language support breaks layout for Arabic/Urdu/Persian
   - **Mitigation**: Test RTL languages early and often. Use CSS logical properties (`margin-inline-start` vs `margin-left`).
   - **Blast Radius**: Affects UI usability for Arabic/Urdu/Persian users
   - **Guardrail**: Add visual regression tests for RTL layouts

5. **Risk**: Neon Postgres connection limits reached under load
   - **Mitigation**: Configure connection pooling with max connections limit. Monitor database metrics.
   - **Blast Radius**: Could cause authentication failures under high traffic
   - **Kill Switch**: Scale to dedicated Postgres instance if Neon serverless insufficient

## Architectural Decision Records (ADR)

### ADR Suggestions

📋 **Architectural decision detected: FastAPI Native Auth vs Better-Auth**
   - **Context**: Better-Auth is TypeScript/Node.js only, not Python-compatible. Need alternative for FastAPI backend.
   - **Decision**: Use FastAPI native authentication with `authlib` for OAuth2 and `passlib` for password hashing.
   - **Tradeoffs**: More implementation work vs full control and no Node.js dependency.
   - **Document reasoning and tradeoffs?** Run `/sp.adr fastapi-native-authentication`

📋 **Architectural decision detected: Metaphor Mapping Strategy**
   - **Context**: Need utility function to map software backgrounds to cooking term metaphors for personalization.
   - **Decision**: Use JSON file with static mappings, utility function reads and returns metaphors.
   - **Tradeoffs**: Simple MVP approach vs dynamic AI-generated metaphors (requires LLM integration, adds latency).
   - **Document reasoning and tradeoffs?** Run `/sp.adr metaphor-mapping-strategy`

## Next Steps

1. **Review this plan** for accuracy and completeness
2. **Generate tasks** via `/sp.tasks` command
3. **Create ADRs** for the 2 significant decisions above (optional but recommended)
4. **Begin implementation** following task breakdown
5. **Re-validate Constitution Check** after User Story 1 implementation to ensure principles are upheld in code

## Notes

- **Better-Auth Clarification**: Original spec mentioned Better-Auth, but it's TypeScript/Node.js only. Switched to FastAPI native auth for Python backend compatibility. User can override this decision if Node.js backend is preferred.
- **Metaphor Utility**: Implemented as simple JSON mapping for MVP. Future enhancement: integrate with RAG system for dynamic AI-generated metaphors.
- **Voice Samples**: Coordinate with content team to provide 7 voice sample audio files (3 seconds each) before frontend implementation begins.
- **Translation Files**: Professional translation service recommended for i18next locale files. Machine translation requires native speaker review.
