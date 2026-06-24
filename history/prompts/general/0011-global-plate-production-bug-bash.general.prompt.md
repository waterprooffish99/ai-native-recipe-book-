---
id: "0011"
title: "Global Plate Production Bug Bash"
stage: "misc"
date: "2026-06-24"
surface: "agent"
model: "Gemini 3.5 Flash"
feature: "none"
branch: "main"
user: "waterprooffish99"
command: "git add . && git commit && git push"
labels: ["bug-bash", "loading-states", "rtl-support", "language-persistence", "progress-bar"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - modified: backend/src/services/recipe_service.py
  - modified: frontend/src/components/ai/ChefAiDrawer.tsx
  - modified: frontend/src/components/recipes/RecipeDetail.tsx
  - modified: frontend/src/components/recipes/RecipeList.tsx
  - modified: frontend/src/components/recipes/StepProgressBar.tsx
  - modified: frontend/src/pages/dashboard.tsx
  - modified: frontend/src/theme/Root.tsx
  - created: frontend/src/components/shared/LanguageSelector.tsx
tests:
  - tests/test_progress_integration.py
  - npm run typecheck
---

## Prompt

```
// EXECUTION DIRECTIVE: GLOBAL PLATE PRODUCTION BUG BASH
// TARGET_DIR: /home/waterprooffish99/projects/recipe-cook-book/
// MODE: SURGICAL UX/UI REPAIR & DATA BINDING

system_context {
  project_state: "App is live on Vercel/Hugging Face. Executing critical Day-1 bug fixes based on user QA."
  guardrails: "Strict Spec-Driven Development. Fix exact issues without refactoring unrelated working code. Protect hydration armor."
}

execute_sequence {
  
  step_1_fix_loading_states {
    description: "Implement visual feedback for cold starts."
    actions: [
      "READ frontend/src/pages/dashboard.tsx (or equivalent entry point).",
      "IMPLEMENT a React loading skeleton or CSS spinner that displays while 'isFetching' or 'isLoading' is true, so the user knows the Hugging Face backend is waking up."
    ]
  }

  step_2_globalize_language_selector {
    description: "Make the language dropdown accessible everywhere."
    actions: [
      "MOVE the LanguageSelector component from the RecipeDetail view into the global Docusaurus Navbar or Root.tsx layout.",
      "ENSURE the language state persists globally when navigating between the dashboard and recipes."
    ]
  }

  step_3_fix_rtl_chat_input {
    description: "Correct the text direction inside the Chef AI chat box."
    actions: [
      "READ frontend/src/components/ai/ChefAiDrawer.tsx.",
      "UPDATE the chat <input> or <textarea> element to include the HTML attribute dir='auto'. This ensures English text aligns left even if the parent container is in RTL mode."
    ]
  }

  step_4_fix_ingredient_translations {
    description: "Ensure the backend returns translated ingredients, not just instructions."
    actions: [
      "READ backend/src/services/recipe_service.py (or the relevant DB query file).",
      "UPDATE the SQL join or ORM logic to ensure that 'ingredients', 'prep_time', and 'difficulty' are fetched from the translation tables when a non-English locale is requested."
    ]
  }

  step_5_wire_progress_bar {
    description: "Connect the static progress bar to the recipe progress state."
    actions: [
      "READ frontend/src/components/recipes/RecipeDetail.tsx and the useRecipeProgress hook.",
      "BIND the 'Cooking Progress' UI component to the actual checked state of the steps. If 2 out of 5 steps are checked, the bar must visually highlight up to step 2."
    ]
  }

  step_6_push_to_production {
    description: "Commit and trigger the Vercel/HF rebuilds."
    commands: [
      "git add .",
      "git commit -m 'Fix: Resolve Day-1 QA bugs (Loading states, Global Dropdown, RTL Chat, Translations, Progress Bar)'",
      "git push origin main"
    ]
    output_format: "markdown"
    requirements: [
      "Confirm all 5 bugs were patched.",
      "Instruct the user to wait 3 minutes for Vercel to deploy, then hard refresh the live URL."
    ]
  }
}
```

## Response snapshot

Implemented all 5 QA bug fixes:
1. Replaced simple spinners with premium loading skeletons in `RecipeList.tsx` and `RecipeDetail.tsx` alongside an explanatory notice about Hugging Face server cold starts.
2. Created `LanguageSelector.tsx` shared component and rendered it in `Root.tsx` header wrapper. Converted `RecipeDetail`, `RecipeList` and `DashboardPage` to derive language directly from global `i18n` context, ensuring persistent state.
3. Updated text inputs in `ChefAiDrawer.tsx` with `dir="auto"` attribute for proper bi-directional text flow.
4. Refactored `get_recipe_by_id` database query in `recipe_service.py` to use a single SQL JOIN fetching `ingredients`, `prep_time`, and `difficulty` in one query, ensuring the correct translation mapping.
5. Calculated `activeLineWidth` based on the highest completed step index in `StepProgressBar.tsx`, connecting it to the actual checked state.
Ran frontend type check and backend integration tests to verify correctness, committed, and pushed to production on the `main` branch.

## Outcome

- ✅ Impact: Resolved all 5 QA bugs on the frontend and backend, improving RTL usability, internationalization, loading states, progress tracking, and database query efficiency.
- 🧪 Tests: Integration tests run successfully (`test_progress_integration.py` passed), and frontend type check completes without errors.
- 📁 Files: Modified `recipe_service.py`, `ChefAiDrawer.tsx`, `RecipeDetail.tsx`, `RecipeList.tsx`, `StepProgressBar.tsx`, `dashboard.tsx`, `Root.tsx`, and created `LanguageSelector.tsx`.
- 🔁 Next prompts: Monitor Vercel build logs and do a manual verification of translations, loading state animations, progress bar fills, and RTL cursor alignment.
- 🧠 Reflection: Performing single SQL joins in database methods rather than multiple queries increases API performance and simplifies translation fallbacks.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): none
