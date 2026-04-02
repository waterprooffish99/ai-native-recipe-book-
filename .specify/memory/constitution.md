<!--
  SYNC IMPACT REPORT
  ===================
  Version change: 0.0.0 (template) → 1.0.0 (initial ratification)
  
  Modified principles:
    - All 6 principles replaced template placeholders with Global Plate principles
  
  Added sections:
    - None (structure preserved from template)
  
  Removed sections:
    - None (all template sections filled with concrete content)
  
  Templates requiring updates:
    ✅ .specify/templates/plan-template.md - Constitution Check section aligns with 6 principles
    ⚠ .specify/templates/spec-template.md - Should reference Accessibility-First and Safety Mandatory
    ⚠ .specify/templates/tasks-template.md - Should include Kitchen Guard validation tasks
  
  Follow-up TODOs:
    - TODO(CONSTITUTION_RATIFICATION_DATE): Confirm original ratification date from project history
-->

# Global Plate Constitution

## Core Principles

### I. Accessibility-First (RTL & Mobile)

The Global Plate platform MUST prioritize accessibility for users across all 6 supported languages, with special attention to Right-to-Left (RTL) script support and mobile-first interaction patterns.

**Non-Negotiable Rules:**
- MUST support Right-to-Left (RTL) mirroring natively for Urdu, Arabic, and Persian languages
- MUST maintain a minimum tap target size of 44x44 pixels for all interactive elements
- SHOULD ensure high contrast for all safety-related text (Kitchen Guard warnings)
- MUST test all UI components in both LTR (English, Spanish, French) and RTL (Urdu, Arabic, Persian) modes

**Rationale**: Global Plate serves users across diverse linguistic backgrounds. RTL support is not optional—it is fundamental to serving Urdu, Arabic, and Persian speaking users. Mobile-first design ensures accessibility in regions where mobile devices are the primary computing platform.

---

### II. Beginner-Centric Simplicity

All content and interactions MUST be designed for absolute beginners, reducing cognitive load and preventing overwhelm during cooking activities.

**Non-Negotiable Rules:**
- MUST strictly limit all recipes to a maximum of 5 steps
- MUST use "One action per step" logic to prevent user overwhelm
- SHOULD avoid professional culinary jargon; use everyday language instead
- MUST validate recipe step count and action-per-step constraint before deployment

**Rationale**: The target audience includes beginners with diverse backgrounds (software/hardware). Complex multi-step instructions create barriers to entry. The 5-step constraint forces clarity and simplicity.

---

### III. Safety Mandatory (Kitchen Guard)

User safety is paramount. All recipes MUST include prominent safety warnings for high-risk cooking activities, localized for all 6 supported languages.

**Non-Negotiable Rules:**
- MUST display prominent "Kitchen Guard" safety warnings before high-risk steps (heat, sharp tools, hot oil)
- MUST include localized safety tips for each of the 6 supported languages (EN, UR, AR, ES, FR, FA)
- MUST NOT allow recipe publication without Kitchen Guard section completion
- SHOULD prioritize Kitchen Guard visibility with distinctive visual styling (warning colors, icons)

**Rationale**: Cooking involves inherent risks. Kitchen Guard is a safety-critical feature, not optional enhancement. Localized safety tips ensure non-English speakers receive equivalent safety information.

---

### IV. Tech Stack Discipline

The Global Plate platform MUST adhere to the defined technology stack to maintain consistency, reduce cognitive overhead, and enable team collaboration.

**Non-Negotiable Rules:**
- MUST utilize FastAPI for backend services (Python 3.11)
- MUST utilize Neon/PostgreSQL for relational data storage
- MUST utilize Qdrant Cloud for vector search and RAG operations
- MUST utilize Docusaurus/React for frontend development
- MUST use OpenAI `text-embedding-3-small` (1536 dimensions) for all RAG embeddings
- MUST NOT introduce new technologies without constitution amendment

**Rationale**: Technology discipline reduces maintenance overhead, enables knowledge sharing, and simplifies onboarding. The selected stack is optimized for AI-powered recipe delivery with RAG capabilities.

---

