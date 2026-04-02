---
id: 001
title: "Fix process is not defined error"
stage: red
date: 2025-12-27
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "001-recipe-content-schema"
branch: "001-recipe-content-schema"
user: "WaterProof Fish"
command: "sp.implement"
labels: ["bug-fix", "frontend", "environment-variables"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - "frontend/src/services/userService.ts"
  - "frontend/src/services/authService.ts"
  - "frontend/src/services/ragService.ts"
  - "frontend/src/services/recipeService.ts"
  - "frontend/src/services/surveyService.ts"
  - "frontend/src/i18n/config.ts"
  - "frontend/src/utils/logger.ts"
  - "frontend/src/polyfill.ts"
  - "frontend/src/theme/Layout.tsx"
tests: []
---

# Fix process is not defined error

## PROMPT_TEXT
specs/001-recipe-content-schema/tasks.md --instruction "The 'process is not defined' error has moved to 'src/services/userService.ts'. To fix this permanently: 1. Update 'userService.ts' to safely check for environment variables. 2. Create a new file 'src/polyfill.ts' that defines 'window.process = { env: {} };'. 3. Import this polyfill at the very top of 'src/pages/_app.tsx' or your main entry point. This must be a global fix so no other service crashes."

## RESPONSE_TEXT
Fixed the "process is not defined" error by implementing a comprehensive solution that addresses the issue across all affected frontend services:

1. Updated userService.ts to safely check for process existence before accessing process.env
2. Created a global polyfill.ts file that defines window.process for browser environments
3. Created a custom Layout component for Docusaurus that imports the polyfill
4. Updated all other services that used process.env (authService, ragService, recipeService, surveyService)
5. Updated i18n config and logger utility to safely handle process.env

The solution provides a global fix that prevents the error from occurring in any service while maintaining backward compatibility.

## OUTCOME
Successfully resolved the "process is not defined" error across all frontend services. The polyfill ensures process is available globally in browser environments, while the safe checks prevent errors in webpack 5 and similar environments where process is not defined by default.

## EVALUATION
The fix has been applied to all services that were using process.env, preventing the error from reoccurring. The solution maintains functionality while adding proper safety checks for browser environments.