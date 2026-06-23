# Implementation Plan: Recipe Content Schema for Global Masterpieces - Product-System Transition

**Branch**: `001-recipe-content-schema` | **Date**: 2026-04-02 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-recipe-content-schema/spec.md` v1.2

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implementation of Product-System Era features for Global Plate recipe platform. This plan covers Phase 8-10 transition: (1) Interactive UX with Cook Mode, ingredient checkboxes, and progress tracking using Tailwind CSS; (2) Conversational Chef AI with substitution logic and fridge inventory matching; (3) Multi-platform delivery with PWA offline support and PDF generation. Builds upon existing FastAPI backend, Neon PostgreSQL, Qdrant RAG, and Docusaurus/React frontend.

## Technical Context

**Language/Version**: Python 3.11 (backend), TypeScript 5.x (frontend)
**Primary Dependencies**: FastAPI, Qdrant Cloud, Neon Postgres, i18next, React, Tailwind CSS, NoSleep.js
**Storage**: Neon Serverless PostgreSQL (recipe data, user progress), Qdrant Cloud (vector embeddings)
**Testing**: pytest (backend), Jest (frontend), Playwright (E2E)
**Target Platform**: Web application with PWA capabilities for offline use
**Project Type**: Web application with frontend/backend separation
**Performance Goals**: Command+K search <300ms, Cook Mode wake lock instant activation, ingredient checkbox sync <100ms
**Constraints**: Dark-mode first design, 44x44px touch targets, WCAG 2.1 AA compliance, Halal-compliant AI suggestions
**Scale/Scope**: 5 initial recipes with interactive features, scalable to 100+ recipes, PWA for offline Lyari use

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Review against Global Plate Constitution principles (v1.2.0):

- [X] **Accessibility-First**: Feature supports all 6 languages with RTL, 44x44px touch targets for ingredient checkboxes, Cook Mode high-contrast typography
- [X] **Beginner-Centric**: Cook Mode shows one step at a time, progress bar reduces cognitive load, smart scaling eliminates manual math
- [X] **Safety Mandatory**: Kitchen Guard warnings remain visible in Cook Mode, ingredient allergies tracked in Chef AI
- [X] **Tech Stack Discipline**: Uses FastAPI, Neon Postgres, Qdrant, React + Tailwind CSS (approved design system upgrade)
- [X] **Multi-Modal Excellence**: Voice search integrated with Chef AI, Cook Mode prevents screen sleep, TTS for steps
- [X] **Personalization Required**: Chef AI adapts suggestions to user's available ingredients and cooking level
- [X] **Systemic Interactivity (NEW)**: ✅ Ingredient checkboxes, progress sync bar, Cook Mode with wake lock, auto-advance steps
- [X] **Big-Tech UI/UX (NEW)**: ✅ Dark-mode first, Tailwind CSS custom styling, Command+K search <300ms, Geist/Inter fonts
- [X] **Conversational Chef AI (NEW)**: ✅ Fridge Logic substitutions, Halal-compliant suggestions, cultural sensitivity

**Deviations**: None - all 9 principles satisfied

**Complexity Justification**: Interactive features (FR-009 to FR-011) required for Product-System Era per Constitution v1.2.0

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
