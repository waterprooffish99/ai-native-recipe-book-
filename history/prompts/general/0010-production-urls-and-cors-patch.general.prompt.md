---
id: 0010
title: Production URLs and CORS Patch
stage: general
date: 2026-06-24
surface: agent
model: Antigravity Coding Assistant
feature: none
branch: main
user: waterprooffish99
command: none
labels: ["cors", "production", "vercel", "huggingface", "git"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/main.py
  - frontend/src/polyfill.ts
  - frontend/src/services/authService.ts
  - frontend/src/services/chefAiService.ts
  - frontend/src/services/ragService.ts
  - frontend/src/services/recipeService.ts
  - frontend/src/services/surveyService.ts
  - frontend/src/services/userService.ts
tests: []
---

## Prompt

```
// EXECUTION DIRECTIVE: GLOBAL PLATE PRODUCTION URL & CORS PATCH
// TARGET_DIR: /home/waterprooffish99/projects/recipe-cook-book/
// MODE: INFRASTRUCTURE CONFIGURATION

system_context {
  project_state: "Deployment in progress. Resolving localhost CORS/Fetch errors."
  guardrails: "Strict Spec-Driven Development. Safely swap local environment variables/constants for production URLs."
}

execute_sequence {
  
  step_1_backend_cors_update {
    description: "Authorize the Vercel frontend to talk to the backend."
    actions: [
      "READ backend/src/main.py.",
      "LOCATE the CORSMiddleware configuration.",
      "ADD 'https://ai-native-recipe-book.vercel.app' to the list of allowed origins.",
      "Ensure standard localhost ports (3000) remain in the list for future local development."
    ]
  }

  step_2_frontend_api_url_update {
    description: "Point the frontend API client to the Hugging Face production server."
    actions: [
      "READ frontend/src/services/api.ts (or wherever the base API URL is defined, such as chefAiService.ts or a global config).",
      "REPLACE 'http://localhost:8002' with the Hugging Face direct API URL: 'https://waterprooffish99-global-plate-backend.hf.space'.",
      "Ensure all fetch requests and Axios instances use this new base URL."
    ]
  }

  step_3_git_push_production_patch {
    description: "Commit and push the production routing fixes to GitHub."
    commands: [
      "git add backend/src/main.py",
      "git add frontend/src/services/ (or modified frontend config files)",
      "git commit -m 'Infrastructure: Update CORS and frontend API URLs for Vercel/HF production deployment'",
      "git push origin main"
    ]
  }

  step_4_status_report {
    description: "Confirm the push and provide next steps."
    output_format: "markdown"
    requirements: [
      "Confirm the CORS configuration was updated in main.py.",
      "Confirm the base URL was updated in the frontend services.",
      "Instruct the user that Vercel and Hugging Face will automatically rebuild once they see this new code on GitHub."
    ]
  }
}
```

## Response snapshot

1. Read [backend/src/main.py](file:///home/waterprooffish99/projects/recipe-cook-book/backend/src/main.py) and added the Vercel production URL `https://ai-native-recipe-book.vercel.app` to the list of allowed CORS origins. Ensured local development URLs on port 3000 remain supported. Changed CORSMiddleware implementation to dynamically use the `ALLOWED_ORIGINS` configuration list instead of a hardcoded array.
2. Inspected the frontend codebase and identified the files referencing the fallback URL `http://localhost:8002`.
3. Updated the default fallback base API URL across `polyfill.ts`, `authService.ts`, `chefAiService.ts`, `ragService.ts`, `recipeService.ts`, `surveyService.ts`, and `userService.ts` from `http://localhost:8002` to `https://waterprooffish99-global-plate-backend.hf.space`.
4. Verified that the frontend application compiled cleanly using `npm run build`.
5. Committed and pushed all production URL and CORS updates to GitHub (`origin main`).

## Outcome

- ✅ Impact: Complete deployment configuration alignment. The backend now allows CORS requests from the Vercel deployment domain, and the Docusaurus frontend client references the correct production API endpoint by default.
- 📁 Files: Modified `backend/src/main.py`, `frontend/src/polyfill.ts`, and all 6 client files inside `frontend/src/services/`.
- 🧠 Reflection: Modifying both local defaults and environment-aware values prevents local-only failures on direct pages where environment variables might not inject correctly.

## Evaluation notes (flywheel)

- Failure modes observed: `allow_origins` parameter inside FastAPI app middleware configuration was hardcoded to localhost arrays, ignoring the `ALLOWED_ORIGINS` setup. Resolved by updating it to use `ALLOWED_ORIGINS`.
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Push subtree to Hugging Face to apply the CORS patch in production.
