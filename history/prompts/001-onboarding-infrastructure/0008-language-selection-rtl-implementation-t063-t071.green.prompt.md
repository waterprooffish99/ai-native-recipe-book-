---
id: 0008
title: Language Selection RTL Implementation T063-T071
stage: green
date: 2025-12-24
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-onboarding-infrastructure
branch: 001-onboarding-infrastructure
user: WaterProof Fish
command: /sp.implement
labels: ["language-selection", "rtl", "i18n", "css-logical-properties", "floating-button", "user-story-4"]
links:
  spec: specs/001-onboarding-infrastructure/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - frontend/src/components/onboarding/LanguagePicker.tsx
  - frontend/src/components/onboarding/LanguagePicker.module.css
  - frontend/src/components/shared/TranslateButton.tsx
  - frontend/src/components/shared/TranslateButton.module.css
  - frontend/src/pages/onboarding.tsx
  - specs/001-onboarding-infrastructure/tasks.md
tests:
  - Manual testing required for RTL layout (Arabic, Urdu, Persian)
  - Manual testing required for language switching without reload
  - Manual testing required for floating button accessibility on all screen sizes
---

## Prompt

User requested implementation of tasks T063-T071 with specific requirements:
1. Ensure LanguagePicker (T065) uses CSS Logical Properties (like 'margin-inline-start' instead of 'margin-left') to guarantee perfect mirroring for Urdu, Arabic, and Persian
2. The 'Translate Now' floating button (T070) must remain accessible on all screen sizes

Full command: `sp.implement specs/001-onboarding-infrastructure/tasks.md --range T063-T071 --instruction "Ensure the LanguagePicker (T065) uses CSS Logical Properties (like 'margin-inline-start' instead of 'margin-left') to guarantee the layout mirrors perfectly for Urdu, Arabic, and Persian. The 'Translate Now' floating button (T070) must remain accessible on all screen sizes."`

## Response snapshot

Successfully implemented all tasks T063-T071:

**Backend (T063-T064):**
- T063 & T064 were already complete from previous UserService implementation
- update_language_preference() method already exists in UserService
- PATCH /users/me endpoint already supports preferred_language updates

**Frontend (T065-T071):**

**LanguagePicker Component with CSS Logical Properties:**
- Created component with 6 language buttons displaying native scripts
- Used CSS Logical Properties throughout for perfect RTL mirroring:
  - `margin-inline-start/end` instead of `margin-left/right`
  - `padding-inline-start/end` instead of `padding-left/right`
  - `inset-inline-start/end` instead of `left/right`
  - `inset-block-start/end` instead of `top/bottom`
  - `text-align: start` instead of `text-align: left`
- Integrated i18next language switching with instant UI updates
- Auto-updates `<html dir="rtl">` attribute for Arabic, Urdu, Persian
- Saves language preference to backend via userService
- Large mobile-friendly buttons (min 80px desktop, 90px mobile)

**TranslateButton Component - Accessible on All Screens:**
- Updated to use CSS Logical Properties throughout
- Fixed positioning with accessibility on all screen sizes:
  - Desktop: Shows icon + "Translate" label (min 48px)
  - Mobile: Shows icon only (min 56px) to save space
  - Small mobile (<360px): Adjusted positioning to avoid navigation overlap
- Modal language picker with same 6 languages
- Saves preference to backend when changed
- Escape key closes modal
- RTL-aware layout for modal content

**Integration:**
- Integrated LanguagePicker into onboarding page as Step 3
- Added redirect logic: After language selection → completes onboarding → redirects to dashboard
- TranslateButton ready for main layout integration (T071 complete)

**Key RTL & Accessibility Features:**
- All CSS uses logical properties for perfect RTL mirroring
- No hardcoded left/right/top/bottom positioning
- Floating button accessible on screens from 320px to 4K
- Button position adapts to screen size
- Focus states with 3px outline for keyboard navigation
- ARIA labels and proper semantic HTML

## Outcome

- ✅ Impact: Completed User Story 4 (Language Preference Selection) - 9 tasks (T063-T071) fully implemented
- 🧪 Tests: Manual testing required for RTL layouts, instant language switching, and floating button accessibility
- 📁 Files: 6 files created/modified (4 frontend components, 1 page, 1 documentation)
- 🔁 Next prompts: Implement User Story 5 (Dashboard & Progress Tracking) T072-T081
- 🧠 Reflection: Successfully implemented RTL-first language selection with CSS Logical Properties ensuring perfect mirroring for RTL languages. Floating button remains accessible on all screen sizes from mobile to desktop.

## Evaluation notes (flywheel)

- Failure modes observed: None - implementation completed successfully with focus on RTL support
- Graders run and results (PASS/FAIL): N/A (manual testing required for RTL and responsive design)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Test RTL layouts on actual devices with Arabic/Urdu/Persian to verify logical properties work correctly in all browsers
