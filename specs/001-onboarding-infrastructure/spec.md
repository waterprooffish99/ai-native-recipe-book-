# Feature Specification: Core Infrastructure & Personalized Onboarding

**Feature Branch**: `001-onboarding-infrastructure`
**Created**: 2025-12-22
**Status**: Draft
**Input**: User description: "Core Infrastructure & Personalized Onboarding - This feature establishes the Entry Point of the Global Plate app with user authentication, technical/cooking background capture, and AI Voice Companion selection."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - First-Time User Authentication & Account Creation (Priority: P1)

A new user discovers Global Plate and wants to create an account to access personalized recipe content. They should be able to sign up using their email or Google account without friction.

**Why this priority**: Without authentication, no personalization or progress tracking is possible. This is the absolute foundation - nothing else works without it.

**Independent Test**: Can be fully tested by attempting to create an account via email and via Google OAuth, then verifying the user profile exists in the system and they can log in again.

**Acceptance Scenarios**:

1. **Given** a new user visits the app, **When** they choose "Sign up with Email" and provide valid credentials, **Then** their account is created and they are logged in
2. **Given** a new user visits the app, **When** they choose "Sign up with Google" and authorize, **Then** their account is created using Google OAuth and they are logged in
3. **Given** a user attempts to sign up with an already-registered email, **When** they submit the form, **Then** they see an error message and are offered a "Login instead" option
4. **Given** a user provides invalid email format, **When** they submit the form, **Then** they see inline validation errors before submission

---

### User Story 2 - Kitchen Intelligence Survey (Personalization Foundation) (Priority: P1)

After creating an account, the user completes a brief survey capturing their background and preferences. This data enables the AI to provide personalized cooking metaphors and explanations.

**Why this priority**: Personalization is a core constitutional principle (Principle VI). Without this survey, the app cannot adapt explanations to user backgrounds (e.g., "sauté = software update" for developers).

**Independent Test**: Can be fully tested by completing the survey with different backgrounds (developer, mechanic, student) and verifying that the data is stored correctly and later used for recipe adaptation.

**Acceptance Scenarios**:

1. **Given** a newly registered user completes authentication, **When** they are redirected to the onboarding flow, **Then** they see the Kitchen Intelligence Survey as the first mandatory step
2. **Given** a user is on the survey page, **When** they select "Software/Hardware Background" options (dropdown or multi-select with options like Developer, Mechanic, Student, Teacher, Healthcare, Other), **Then** their selection is captured
3. **Given** a user completes background selection, **When** they select their cooking skill level (Absolute Beginner, Beginner, Beginner+), **Then** their skill level is recorded
4. **Given** a user has filled all required survey fields, **When** they click "Continue", **Then** their profile is updated and they proceed to voice selection
5. **Given** a user attempts to skip the survey, **When** they try to navigate away, **Then** they see a message explaining personalization benefits and are encouraged to complete it

---

### User Story 3 - AI Voice Companion Selection (Priority: P1)

The user previews and selects their preferred AI voice companion from 7 distinct personalities. This voice will guide them through recipes with audio instructions.

**Why this priority**: Voice-first navigation is a core constitutional principle (Principle I and V). The user must choose their "Kitchen Partner" voice before they can use any voice-guided features.

**Independent Test**: Can be fully tested by playing 3-second samples of all 7 voices, selecting one, verifying it's saved to the user profile, and confirming it's used in subsequent voice interactions.

**Acceptance Scenarios**:

1. **Given** a user completes the Kitchen Intelligence Survey, **When** they proceed to voice selection, **Then** they see cards for all 7 voice options (Arlow, Silas, Hugo, Omar, Felix, Elara, Maya) with a play button on each
2. **Given** a user is on the voice selection page, **When** they click the play button on any voice card, **Then** they hear a 3-second friendly sample (e.g., "Hi, I'm Elara! I'll be your cooking companion. Ready to get started?")
3. **Given** a user has listened to voice samples, **When** they select their preferred voice and click "Choose This Voice", **Then** their preference is saved to their profile
4. **Given** a user has selected a voice, **When** they later use voice-guided features, **Then** their chosen voice personality is used for all audio responses
5. **Given** a user wants to change their voice later, **When** they navigate to settings, **Then** they can re-select from the 7 voice options

