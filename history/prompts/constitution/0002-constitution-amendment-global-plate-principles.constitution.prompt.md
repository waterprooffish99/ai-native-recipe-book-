---
id: 0002
title: Constitution Amendment Global Plate Principles
stage: constitution
date: 2026-04-02
surface: agent
model: qwen-2.5-coder-32b-instruct
feature: none
branch: master
user: Salman Hassan
command: /sp.constitution
labels: ["constitution", "amendment", "global-plate", "principles", "governance"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - N/A (constitution document amendment)
---

## Prompt

/sp.constitution # Global Plate Project Constitution

## Principle 1: Accessibility-First (RTL & Mobile)
- **MUST** support Right-to-Left (RTL) mirroring for Urdu, Arabic, and Persian natively.
- **MUST** maintain a minimum tap target size of 44x44 pixels for all interactive elements.
- **SHOULD** ensure high contrast for all safety-related text (Kitchen Guard).

## Principle 2: Beginner-Centric Simplicity
- **MUST** strictly limit all recipes to a maximum of 5 steps.
- **MUST** use "One action per step" logic to prevent user overwhelm.
- **SHOULD** avoid professional culinary jargon; use everyday language.

## Principle 3: Safety Mandatory (Kitchen Guard)
- **MUST** display prominent "Kitchen Guard" safety warnings before high-risk steps (heat, sharp tools).
- **MUST** include localized safety tips for each of the 6 supported languages.

## Principle 4: Tech Stack Discipline
- **MUST** utilize FastAPI (Backend), Neon/PostgreSQL (Relational Data), Qdrant (Vector Search), and Docusaurus/React (Frontend).
- **MUST** use OpenAI `text-embedding-3-small` (1536 dimensions) for all RAG embeddings.

## Principle 5: Multi-Modal Excellence (Voice & Text)
- **MUST** support both text and voice query capabilities (Speech-to-Text) for recipe search.
- **MUST** implement Text-to-Speech (TTS) for step-by-step guidance in all 6 languages.

## Principle 6: Personalization Required
- **MUST** map user background (Software/Hardware) to specific metaphors for recipe explanations.
- **MUST** achieve an 85% relevance rate in metaphor mappings.

## Response snapshot

Updated the Global Plate Constitution from template (v0.0.0) to v1.0.0 with concrete principles:

**6 Core Principles Defined:**
1. **Accessibility-First (RTL & Mobile)**: RTL mirroring for Urdu/Arabic/Persian, 44x44px tap targets, high contrast for safety text
2. **Beginner-Centric Simplicity**: Max 5 steps per recipe, one action per step, everyday language (no jargon)
3. **Safety Mandatory (Kitchen Guard)**: Prominent warnings before high-risk steps, localized for all 6 languages
4. **Tech Stack Discipline**: FastAPI, Neon/PostgreSQL, Qdrant Cloud, Docusaurus/React, OpenAI text-embedding-3-small (1536d)
5. **Multi-Modal Excellence (Voice & Text)**: Speech-to-Text for search, TTS for guidance in 6 languages, <2s voice response p95
6. **Personalization Required**: Map software/hardware background to metaphors, 85% relevance rate requirement

**Additional Sections Added:**
- Performance Standards (500ms retrieval, 500ms language switch, 1s RAG, 2s voice)
- Security Requirements (environment variables, Better-Auth, input validation, rate limiting)
- Data Handling (Neon as source of truth, Qdrant for vectors, data retention policies)
- Development Workflow (code quality gates, testing requirements, deployment requirements)
- Governance (amendment process, semantic versioning policy, compliance review)

**Template Consistency Check:**
- plan-template.md: Constitution Check section aligns with 6 principles ✅
- spec-template.md: No conflicts detected ⚠ (should reference Accessibility-First)
- tasks-template.md: No conflicts detected ⚠ (should include Kitchen Guard validation)

**Sync Impact Report** included as HTML comment at top of constitution file documenting version change, modified principles, and follow-up tasks.

## Outcome

- ✅ Impact: Constitution now contains concrete, testable principles replacing all template placeholders. Version 1.0.0 ready for ratification (pending confirmation of original ratification date).
- 🧪 Tests: N/A (documentation artifact)
- 📁 Files: 1 file updated (.specify/memory/constitution.md)
- 🔁 Next prompts: Run /sp.analyze to verify existing features comply with constitution, or proceed with /sp.specify for new features
- 🧠 Reflection: Constitution provides clear guardrails. Performance standards and governance sections make principles enforceable rather than aspirational.

## Evaluation notes (flywheel)

- Failure modes observed: None - constitution amendment successful
- Graders run and results (PASS/FAIL): PASS - All 6 principles defined with MUST/SHOULD normative statements, version 1.0.0, governance section complete, sync impact report included
- Prompt variant (if applicable): Standard /sp.constitution workflow with user-provided principles
- Next experiment (smallest change to try): Verify constitution enforcement by running /sp.analyze on existing 001-recipe-content-schema feature to detect any principle violations
