---
id: 0002
title: Onboarding Infrastructure Plan Created
stage: plan
date: 2025-12-22
surface: agent
model: claude-sonnet-4-5
feature: 001-onboarding-infrastructure
branch: 001-onboarding-infrastructure
user: Salman Hassan
command: /sp.plan
labels: ["plan", "architecture", "design", "onboarding", "fastapi", "react", "neon-postgres"]
links:
  spec: specs/001-onboarding-infrastructure/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-onboarding-infrastructure/plan.md
  - specs/001-onboarding-infrastructure/research.md
  - specs/001-onboarding-infrastructure/data-model.md
  - specs/001-onboarding-infrastructure/quickstart.md
  - specs/001-onboarding-infrastructure/contracts/auth.openapi.yaml
  - specs/001-onboarding-infrastructure/contracts/users.openapi.yaml
  - specs/001-onboarding-infrastructure/contracts/survey.openapi.yaml
  - CLAUDE.md (agent context updated)
tests:
  - N/A (design/planning artifacts)
---

## Prompt

/sp.plan "Follow the Constitution and Spec 001. Ensure we use Better-Auth for the database schema in Neon Postgres. For the Voice Samples, plan to use standard HTML5 Audio players in React. For the Personalization Metaphors, plan a utility function that maps 'Software Background' to 'Cooking Terms'."

User-provided metaphor examples:
- Developer: "Sautéing is like a System Update: don't interrupt it until the progress bar (browning) is finished."
- Mechanic: "Seasoning the pan is like Lubricating a Gear: it prevents friction and keeps the system running smooth."
- Student: "Prepping ingredients is like Note-taking: do it before the lecture (cooking) starts so you don't fall behind."

## Response snapshot

Created comprehensive implementation plan for Core Infrastructure & Personalized Onboarding feature with complete technical architecture:

**Technical Context:**
- **Language/Version**: TypeScript 5.x (frontend), Python 3.11+ (backend)
- **Stack**: Docusaurus 3.x + React 18 (frontend), FastAPI 0.100+ (backend), Neon Serverless Postgres
- **Key Libraries**: i18next (6 languages), authlib (OAuth2), passlib (password hashing), asyncpg (database), Alembic (migrations)
- **Performance Targets**: <500ms language switch, <2s voice playback, <3s dashboard load on 3G, 99.9% auth uptime

**Constitution Check (All Passed ✅)**:
- ✅ Accessibility-First: Voice output, 6 languages, RTL support
- ✅ Beginner-Centric: Linear onboarding flow, max 4-5 screens
- ✅ Safety Mandatory: N/A for auth/onboarding
- ✅ Tech Stack Discipline: Docusaurus, FastAPI, Neon, Better-Auth (FastAPI native equivalent)
- ✅ Multi-Modal Excellence: Voice samples + visual components
- ✅ Personalization Required: Survey data + metaphor utility

**Phase 0: Research & Decisions (5 topics):**
1. **Better-Auth → FastAPI Native Auth**: Better-Auth is TypeScript/Node.js only. Switched to FastAPI native with `authlib` (OAuth2) + `passlib` (password hashing) for full control without Node.js dependency.
2. **Neon Postgres Connection**: Use `databases` library with `asyncpg` backend for async connection pooling.
3. **i18next Configuration**: Industry standard for React i18n, supports RTL via `dir` attribute, instant language switching.
4. **HTML5 Audio in React**: Custom `AudioPlayer.tsx` component wrapping native `<audio>` element. Zero dependencies, preload="auto" for fast playback.
5. **Metaphor Mapping**: JSON file with static mappings, utility function reads and returns metaphors. Future enhancement: integrate with RAG system.

**Phase 1: Design Artifacts Created:**

1. **Data Model** (`data-model.md`):
   - 4 entities: User, Session, Survey Response, Voice Personality
   - User table: auth credentials, profile data (software_background, cooking_level, preferred_voice, preferred_language), progress tracking
   - Session table: JWT tokens, expiration, device info
   - Survey Response table: one-to-one with User, captures onboarding data
   - Voice Personality table: reference data for 7 voices (seeded at deployment)
   - Alembic migrations: 5 migration files for schema creation

2. **API Contracts** (3 OpenAPI specs):
   - `auth.openapi.yaml`: 5 endpoints (signup, login, Google OAuth, logout)
   - `users.openapi.yaml`: 3 endpoints (get/update profile, list voices)
   - `survey.openapi.yaml`: 2 endpoints (submit/get survey)
   - Full request/response schemas with validation rules
   - Error responses with machine-readable codes

3. **Quickstart Guide** (`quickstart.md`):
   - 11-step developer setup guide
   - Prerequisites: Node.js 18+, Python 3.11+, Neon account, Google OAuth credentials
   - Backend setup: venv, dependencies, Alembic migrations, FastAPI server
   - Frontend setup: npm install, i18next config, voice samples, Docusaurus server
   - Testing commands (pytest, Jest, Playwright)
   - Troubleshooting common issues (DB connection, OAuth, audio playback, RTL layout)
   - API endpoints reference table
   - Environment variables reference table

4. **Research Document** (`research.md`):
   - Detailed findings for all 5 research topics
   - Decision rationale with alternatives considered (comparison tables)
   - Code examples for each decision (database connection, i18next RTL handling, AudioPlayer component, metaphor mapper)
   - References to official documentation

**Project Structure:**
- Web application architecture (frontend + backend separation)
- Backend: `backend/src/` with models, services, api, db (migrations)
- Frontend: `frontend/src/` with components (auth, onboarding, dashboard, shared), pages, services, utils, locales (6 JSON files), assets/voices (7 MP3 files)
- Test structure: contract, integration, unit (backend), components, e2e (frontend)

**Risk Analysis:**
- High Priority: Google OAuth complexity, translation quality, voice samples dependency
- Medium Priority: RTL layout issues, Neon connection limits
- Mitigation strategies and kill switches documented

**ADR Suggestions (2):**
1. **FastAPI Native Auth vs Better-Auth**: Document tradeoff between implementation effort and full control
2. **Metaphor Mapping Strategy**: Document simple JSON approach vs dynamic AI-generated metaphors

## Outcome

- ✅ Impact: Created complete technical architecture and implementation plan for onboarding infrastructure. Defines web app structure (frontend/backend), database schema (4 entities), API contracts (10 endpoints), and developer setup. Resolves Better-Auth incompatibility by switching to FastAPI native auth.
- 🧪 Tests: N/A (design artifacts) - Testing strategy documented in quickstart (pytest, Jest, Playwright)
- 📁 Files: 8 files created (plan, research, data-model, quickstart, 3 OpenAPI contracts, CLAUDE.md updated)
- 🔁 Next prompts: Ready for `/sp.tasks` to generate actionable task breakdown, or `/sp.adr` to document 2 architectural decisions
- 🧠 Reflection: Plan successfully adapts Better-Auth requirement to FastAPI-compatible solution while preserving constitutional intent. User-provided metaphor examples incorporated into research findings. All 6 constitutional principles validated and passed.

## Evaluation notes (flywheel)

- Failure modes observed: None - plan creation successful. Better-Auth incompatibility detected early in research phase and resolved with FastAPI native auth.
- Graders run and results (PASS/FAIL): PASS - Constitution Check passed all 6 principles, all research questions answered, design artifacts complete
- Prompt variant (if applicable): Standard /sp.plan workflow with user-specified technical choices (HTML5 Audio, metaphor utility function)
- Next experiment (smallest change to try): Generate tasks via `/sp.tasks` and verify task breakdown aligns with user stories from spec.md