---

### User Story 4 - Language Preference Selection (Priority: P1)

The user selects their preferred language from 6 supported options. The entire UI adapts to their choice instantly.

**Why this priority**: Multi-language support is a core constitutional principle (Principle I). Without language selection, non-English speakers cannot access content in their native language.

**Independent Test**: Can be fully tested by selecting each of the 6 languages (English, Urdu, Arabic, Spanish, French, Persian) and verifying the UI text updates instantly without page reload.

**Acceptance Scenarios**:

1. **Given** a user is in the onboarding flow, **When** they reach language selection (can be part of the survey or a separate step), **Then** they see all 6 language options with native script labels (e.g., "اردو" for Urdu, "العربية" for Arabic)
2. **Given** a user selects a language, **When** they confirm their choice, **Then** the UI immediately switches to that language without page reload
3. **Given** a user has selected a language, **When** they complete onboarding, **Then** all subsequent app content is displayed in their chosen language
4. **Given** a user wants to change their language later, **When** they use the "Translate Now" floating button, **Then** they can instantly switch to any of the 6 languages

---

### User Story 5 - Dashboard & Progress Tracking (Priority: P2)

After completing onboarding, the user sees a personalized dashboard showing their progress (recipes mastered) and quick access to features.

**Why this priority**: While not blocking core functionality, the dashboard provides motivation and context for users. It's the "home base" after authentication.

**Independent Test**: Can be fully tested by completing onboarding, viewing the dashboard with zero recipes mastered, then marking recipes as complete and verifying the progress ring updates.

**Acceptance Scenarios**:

1. **Given** a user completes onboarding, **When** they are redirected to the dashboard, **Then** they see a welcome message personalized with their name and chosen voice companion
2. **Given** a user views the dashboard, **When** the page loads, **Then** they see a "Progress Ring" visualization showing 0/N recipes mastered (N = total beginner recipes available)
3. **Given** a user completes a recipe, **When** they mark it as "Mastered", **Then** the progress ring updates to reflect the new count (e.g., 1/N)
4. **Given** a user views the dashboard, **When** they look at the UI, **Then** they see quick access cards for "Browse Recipes", "Continue Last Recipe", and "Favorites"
5. **Given** a user is on any page, **When** they click the "Translate Now" floating button, **Then** they can toggle between the 6 supported languages instantly

---

### Edge Cases

- What happens when a user's OAuth provider (Google) is unavailable during login? System should show a friendly error message and offer email login as fallback.
- What happens when a user closes the browser during onboarding survey? System should save partial progress and resume from the last completed step on next login.
- What happens when audio playback fails for voice samples (e.g., network issues, blocked autoplay)? System should show a "Click to play" button with retry logic and a text description of the voice personality.
- What happens when a user's browser doesn't support speech recognition for voice input? System should gracefully degrade to text input with a message explaining voice features require a modern browser.
- What happens when a user selects a language and then changes it mid-session? All dynamic content should update instantly, but already-loaded static content might require page refresh (document this behavior).
- What happens when the database connection fails during profile updates? System should queue the update for retry and show a temporary success message, then sync when connection is restored.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support email/password authentication with secure password hashing
- **FR-002**: System MUST support Google OAuth2 authentication
- **FR-003**: System MUST prevent duplicate account creation with the same email address
- **FR-004**: System MUST validate email format and password strength (min 8 characters, at least one number or special character) before account creation
- **FR-005**: System MUST require Kitchen Intelligence Survey completion before allowing access to main app features
- **FR-006**: System MUST capture user's software/hardware background with predefined options: Developer, Mechanic, Student, Teacher, Healthcare, Hospitality, Other, None/Prefer not to say
- **FR-007**: System MUST capture user's cooking skill level with three options: Absolute Beginner, Beginner, Beginner+
- **FR-008**: System MUST capture user's dietary restrictions/preferences (optional field for free text, e.g., "vegetarian", "gluten-free", "halal")
- **FR-009**: System MUST provide audio samples for all 7 voice personalities (Arlow, Silas, Hugo, Omar, Felix, Elara, Maya)
- **FR-010**: Voice samples MUST be 3 seconds long and include a friendly greeting introducing the voice personality
- **FR-011**: System MUST save user's selected voice preference to their profile
- **FR-012**: System MUST support 6 languages: English (en), Urdu (ur), Arabic (ar), Spanish (es), French (fr), Persian (fa)
- **FR-013**: System MUST allow users to select their preferred language during onboarding
- **FR-014**: System MUST persist user's language preference across sessions
- **FR-015**: System MUST provide a "Translate Now" floating button accessible from all pages
- **FR-016**: Language switching MUST update UI text instantly without full page reload (for dynamic content)
- **FR-017**: System MUST display a dashboard after onboarding completion showing user's name and voice companion
- **FR-018**: Dashboard MUST include a "Progress Ring" visualization showing recipes mastered out of total available beginner recipes
- **FR-019**: System MUST allow users to change their voice preference and language preference later via account settings
- **FR-020**: System MUST store all user profile data persistently in the database