### V. Multi-Modal Excellence (Voice & Text)

Global Plate MUST provide seamless interaction through both text and voice modalities, enabling hands-free cooking assistance and accessibility for users with different interaction preferences.

**Non-Negotiable Rules:**
- MUST support both text and voice query capabilities (Speech-to-Text) for recipe search
- MUST implement Text-to-Speech (TTS) for step-by-step guidance in all 6 languages
- MUST achieve voice response time under 2 seconds (p95 latency)
- MUST ensure voice output clarity in kitchen environments (background noise consideration)
- SHOULD support voice navigation for recipe steps without manual intervention

**Rationale**: Cooking is a hands-on activity. Voice interaction enables users to follow recipes without touching devices with dirty hands. Multi-modal support also improves accessibility for users with visual or motor impairments.

---

### VI. Personalization Required

The platform MUST adapt content presentation based on user background (software/hardware experience), using metaphors and analogies that resonate with individual user contexts.

**Non-Negotiable Rules:**
- MUST map user background (Software/Hardware experience level) to specific metaphors for recipe explanations
- MUST achieve an 85% relevance rate in metaphor mappings (measured via user feedback or evaluation)
- MUST store user background preferences via Better-Auth context
- SHOULD provide personalized welcome messages using background-appropriate metaphors

**Rationale**: Personalization transforms generic instructions into relatable guidance. A software engineer understands "compile the ingredients" differently than a hardware engineer. Metaphor-based personalization improves comprehension and engagement.

---

## Additional Constraints

### Performance Standards

- Recipe retrieval MUST complete within 500ms (p95 latency)
- Language switching MUST complete within 500ms
- Vector search (RAG) MUST complete within 1s (p95 latency)
- Voice response MUST complete within 2s (p95 latency)

### Security Requirements

- MUST use environment variables for all API keys and secrets (`.env` files, never committed)
- MUST use Better-Auth for authentication and authorization
- MUST validate all user inputs server-side
- MUST implement rate limiting on public API endpoints

### Data Handling

- MUST use Neon PostgreSQL as source of truth for recipe data
- MUST use Qdrant Cloud for vector embeddings (no local vector storage)
- MUST implement data retention policies for user preferences
- MUST support data export for user portability

---

## Development Workflow

### Code Quality Gates

- All PRs MUST verify compliance with constitution principles
- All new features MUST pass Constitution Check in plan.md
- Complexity MUST be justified with simpler alternatives considered
- All API endpoints MUST follow OpenAPI specification in contracts/

### Testing Requirements

- Integration tests REQUIRED for: new service contracts, API endpoint changes, RAG search functionality
- Voice testing REQUIRED for all 6 languages
- RTL testing REQUIRED for Urdu, Arabic, Persian
- Performance testing REQUIRED for all success criteria metrics

### Deployment Requirements

- MUST run quickstart.md validation before deployment
- MUST verify all 6 language translations are complete
- MUST verify Kitchen Guard present on all recipes
- MUST verify recipe step constraints (max 5 steps, one action per step)

---

## Governance

### Amendment Process

This constitution supersedes all other project practices and guidelines. Amendments require:

1. **Proposal**: Document proposed change with rationale
2. **Impact Analysis**: Identify affected features, templates, and ongoing work
3. **Approval**: Explicit user/stakeholder approval
4. **Migration Plan**: Document changes needed to existing code/docs
5. **Version Bump**: Increment version according to semantic versioning

### Versioning Policy

- **MAJOR** (X.0.0): Backward incompatible changes (principle removals, redefinitions, constraint relaxations)
- **MINOR** (1.X.0): New principles/sections, material expansions of existing principles
- **PATCH** (1.0.X): Clarifications, wording improvements, typo fixes, non-semantic refinements

### Compliance Review

- All PRs/reviews MUST verify constitution compliance
- Constitution Check in plan.md MUST pass before feature implementation
- Use `.specify/memory/constitution.md` as authoritative source for principle validation
- Complexity or deviations MUST be justified in Complexity Tracking section of plan.md

---

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): Confirm from project history | **Last Amended**: 2026-04-02
