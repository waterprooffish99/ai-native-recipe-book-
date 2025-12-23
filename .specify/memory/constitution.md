<!--
Sync Impact Report:
- Version change: TEMPLATE (0.0.0) → 1.0.0
- This is the initial ratification of the Global Plate constitution
- New principles: All 6 principles are newly defined
- Added sections: Technical Standards, Content Standards, Development Workflow
- Templates requiring updates:
  ✅ constitution.md (this file)
  ⚠ plan-template.md (needs Constitution Check section update)
  ⚠ spec-template.md (needs accessibility requirements check)
  ⚠ tasks-template.md (needs voice/language testing tasks pattern)
- Follow-up TODOs: None - all placeholders filled
-->

# Global Plate - The AI-Voice Recipe Companion Constitution

## Core Principles

### I. Accessibility-First (NON-NEGOTIABLE)

Every feature MUST remove barriers for absolute beginners globally. Voice-first navigation is the primary interface; text is supplementary.

**Requirements:**
- Voice input/output MUST work for all core interactions (navigation, questions, step playback)
- All 6 languages MUST be supported: English, Urdu, Arabic, Spanish, French, Persian
- Language switching MUST be instant (no page reload)
- Content MUST be understandable without reading (audio-only mode viable)
- High-contrast UI with HD imagery MUST meet WCAG 2.1 AA standards minimum

**Rationale:** Literacy and technical barriers exclude billions from quality cooking education. Voice removes these barriers completely.

### II. Beginner-Centric Content (NON-NEGOTIABLE)

Recipe complexity MUST be strictly controlled to prevent overwhelming beginners.

**Requirements:**
- Maximum 5 steps per recipe (hard limit)
- One action per step (no compound instructions like "chop AND sauté")
- Technical terms MUST have voice-activated definitions (e.g., "What is sauté?")
- Ingredient substitutes MUST be AI-suggested based on user region
- Personalized explanations MUST adapt to user's background (from Better-Auth onboarding survey)

**Rationale:** Beginners abandon cooking when instructions are complex. Strict simplicity ensures success and builds confidence.

### III. Safety Mandatory (NON-NEGOTIABLE)

Every recipe MUST include a "Kitchen Guard" section to prevent injuries and common mistakes.

**Requirements:**
- Kitchen Guard section MUST appear before ingredients list
- MUST cover: burn risks, cross-contamination, knife safety, allergen warnings
- Safety warnings MUST be vocalized during step playback (not just visible)
- High-risk steps (e.g., deep frying) MUST have explicit caution reminders

**Rationale:** First-time cooks lack intuition about kitchen dangers. Explicit safety prevents injuries and builds safe habits.

### IV. Tech Stack Discipline

The architecture MUST follow the defined stack to ensure maintainability and integration.

**Requirements:**
- **Frontend:** Docusaurus (React) + GitHub Pages (documentation hosting)
- **Context:** Context7 MCP for real-time documentation retrieval
- **Backend:** FastAPI serving OpenAI Agents/ChatKit SDK
- **Vector Store:** Qdrant Cloud (Free Tier) for recipe RAG retrieval
- **Database:** Neon Serverless Postgres for user data
- **Authentication:** Better-Auth with mandatory onboarding survey
- **Voice:** 7 distinct voice profiles (Arlow, Silas, Hugo, Omar, Felix, Elara, Maya)

**Deviations:** Any change to core stack components (e.g., swapping Qdrant for Pinecone) MUST be documented in an ADR with explicit rationale and migration plan.

**Rationale:** Consistency prevents integration nightmares. The stack is chosen for free-tier availability and AI-native capabilities.

### V. Multi-Modal Excellence

Users MUST experience high-quality voice and visual content across all interactions.

**Requirements:**
- 7 voice profiles MUST be distinct and culturally appropriate (5 Male, 2 Female)
- Voice personalities MUST match content tone (encouraging, patient, clear)
- HD step-by-step images MUST accompany every recipe step
- Visual guides MUST work without text (icons + images convey actions)
- Speech-to-Text (STT) MUST handle kitchen background noise and accents

**Rationale:** Multi-modal learning (audio + visual) dramatically improves retention and success rates for beginners.

### VI. Personalization Required

User experience MUST adapt to individual background and preferences.

**Requirements:**
- Better-Auth onboarding survey MUST capture: hardware/software background, cooking skill level, dietary restrictions, regional location
- Explanations MUST adapt (e.g., "Sauté is like updating software—constant attention to avoid crashes" for tech users)
- Favorite Recipes and Last Cooked MUST persist across sessions
- AI chatbot MUST use user context for recipe recommendations

