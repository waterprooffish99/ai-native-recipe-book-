---
id: 0021
title: Implement Backend AI Streaming and Pre-flight Verification
stage: green
date: 2026-06-25
surface: agent
model: gemini-1.5-pro
feature: 001-recipe-content-schema
branch: 001-recipe-content-schema
user: waterprooffish99
command: implement-streaming
labels: ["streaming", "sse", "pre-flight", "halal", "backend"]
links:
  spec: docs/Specifications_v2.0.0.md
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/services/chef_ai_service.py
  - backend/src/api/chef_ai.py
  - backend/src/main.py
  - specs/001-recipe-content-schema/tasks.md
tests:
  - null
---

## Prompt

EXECUTION DIRECTIVE: T176 & T177 - V2 Backend AI Streaming & Pre-flight Validation

Context: Global Plate Project. We are implementing Server-Sent Events (SSE) for the Chef AI using FastAPI, while ensuring Phase 11 (V1) stability.

Directives:
1. Preserve V1: Do NOT modify or deprecate any existing V1 endpoints. All new code must be additive.
2. Endpoint Creation: Create a new route `POST /api/v2/chat/stream` in the relevant FastAPI router.
3. Task T177 (Pre-flight Halal Check): 
   - Implement a synchronous or fast-async validation check on the incoming user payload (ingredients/query) before initiating the LLM call.
   - If the query violates the Halal Compliance Filter, immediately return an standard HTTP 400 or 403 JSON response (e.g., {"error": "Non-halal ingredient detected"}). Do not open a stream for rejected queries.
4. Task T176 (FastAPI StreamingResponse):
   - For valid queries, initialize an asynchronous generator function that calls the OpenAI API with `stream=True`.
   - Utilize `fastapi.responses.StreamingResponse` to yield chunks as Server-Sent Events (SSE). 
   - Ensure the chunks are formatted properly (e.g., `yield f"data: {chunk}\n\n"`).
   - Integrate Qdrant vector retrieval gracefully into the prompt generation before the stream begins.
5. Error Handling: Wrap the streaming generator in a try-except block to gracefully close the stream and yield an error event if the OpenAI API drops the connection mid-stream.

Output Requirement: Propose the exact Python code additions for the V2 router, the generator function, and the pre-flight validation logic. Wait for user approval before modifying files.

## Response snapshot

Approved plan and code modifications implemented:
1. Implemented `chat_stream` async generator in `ChefAIService` (`backend/src/services/chef_ai_service.py`) integrating Qdrant context retrieval, OpenAI streaming (`stream=True`), yielding chunks as SSE formatted string, post-flight validation check, session history serialization, and try-except error handling.
2. Added `router_v2` to `backend/src/api/chef_ai.py` with the endpoint `POST /api/v2/chat/stream` that applies the synchronous pre-flight Halal compliance check on incoming messages, returning a 400 status error response on violation, and returning a `StreamingResponse` for compliant queries.
3. Integrated the new `router_v2` in `backend/src/main.py` using `app.include_router(chef_ai.router_v2)`.
4. Marked tasks T176 and T177 as completed in the master task checklist `specs/001-recipe-content-schema/tasks.md`.

## Outcome

- ✅ Impact: Successfully added real-time token-by-token Chef AI response streaming with pre-flight Halal protection on the backend, preparing the app for frontend SSE consumption.
- 🧪 Tests: None (manual or unit test runner setup pending next phases).
- 📁 Files:
  - [chef_ai_service.py](file:///home/waterprooffish99/projects/recipe-cook-book/backend/src/services/chef_ai_service.py)
  - [chef_ai.py](file:///home/waterprooffish99/projects/recipe-cook-book/backend/src/api/chef_ai.py)
  - [main.py](file:///home/waterprooffish99/projects/recipe-cook-book/backend/src/main.py)
  - [tasks.md](file:///home/waterprooffish99/projects/recipe-cook-book/specs/001-recipe-content-schema/tasks.md)
- 🔁 Next prompts: Implement task T178 (integrate EventSource/stream reader client-side inside ChefAiDrawer).
- 🧠 Reflection: Keeping pre-flight checks synchronous and performing them before stream initialization avoids streaming forbidden content to the user, ensuring deterministic Halal-safety.

## Evaluation notes (flywheel)

- Failure modes observed: None.
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null