### Key Entities

- **User**: Represents a registered user with authentication credentials (email, password hash, OAuth provider ID), profile data (name, software_background, hardware_background, cooking_level, dietary_restrictions, preferred_voice, preferred_language), and progress tracking (recipes_mastered count, last_recipe_viewed, created_at, last_login)
- **Voice Personality**: Represents one of 7 AI voice options with attributes (voice_id, name, audio_sample_url, personality_description, gender, cultural_appropriateness_notes)
- **Session**: Represents an active user session with attributes (session_token, user_id, expires_at, device_info)
- **Survey Response**: Represents the completed Kitchen Intelligence Survey with relationships to User (one-to-one), capturing all onboarding data in a structured format for analytics

### Accessibility Requirements *(mandatory for Global Plate)*

- **Voice Support**: Voice samples must play for all 7 personalities. Voice input is not required at this stage (onboarding is visual/text-based), but voice output must work for sample playback.
- **Language Support**: All 6 languages (EN, UR, AR, ES, FR, FA) must be supported. Onboarding flow text (survey questions, labels, button text) must be translated for all languages.
- **Visual Support**: All form fields must have clear labels with appropriate icons. Progress indicators (e.g., "Step 2 of 4") must be visible. Voice selection cards must include visual personality descriptions (text + avatar/icon) for users who cannot play audio.
- **Beginner-Friendly**: Onboarding flow must be linear and simple (max 4-5 screens total). Each step must have a clear "Continue" or "Next" button. No complex navigation or multi-step forms on a single screen.
- **Safety**: Not applicable for authentication/onboarding feature (no cooking instructions involved).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of new users successfully complete account creation on their first attempt (measured by account creation success rate)
- **SC-002**: 90% of users who start the Kitchen Intelligence Survey complete it without abandoning (measured by survey completion rate)
- **SC-003**: 100% of users who complete onboarding have a valid voice preference and language preference stored in their profile (data integrity check)
- **SC-004**: Users can switch languages and see UI text update in under 500ms (meets constitutional performance requirement)
- **SC-005**: Voice samples load and play within 2 seconds of clicking the play button (meets constitutional voice response requirement)
- **SC-006**: 80% of users can complete the entire onboarding flow (authentication → survey → voice selection → language selection → dashboard) in under 5 minutes
- **SC-007**: System maintains 99.9% uptime for authentication services (excludes scheduled maintenance)
- **SC-008**: Zero security incidents related to authentication vulnerabilities (password leaks, OAuth token exposure) in the first 3 months post-launch
- **SC-009**: Dashboard loads within 3 seconds of onboarding completion on 3G networks (meets constitutional recipe load requirement)

### Assumptions

