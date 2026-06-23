---
id: "0012"
title: "Fix i18n and Dashboard Recipes"
stage: "misc"
date: "2025-12-30"
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "001-recipe-content-schema"
branch: "001-recipe-content-schema"
user: "Salman (The Learner)"
command: "/sp.implement specs/001-recipe-content-schema/tasks.md --instruction \"CRITICAL FIX: The dashboard is showing raw i18n keys and no recipes. 1. In 'src/i18n/config.ts', make sure you are exporting the i18n instance. 2. In the main entry point (usually 'src/theme/Root.tsx' or 'src/pages/_app.tsx'), you MUST import the i18n config and use the 'I18nextProvider'. 3. Update 'src/components/dashboard/Dashboard.tsx' to ensure it calls the 'recipeService.listRecipes()' inside a useEffect hook and handles the API response correctly. 4. Fix the i18next warning by ensuring 'initReactI18next' is used before the '.init()' call.\""
labels: ["i18n", "react", "docusaurus", "bugfix"]
links:
  spec: "specs/001-recipe-content-schema/spec.md"
  ticket: null
  adr: null
  pr: null
files:
  - frontend/src/i18n/config.ts
  - frontend/src/theme/Root.tsx
  - frontend/src/components/dashboard/Dashboard.tsx
tests: []
---

## Prompt

CRITICAL FIX: The dashboard is showing raw i18n keys and no recipes. 1. In 'src/i18n/config.ts', make sure you are exporting the i18n instance. 2. In the main entry point (usually 'src/theme/Root.tsx' or 'src/pages/_app.tsx'), you MUST import the i18n config and use the 'I18nextProvider'. 3. Update 'src/components/dashboard/Dashboard.tsx' to ensure it calls the 'recipeService.listRecipes()' inside a useEffect hook and handles the API response correctly. 4. Fix the i18next warning by ensuring 'initReactI18next' is used before the '.init()' call.

## Response snapshot

I fixed the critical i18n and recipe loading issues on the dashboard by:
1.  Updating `src/i18n/config.ts` to ensure `initReactI18next` is initialized before the `.init()` call and setting `useSuspense: false` to resolve raw key rendering issues in Docusaurus.
2.  Creating `src/theme/Root.tsx` to wrap the Docusaurus site with `I18nextProvider`, linking the i18n instance globally.
3.  Updating `src/components/dashboard/Dashboard.tsx` to fetch available recipes using `recipeService.listRecipes()` within a `useEffect` hook, responding to language changes.

## Outcome

- ✅ Impact: Resolved raw i18n key display and enabled recipe loading on the dashboard.
- 🧪 Tests: No automated tests run; verification requires manual browser check.
- 📁 Files: Modified 2 files and created 1 new file.
- 🔁 Next prompts: Verify the dashboard renders correctly and recipes are fetched for each selected language.
- 🧠 Reflection: Docusaurus requires the `Root` component pattern for global providers. Without `I18nextProvider`, `useTranslation` hooks can fail to connect to the initialized i18n instance.

## Evaluation notes (flywheel)

- Failure modes observed: `TodoWrite` validation failed twice due to parameter type mismatch (likely internal schema issue).
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