**Rationale:** Generic instructions fail beginners. Personalization makes abstract cooking concepts relatable and memorable.

## Technical Standards

### Code Quality

- **Type Safety:** TypeScript MUST be used for all frontend code; Python type hints MUST be used for all backend code
- **Error Handling:** MUST NOT fail silently; try/except blocks MUST log errors to observability system
- **Testing:** Contract tests MUST verify API contracts; integration tests MUST verify critical user journeys
- **Comments:** Code MUST include beginner-friendly comments explaining "why" not "what"

### Performance Requirements

- **Voice Response:** STT → AI response MUST complete within 2 seconds (p95)
- **Language Switch:** UI language change MUST complete within 500ms
- **Recipe Load:** Recipe page with images MUST load within 3 seconds on 3G
- **Vector Search:** RAG retrieval from Qdrant MUST return results within 1 second

### Security Requirements

- **Authentication:** Better-Auth MUST enforce secure session management
- **Data Privacy:** User data (favorites, survey responses) MUST be encrypted at rest
- **API Keys:** OpenAI/Qdrant keys MUST be in `.env` files (never committed)
- **Input Validation:** Voice input MUST be sanitized before passing to AI models

## Content Standards

### Recipe Format

- **Structure:** Kitchen Guard → Ingredients → 5 Steps (max) → Tips
- **Naming:** Recipe titles MUST be beginner-friendly (e.g., "Fluffy Scrambled Eggs" not "Œufs Brouillés")
- **Ingredients:** MUST list quantities in both metric and imperial
- **Timing:** MUST include prep time, cook time, total time
- **Difficulty:** MUST be rated: Absolute Beginner | Beginner | Beginner+

### Voice Script Quality

- **Tone:** Encouraging, patient, non-judgmental
- **Pacing:** MUST pause 2 seconds between steps for user processing
- **Confirmation:** MUST ask "Ready for next step?" before proceeding
- **Repetition:** Users MUST be able to say "Repeat that" to replay current step

## Development Workflow

### Feature Development

1. **Spec → Plan → Tasks:** Follow SDD workflow (all features start with spec.md)
2. **Constitution Check:** Every plan.md MUST verify compliance with these principles
3. **ADR Required:** Architectural decisions MUST be documented (voice engine choice, RAG strategy, etc.)
4. **PHR Required:** Every user request MUST generate a Prompt History Record

### Agent Skills

- **Multi-Lingual Processor:** Agent skill for complex translations maintaining cooking context
- **Voice Engine Controller:** Agent skill managing 7 voice profiles + STT handling
- **Personalization Adapter:** Agent skill modifying content based on Better-Auth profile

### Testing Requirements

- **Voice Testing:** MUST test STT accuracy with kitchen background noise samples
- **Language Testing:** MUST verify translations maintain cooking accuracy (not just literal translation)
- **Accessibility Testing:** MUST verify WCAG 2.1 AA compliance for all UI components
- **Performance Testing:** MUST verify p95 latency targets under realistic load

## Success Metrics

The project succeeds when:

1. **RAG Chatbot:** 100% functional with voice input/output
2. **Language Toggle:** Seamless translation button in every chapter
3. **Better-Auth:** Successful login with onboarding survey completion
4. **Voice Quality:** 7 distinct voices tested and culturally appropriate
5. **Recipe Simplicity:** Zero recipes exceed 5 steps or include compound actions
6. **Safety Coverage:** 100% of recipes have Kitchen Guard sections

## Governance

### Constitution Authority

- This constitution supersedes all other practices and preferences
- Pull requests MUST verify compliance with all NON-NEGOTIABLE principles
- Complexity (e.g., exceeding 5 steps) MUST be explicitly justified in ADR

### Amendment Process

- **MAJOR version bump:** Changes to NON-NEGOTIABLE principles or tech stack removals
- **MINOR version bump:** New principles added or existing principles materially expanded
- **PATCH version bump:** Clarifications, typo fixes, non-semantic improvements
- All amendments MUST update this file, create ADR, and notify team

### Review Requirements

- Every feature spec MUST reference relevant constitution principles
- Every plan.md MUST include Constitution Check section
- Code reviews MUST verify principle adherence (accessibility, safety, simplicity)

**Version**: 1.0.0 | **Ratified**: 2025-12-22 | **Last Amended**: 2025-12-22
