---
id: 001
title: "Fix i18n Path Errors"
stage: refactor
date_iso: "2025-12-30"
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "001-recipe-content-schema"
branch: "001-recipe-content-schema"
user: "WaterProof Fish"
command: "sp.implement"
labels: ["i18n", "localization", "path-error", "refactor"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - "frontend/src/i18n/config.ts"
  - "specs/001-recipe-content-schema/tasks.md"
tests_yaml: []
---

# Fix i18n Path Errors

## User Input
```
specs/001-recipe-content-schema/tasks.md --instruction "FIX PATH ERRORS: The i18n config cannot find the JSON files. 1. Check if the translation files are in 'src/locales/recipes/' or 'src/locales/'. 2. Update 'src/i18n/config.ts' to use the correct relative paths to these JSON files. 3. Ensure the imports in 'src/i18n/config.ts' match the actual file names (en.json, ur.json, etc.) that were created in T046-T051."
```

## Solution

### Problem
The i18n configuration was trying to import translation files from the wrong location. The files were located in `frontend/src/locales/recipes/` and `frontend/src/locales/metaphors/` but the config was looking for them in `frontend/src/locales/`.

### Changes Made

1. **Updated import paths in `frontend/src/i18n/config.ts`**:
   - Changed recipe translation imports from `../locales/*.json` to `../locales/recipes/*.json`
   - Added imports for metaphor translation files from `../locales/metaphors/*.json`
   - Combined both recipe and metaphor translations into the resources object using spread syntax

2. **Enhanced i18n configuration**:
   - Now properly loads both recipe translations and metaphor translations
   - Metaphor translations are nested under the `metaphors` key as expected by the metaphorMapper utility

3. **Updated task completion status**:
   - Marked T046-T051 as completed in `specs/001-recipe-content-schema/tasks.md` since the translation files exist and are now properly configured

### Technical Details

The configuration now properly supports:
- Recipe translations under the default namespace (accessed via `t('key')`)
- Metaphor translations under the `metaphors` namespace (accessed via `t('metaphors.key')`)
- All 6 supported languages (en, ur, ar, es, fr, fa)
- Right-to-left language support for Arabic, Persian, and Urdu

## Response Summary
Fixed i18n path errors by updating import paths in the configuration file to match the actual location of translation files. The configuration now properly loads both recipe translations (for the recipe content) and metaphor translations (for personalized user experience) from their respective directories.

## Outcome
- [X] Translation files are now correctly loaded from `frontend/src/locales/recipes/`
- [X] Metaphor translation files are now correctly loaded from `frontend/src/locales/metaphors/`
- [X] i18n configuration properly combines both translation types
- [X] All 6 language files are properly imported and accessible
- [X] Tasks T046-T051 marked as completed since files exist and are configured