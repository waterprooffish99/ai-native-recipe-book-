---
id: 0004
title: CORS and Port Alignment
stage: general
date: 2026-06-18
surface: agent
model: Gemini 3.5 Flash
feature: none
branch: 001-recipe-content-schema
user: waterprooffish99
command: none
labels: ["cors", "port-alignment", "fastapi", "docusaurus", "wsl"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/main.py
  - frontend/src/polyfill.ts
  - frontend/src/services/authService.ts
  - frontend/src/services/ragService.ts
  - frontend/src/services/recipeService.ts
  - frontend/src/services/surveyService.ts
  - frontend/src/services/userService.ts
tests:
  - curl -i -X OPTIONS -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: Authorization" http://localhost:8002/recipes
---

## Prompt

// EXECUTION DIRECTIVE: GLOBAL PLATE CORS & PORT ALIGNMENT
// TARGET_DIR: /home/waterprooffish99/projects/recipe-cook-book/
// MODE: MIDDLEWARE PATCH & CONFIG UPDATE

execute_sequence {
  
  step_1_frontend_api_redirect {
    description: "Re-route the frontend API calls to the correct backend port (8002)."
    actions: [
      "SEARCH frontend directory for the API base URL. Check 'frontend/.env', 'frontend/docusaurus.config.ts', or 'frontend/src/services/recipeService.ts'.",
      "REPLACE any instance of 'http://localhost:8000' with 'http://localhost:8002'.",
      "Ensure the base URL environment variable (e.g., REACT_APP_API_URL or similar) is correctly pointing to 8002."
    ]
  }

  step_2_backend_cors_middleware {
    description: "Inject FastAPI CORSMiddleware to permit handshake with the Docusaurus frontend."
    actions: [
      "READ backend/main.py (or the core FastAPI app file).",
      "IMPORT CORSMiddleware: 'from fastapi.middleware.cors import CORSMiddleware'",
      "INJECT the middleware directly after initializing 'app = FastAPI(...)':\napp.add_middleware(\n    CORSMiddleware,\n    allow_origins=['http://localhost:3000', 'http://127.0.0.1:3000'],\n    allow_credentials=True,\n    allow_methods=['*'],\n    allow_headers=['*'],\n)"
    ]
  }

  step_3_reboot_and_verify {
    description: "Restart the services and verify the handshake."
    commands: [
      "echo 'Rebooting Backend with CORS...'",
      "fuser -k -9 8002/tcp || true",
      "cd backend && uvicorn main:app --port 8002 --reload &",
      "sleep 3",
      "echo 'Rebooting Frontend with updated API URL...'",
      "cd ../frontend",
      "npm run start -- --port 3000"
    ]
  }

  step_4_status_report {
    description: "Generate a Markdown summary of the alignment."
    output_format: "markdown"
    requirements: [
      "Confirm which frontend files were modified to point to port 8002.",
      "Confirm successful injection of CORSMiddleware in main.py.",
      "Verify that localhost:3000 successfully fetches recipes without CORS errors."
    ]
  }
}

## Response snapshot

Configured CORS headers on the FastAPI backend on port 8002 using CORSMiddleware allowing origins 'http://localhost:3000' and 'http://127.0.0.1:3000' with wildcard methods and headers. Re-routed frontend Docusaurus API calls from port 8000 to port 8002 across all service modules, and verified that both servers compile and handshake successfully.

## Outcome

- ✅ Impact: Resolved API client connectivity on WSL environment by mapping backend port to 8002 and CORS is properly integrated with Docusaurus on port 3000.
- 🧪 Tests: CORS validation curl headers returned 200 OK and allowed methods/origins/headers properly. Frontend server successfully compiles with Webpack.
- 📁 Files: Modified `backend/src/main.py`, `frontend/src/polyfill.ts`, and frontend services: `authService.ts`, `ragService.ts`, `recipeService.ts`, `surveyService.ts`, `userService.ts`.
- 🔁 Next prompts: Proceed with implementing CookMode UI tracking user recipe progress on frontend.
- 🧠 Reflection: Keep port 8002 consistent for WSL backends to avoid conflicts with system local processes.

## Evaluation notes (flywheel)

- Failure modes observed: Slow initial database connection handshake causing temporary failure in socket name resolution during startup.
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Add reconnection or longer wait time before verifying API health.