- **Assumption 1**: Users have access to a modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+) with JavaScript enabled. Graceful degradation for older browsers is not in scope for MVP.
- **Assumption 2**: Voice sample audio files are pre-recorded and hosted on a CDN for fast delivery. Dynamic voice generation is not required for this feature.
- **Assumption 3**: Translation files for all 6 languages are provided by a translation service or manually created. Machine translation quality is verified for accuracy (not automated translation without review).
- **Assumption 4**: Better-Auth library is used for authentication implementation (per constitutional tech stack requirement). This provides email/password and OAuth2 support out-of-the-box.
- **Assumption 5**: Neon Postgres is used as the database (per constitutional requirement). Schema migrations are managed via a migration tool (e.g., Prisma, TypeORM, or raw SQL migrations).
- **Assumption 6**: Google OAuth2 is the only social login provider for MVP. Additional providers (Facebook, Apple) can be added later if needed.
- **Assumption 7**: The "ProfileAdapter" agent skill (mentioned in technical requirements) will be implemented as a separate feature/service that consumes user profile data. This spec focuses on capturing and storing the profile data.
- **Assumption 8**: Progress tracking (recipes mastered count) is a simple counter for MVP. Detailed progress analytics (time per recipe, success rate) are out of scope.
- **Assumption 9**: The "Translate Now" floating button is a UI component available globally. Translation logic is handled by a localization library (e.g., i18next, react-intl).
- **Assumption 10**: Context7 MCP is used to fetch the latest Better-Auth and Docusaurus documentation during implementation planning (not during spec creation).

### Dependencies

- **Dependency 1**: Voice sample audio files for all 7 personalities (Arlow, Silas, Hugo, Omar, Felix, Elara, Maya) must be recorded and provided before implementation begins.
- **Dependency 2**: Translation files for onboarding flow text in all 6 languages (EN, UR, AR, ES, FR, FA) must be completed before UI development.
- **Dependency 3**: Better-Auth library documentation must be consulted to understand OAuth2 setup and session management.
- **Dependency 4**: Neon Postgres database must be provisioned and connection credentials must be available.
- **Dependency 5**: Design system or UI component library must define styles for form inputs, buttons, progress rings, and voice selection cards (if not using default Docusaurus theme).
- **Dependency 6**: CDN or file storage service must be set up for hosting voice sample audio files and user avatars (if applicable).

### Out of Scope (for this feature)

- **Out of Scope 1**: Recipe content creation and management (recipes are consumed by this feature, not created).
- **Out of Scope 2**: RAG chatbot implementation (this feature captures user data that the RAG system will consume later).
- **Out of Scope 3**: Voice input (speech-to-text) for user interactions. Only voice output (text-to-speech for samples) is in scope.
- **Out of Scope 4**: Recipe adaptation logic based on user background (this is the "ProfileAdapter" skill, a separate feature).
- **Out of Scope 5**: Password reset and account recovery flows (can be added in a follow-up iteration).
- **Out of Scope 6**: Email verification for new accounts (optional security enhancement for later).
- **Out of Scope 7**: Two-factor authentication (2FA) or multi-factor authentication (MFA).
- **Out of Scope 8**: Admin dashboard for managing users, viewing analytics, or moderating content.
- **Out of Scope 9**: Social features (user profiles visible to others, following/followers, sharing recipes).
- **Out of Scope 10**: Offline mode or progressive web app (PWA) capabilities.

## Notes

### Design Considerations

- **Voice Personality Descriptions**: Each voice card should include a short text description of the personality (e.g., "Arlow - Warm and encouraging, perfect for beginners") to help users who cannot play audio make an informed choice.
- **Right-to-Left (RTL) Language Support**: Arabic, Urdu, and Persian require RTL text direction. Ensure the UI layout adapts correctly (buttons, navigation, text alignment).
- **Survey Field Validation**: All required survey fields (background, cooking level, language) should have inline validation with clear error messages. Optional fields (dietary restrictions) should be clearly marked as optional.
- **Onboarding Progress Indicator**: Show users where they are in the onboarding flow (e.g., "Step 2 of 4: Kitchen Intelligence Survey") to reduce anxiety and increase completion rates.
- **Mobile Responsiveness**: All onboarding screens must work seamlessly on mobile devices (touch-friendly buttons, no horizontal scrolling, readable text without zooming).

### Future Enhancements (not in this spec)

- Add more social login providers (Apple, Facebook, Twitter)
- Implement email verification for new accounts
- Add password reset and account recovery flows
- Allow users to update profile information (name, background, dietary restrictions) after onboarding
- Add onboarding tutorial or walkthrough for first-time users after dashboard loads
- Implement analytics tracking for onboarding funnel (drop-off rates at each step)
- Add gamification elements (badges, achievements) for completing onboarding and mastering recipes
