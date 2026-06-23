---
id: 0018
title: Tasks v1.2 Product System Era Task Generation Complete
stage: tasks
date: 2026-04-02
surface: agent
model: qwen-2.5-coder-32b-instruct
feature: 001-recipe-content-schema
branch: 001-recipe-content-schema
user: Salman Hassan
command: /sp.tasks
labels: ["tasks", "product-system", "cook-mode", "chef-ai", "command-k", "pwa", "phase-8-11"]
links:
  spec: specs/001-recipe-content-schema/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-recipe-content-schema/tasks.md
tests:
  - N/A (task generation session)
---

## Prompt

/sp.tasks # New Tasks: Interactive Product Features

## Phase 8: Interactive UX [P1]
- [ ] T112: Implement Tailwind CSS theme with Geist/Inter typography.
- [ ] T113: Build `IngredientChecklist` component with state persistence.
- [ ] T114: Build `StepProgressBar` that tracks 1-5 recipe steps.
- [ ] T115: Implement "Cook Mode" (Fullscreen + Wake Lock).

## Phase 9: Chef AI Conversational Layer [P1]
- [ ] T116: Create `POST /ai/chef` endpoint for conversational recipe help.
- [ ] T117: Update RAG context to include "Substitution Tables".
- [ ] T118: Build floating "Chef AI" chat drawer in the Frontend.

## Phase 10: System Features [P2]
- [ ] T119: Implement "Command + K" Command Palette for global search.
- [ ] T120: Add "Serving Scaler" logic to Ingredient list (auto-math).

## Response snapshot

Generated 64 new tasks (T112-T175) for Product-System Era features organized in 4 new phases:

**Phase 8: Interactive UX (14 tasks T112-T126) - US5 Focused Cook:**
- T112: Tailwind CSS configuration with dark theme, Geist/Inter fonts
- T113-T115: IngredientChecklist, StepProgressBar, CookMode components
- T116-T118: Database migrations (user_recipe_progress, ingredient_checkboxes, step_progress)
- T119: Run Alembic migrations
- T120-T121: API endpoints for progress tracking
- T122: React Query hooks for optimistic updates
- T123-T125: Integration into RecipeDetail
- T126: Logging

**Phase 9: Conversational Chef AI (15 tasks T127-T141) - US4 Busy Parent:**
- T127: Substitution database (100+ substitutions with ratios)
- T128-T129: ChefAISession model and migration
- T130: RAG prompt enhancement for substitutions/fridge logic
- T131: Halal compliance filter (pork, alcohol filtering)
- T132-T133: ChefAIService chat and fridge logic methods
- T134-T135: API endpoints (/chef-ai/chat, /chef-ai/fridge-logic)
- T136-T138: Frontend components (floating button, chat drawer, service)
- T139: Citation display for food safety
- T140-T141: Logging and user feedback

**Phase 10: System Features (20 tasks T142-T161) - Multiple Stories:**
- Command+K Search (T142-T146): cmdk library, client-side index, <300ms search
- Smart Scaling (T147-T151): ServingSizeScale model, API endpoint, auto-calculation UI
- PWA Offline (T152-T157): @docusaurus/plugin-pwa, manifest.json, offline caching for Lyari
- PDF Generation (T158-T161): @react-pdf/renderer, print-optimized layout, QR codes

**Phase 11: Polish & Validation (14 tasks T162-T175):**
- Performance (T162-T165): Command+K <300ms, checkbox sync <100ms, wake lock instant, PWA offline
- Accessibility (T166-T169): 44x44px touch targets, WCAG contrast, keyboard nav, citations
- Halal Compliance (T170-T172): Filter verification, cultural sensitivity, user reporting
- Documentation (T173-T175): quickstart.md update, API docs, README

**Task Organization:**
- Organized by user story (US4, US5) for independent implementation
- All tasks follow strict checklist format: `- [ ] T### [P?] [Story?] Description with file path`
- [P] markers for parallelizable tasks (42 new parallel opportunities)
- [Story] labels for user story phases (US4, US5)
- Clear file paths for every task

**Dependencies Mapped:**
- Phase 8 depends on Phase 2 (Foundational) - Can start immediately
- Phase 9 depends on Phase 2 - Can start immediately
- Phase 10 depends on Phase 2 - Can start immediately
- Phase 11 depends on Phases 8-10 completion

**Parallel Opportunities:**
- Phase 8: T112-T115 (components), T116-T118 (migrations) can run in parallel
- Phase 9: T127-T129 (setup), T136-T137 (components) can run in parallel
- Phase 10: Command+K, Scaling, PWA, PDF all independent - can run in parallel
- Phase 11: All 14 tasks can run in parallel (different test files)

**Total Task Count:** 111 → 175 tasks (+64 new tasks)
- Phase 1-7: 111 tasks (existing)
- Phase 8: 14 tasks (NEW)
- Phase 9: 15 tasks (NEW)
- Phase 10: 20 tasks (NEW)
- Phase 11: 14 tasks (NEW)

**Parallel opportunities identified**: 68 tasks total marked with [P]

**Suggested MVP scope**: 
- Original MVP: Phase 1+2+3 (61 tasks for RAG-enabled recipe system)
- Product-System MVP: Phase 8 only (14 tasks for Cook Mode, checkboxes, progress)

**Constitution Alignment:**
- Principle VII (Systemic Interactivity): T112-T125 (Cook Mode, checkboxes, progress bar)
- Principle VIII (Big-Tech UI/UX): T112, T142-T146 (Tailwind, Command+K)
- Principle IX (Conversational Chef AI): T127-T141 (substitutions, fridge logic, Halal compliance)

**Success Criteria Coverage:**
- SC-006 (Command+K <300ms): T142-T146, T162 (benchmark)
- SC-007 (Mobile touch accuracy 100%): T113, T166 (accessibility test)
- FR-009 (Interactivity): T113-T114, T120-T121
- FR-010 (Smart Scaling): T147-T151
- FR-011 (Chef AI): T127-T141

## Outcome

- ✅ Impact: Generated 64 actionable tasks for Product-System Era (Phases 8-11). All tasks follow strict checklist format with file paths, story labels, and parallel markers. Ready for immediate implementation.
- 🧪 Tests: N/A (task generation artifact)
- 📁 Files: 1 file updated (tasks.md from 111 to 175 tasks)
- 🔁 Next prompts: Ready for /sp.implement to start Phase 8 implementation
- 🧠 Reflection: Tasks organized by user story enable independent implementation. Phase 8 (Cook Mode) provides immediate user value. Phase 9 (Chef AI) requires careful Halal compliance implementation. Phase 10 features are configuration-heavy but low-risk.

## Evaluation notes (flywheel)

- Failure modes observed: None - task generation successful
- Graders run and results (PASS/FAIL): PASS - All tasks follow checklist format, file paths specific, story labels correct, parallel markers accurate
- Prompt variant (if applicable): Standard /sp.tasks workflow with user-provided context
- Next experiment (smallest change to try): Run /sp.implement starting with Phase 8 T112 (Tailwind CSS configuration)
