---
id: 0001
title: Global Plate Constitution Created
stage: constitution
date: 2025-12-22
surface: agent
model: claude-sonnet-4-5
feature: none
branch: master
user: Salman Hassan
command: /sp.constitution
labels: ["constitution", "initialization", "global-plate", "voice-first", "accessibility", "multi-language"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
  - .specify/templates/plan-template.md
  - .specify/templates/spec-template.md
  - .specify/templates/tasks-template.md
tests:
  - N/A (constitution document creation)
---

## Prompt

/sp.constitution

# Project Name: Global Plate - The AI-Voice Recipe Companion

# Vision & Purpose
To build a world-class, AI-native, multi-language, and voice-enabled recipe ecosystem. The goal is to democratize high-quality cooking for absolute beginners globally by removing literacy and technical barriers through interactive audio and "super-simple" visual guides.

# Core Requirements
- Voice-First Navigation with 7 AI Voice Personalities (5 Male: Arlow, Silas, Hugo, Omar, Felix; 2 Female: Elara, Maya)
- Language Support: English, Urdu, Arabic, Spanish, French, Persian
- Tech Stack: Docusaurus (React), Context7 MCP, FastAPI, OpenAI Agents/ChatKit SDK, Qdrant Cloud, Neon Serverless Postgres
- Authentication: Better-Auth with mandatory onboarding survey
- Recipe Standard: Max 5 steps per recipe, one action per step, with Kitchen Guard safety sections

## Response snapshot

Created the Global Plate constitution (v1.0.0) with 6 core principles:

1. **Accessibility-First (NON-NEGOTIABLE)**: Voice-first navigation as primary interface, supporting all 6 languages with instant switching. Content must be understandable without reading (audio-only viable). WCAG 2.1 AA compliance required.

2. **Beginner-Centric Content (NON-NEGOTIABLE)**: Strict 5-step maximum per recipe, one action per step. Technical terms must have voice-activated definitions. AI-suggested ingredient substitutes based on user region. Personalized explanations adapted to user background.

3. **Safety Mandatory (NON-NEGOTIABLE)**: Every recipe must include Kitchen Guard section before ingredients. Must cover burn risks, cross-contamination, knife safety, allergen warnings. Safety warnings vocalized during step playback.

4. **Tech Stack Discipline**: Defined architecture with Docusaurus (React) frontend, FastAPI backend with OpenAI Agents/ChatKit SDK, Qdrant Cloud vector store, Neon Serverless Postgres database, Better-Auth with mandatory onboarding. Any stack deviations require ADR.

5. **Multi-Modal Excellence**: 7 distinct voice profiles (culturally appropriate), HD step-by-step images, visual guides working without text, STT handling kitchen noise and accents.

6. **Personalization Required**: Better-Auth onboarding captures hardware/software background, cooking skill, dietary restrictions, regional location. Explanations adapt to user background (e.g., "Sauté is like updating software" for tech users).

Additional sections included:
- Technical Standards (code quality, performance, security)
- Content Standards (recipe format, voice script quality)
- Development Workflow (SDD compliance, agent skills, testing requirements)
- Success Metrics (RAG chatbot, language toggle, Better-Auth integration)
- Governance (amendment process, review requirements)

Updated dependent templates:
- plan-template.md: Added Constitution Check section with principle verification checklist
- spec-template.md: Added mandatory Accessibility Requirements section
- tasks-template.md: Added Global Plate specific testing tasks (voice, language, accessibility, performance, recipe compliance)

## Outcome

- ✅ Impact: Created foundational governance document defining all architectural and content principles for Global Plate. Templates updated to enforce constitution compliance.
- 🧪 Tests: N/A (documentation artifact)
- 📁 Files: 4 files created/modified (constitution + 3 templates)
- 🔁 Next prompts: Ready for feature specification via /sp.specify or planning via /sp.plan for first feature implementation
- 🧠 Reflection: Constitution provides clear guardrails for voice-first, beginner-friendly, safety-focused recipe platform. Templates now enforce these principles automatically.

## Evaluation notes (flywheel)

- Failure modes observed: None - constitution creation successful
- Graders run and results (PASS/FAIL): PASS - All placeholders filled, version 1.0.0 ratified, dependent templates updated
- Prompt variant (if applicable): Standard /sp.constitution workflow
- Next experiment (smallest change to try): Test constitution enforcement by creating first feature spec and verifying Constitution Check section works as expected
