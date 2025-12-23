# Data Model: Core Infrastructure & Personalized Onboarding

**Feature**: 001-onboarding-infrastructure
**Created**: 2025-12-22
**Status**: Design Phase

## Overview

This document defines the database schema and data relationships for user authentication, profile management, and onboarding survey data capture. All entities are stored in Neon Serverless Postgres.

## Entity Definitions

### 1. User

Represents a registered user with authentication credentials and profile data.

**Table Name**: `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User's email address (used for login) |
| `password_hash` | VARCHAR(255) | NULLABLE | Bcrypt hashed password (NULL if OAuth-only user) |
| `oauth_provider` | VARCHAR(50) | NULLABLE | OAuth provider name (e.g., "google") |
| `oauth_provider_id` | VARCHAR(255) | NULLABLE | User ID from OAuth provider |
| `name` | VARCHAR(255) | NOT NULL | User's full name |
| `software_background` | VARCHAR(100) | NULLABLE | Software/hardware background (e.g., "Developer", "Mechanic", "Student") |
| `hardware_background` | VARCHAR(100) | NULLABLE | Additional hardware background detail |
| `cooking_level` | VARCHAR(50) | NOT NULL, DEFAULT 'Absolute Beginner' | Cooking skill level: "Absolute Beginner", "Beginner", "Beginner+" |
| `dietary_restrictions` | TEXT | NULLABLE | Free-text dietary restrictions (e.g., "vegetarian, gluten-free") |
| `preferred_voice` | VARCHAR(50) | NULLABLE | Selected voice personality: "arlow", "silas", "hugo", "omar", "felix", "elara", "maya" |
| `preferred_language` | VARCHAR(5) | NOT NULL, DEFAULT 'en' | ISO 639-1 language code: "en", "ur", "ar", "es", "fr", "fa" |
| `recipes_mastered` | INTEGER | NOT NULL, DEFAULT 0 | Count of recipes marked as mastered |
| `last_recipe_viewed` | UUID | NULLABLE, FOREIGN KEY(recipes.id) | Reference to last viewed recipe (future feature) |
| `onboarding_completed` | BOOLEAN | NOT NULL, DEFAULT FALSE | Whether user completed Kitchen Intelligence Survey |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |
| `last_login` | TIMESTAMP | NULLABLE | Last successful login timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Last profile update timestamp |

**Indexes**:
- `idx_users_email` on `email` (for fast login lookups)
- `idx_users_oauth` on `oauth_provider, oauth_provider_id` (for OAuth user lookups)

**Validation Rules**:
- `email` must match regex: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
- `password_hash` must be present if `oauth_provider` is NULL (email/password users require password)
- `cooking_level` must be one of: "Absolute Beginner", "Beginner", "Beginner+"
- `preferred_voice` must be one of: "arlow", "silas", "hugo", "omar", "felix", "elara", "maya" (if not NULL)
- `preferred_language` must be one of: "en", "ur", "ar", "es", "fr", "fa"

**State Transitions**:
- New user → `onboarding_completed = FALSE`
- After survey submission → `onboarding_completed = TRUE`
- Cannot access main app features until `onboarding_completed = TRUE`

---

### 2. Session

Represents an active user session with JWT token and expiration.

**Table Name**: `sessions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique session identifier |
| `user_id` | UUID | NOT NULL, FOREIGN KEY(users.id) ON DELETE CASCADE | Reference to user |
| `token` | VARCHAR(500) | UNIQUE, NOT NULL | JWT token string |
| `expires_at` | TIMESTAMP | NOT NULL | Session expiration timestamp |
| `device_info` | JSONB | NULLABLE | Device metadata (user agent, IP address, etc.) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Session creation timestamp |

**Indexes**:
- `idx_sessions_user_id` on `user_id` (for fetching all user sessions)
- `idx_sessions_token` on `token` (for fast token validation lookups)
- `idx_sessions_expires_at` on `expires_at` (for cleanup of expired sessions)

**Validation Rules**:
- `expires_at` must be greater than `created_at`
- `token` must be a valid JWT string

**State Transitions**:
- New session created on login → `expires_at` set to NOW() + 7 days
- Session invalidated on logout → row deleted from table
- Expired sessions cleaned up via background job (cron)

---

### 3. Survey Response

Represents the completed Kitchen Intelligence Survey data (one-to-one with User).

**Table Name**: `survey_responses`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique survey response identifier |
| `user_id` | UUID | UNIQUE, NOT NULL, FOREIGN KEY(users.id) ON DELETE CASCADE | Reference to user (one-to-one) |
| `software_background` | VARCHAR(100) | NULLABLE | Software/hardware background selection |
| `hardware_background` | VARCHAR(100) | NULLABLE | Additional hardware background detail |
| `cooking_level` | VARCHAR(50) | NOT NULL | Cooking skill level: "Absolute Beginner", "Beginner", "Beginner+" |
| `dietary_restrictions` | TEXT | NULLABLE | Free-text dietary restrictions |
| `preferred_voice` | VARCHAR(50) | NOT NULL | Selected voice personality |
| `preferred_language` | VARCHAR(5) | NOT NULL | Selected language preference |
| `submitted_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Survey submission timestamp |

**Indexes**:
- `idx_survey_user_id` on `user_id` (for fast user survey lookups)

**Validation Rules**:
- `cooking_level` must be one of: "Absolute Beginner", "Beginner", "Beginner+"
- `preferred_voice` must be one of: "arlow", "silas", "hugo", "omar", "felix", "elara", "maya"
- `preferred_language` must be one of: "en", "ur", "ar", "es", "fr", "fa"
- One survey response per user (enforced via UNIQUE constraint on `user_id`)

**Relationship with User**:
- When survey is submitted, copy data to `users` table and set `users.onboarding_completed = TRUE`
- Survey responses are immutable (no updates after submission, only read for analytics)

---

### 4. Voice Personality (Reference Data)

Represents the 7 available AI voice personalities. This is reference data, not user-specific.

**Table Name**: `voice_personalities`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR(50) | PRIMARY KEY | Voice ID: "arlow", "silas", "hugo", "omar", "felix", "elara", "maya" |
| `name` | VARCHAR(100) | NOT NULL | Display name (e.g., "Arlow") |
| `gender` | VARCHAR(20) | NOT NULL | "Male" or "Female" |
| `personality_description` | TEXT | NOT NULL | Short description (e.g., "Warm and encouraging, perfect for beginners") |
| `audio_sample_url` | VARCHAR(500) | NOT NULL | CDN URL to 3-second audio sample file |
| `cultural_appropriateness` | TEXT | NULLABLE | Notes on cultural suitability (e.g., "Neutral accent, globally appropriate") |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

**Data Seeded at Deployment**:
```sql
INSERT INTO voice_personalities (id, name, gender, personality_description, audio_sample_url, cultural_appropriateness) VALUES
('arlow', 'Arlow', 'Male', 'Warm and encouraging, perfect for beginners', 'https://cdn.example.com/voices/arlow.mp3', 'Neutral accent, globally appropriate'),
('silas', 'Silas', 'Male', 'Calm and patient, great for detailed instructions', 'https://cdn.example.com/voices/silas.mp3', 'Neutral accent, globally appropriate'),
('hugo', 'Hugo', 'Male', 'Energetic and motivating, keeps you engaged', 'https://cdn.example.com/voices/hugo.mp3', 'Neutral accent, globally appropriate'),
('omar', 'Omar', 'Male', 'Friendly and conversational, feels like a cooking buddy', 'https://cdn.example.com/voices/omar.mp3', 'Neutral accent, globally appropriate'),
('felix', 'Felix', 'Male', 'Clear and precise, ideal for following steps', 'https://cdn.example.com/voices/felix.mp3', 'Neutral accent, globally appropriate'),
('elara', 'Elara', 'Female', 'Gentle and supportive, builds your confidence', 'https://cdn.example.com/voices/elara.mp3', 'Neutral accent, globally appropriate'),
('maya', 'Maya', 'Female', 'Cheerful and upbeat, makes cooking fun', 'https://cdn.example.com/voices/maya.mp3', 'Neutral accent, globally appropriate');
```

**Validation Rules**:
- `id` must be one of the 7 predefined values
- `audio_sample_url` must be a valid URL
- Gender must be "Male" or "Female"

---

## Entity Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                         Users Table                         │
│ ─────────────────────────────────────────────────────────── │
│ id (PK), email, password_hash, oauth_provider, name,        │
│ software_background, cooking_level, preferred_voice,        │
│ preferred_language, recipes_mastered, onboarding_completed  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ 1:N (one user, many sessions)
                        │
                        ▼
        ┌───────────────────────────────┐
        │      Sessions Table           │
        │ ───────────────────────────── │
        │ id (PK), user_id (FK),        │
        │ token, expires_at             │
        └───────────────────────────────┘

                        │
                        │ 1:1 (one user, one survey response)
                        │
                        ▼
        ┌───────────────────────────────┐
        │   Survey Responses Table      │
        │ ───────────────────────────── │
        │ id (PK), user_id (FK UNIQUE), │
        │ software_background,          │
        │ cooking_level, preferred_voice│
        └───────────────────────────────┘

                        │
                        │ Reference (users.preferred_voice → voice_personalities.id)
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Voice Personalities Table    │
        │ ───────────────────────────── │
        │ id (PK), name, gender,        │
        │ personality_description,      │
        │ audio_sample_url              │
        └───────────────────────────────┘
```

## Database Migration Strategy

**Migration Tool**: Alembic (Python database migration tool)

**Migration Files** (in `backend/src/db/migrations/`):
1. `001_create_users_table.sql` - Create users table with indexes
2. `002_create_sessions_table.sql` - Create sessions table with indexes
3. `003_create_survey_responses_table.sql` - Create survey_responses table with indexes
4. `004_create_voice_personalities_table.sql` - Create voice_personalities table and seed data
5. `005_add_foreign_keys.sql` - Add foreign key constraints

**Rollback Strategy**:
- Each migration has a corresponding down migration to reverse changes
- Test rollback in staging before production deployment
- Keep backups before running migrations in production

## Performance Considerations

1. **Indexing**: All foreign keys and frequently queried columns are indexed
2. **Connection Pooling**: Use `databases` library with `asyncpg` for async connection pooling (max 10 connections for MVP)
3. **Query Optimization**: Use prepared statements for all queries to prevent SQL injection and improve performance
4. **Session Cleanup**: Background cron job runs every hour to delete expired sessions (`DELETE FROM sessions WHERE expires_at < NOW()`)

## Security Considerations

1. **Password Hashing**: Use `passlib` with bcrypt algorithm (12 rounds) for password hashing
2. **JWT Tokens**: Use `PyJWT` library with HS256 algorithm, secret key stored in environment variable
3. **OAuth Tokens**: Never store OAuth access tokens in database, only `oauth_provider_id` for user identification
4. **Data Encryption**: Neon Postgres encrypts data at rest by default
5. **Input Validation**: All fields validated before database insertion to prevent SQL injection and XSS

## Scalability Notes

- **Current Scale**: Supports up to 10k users with default Neon Postgres free tier
- **Scaling Plan**: If user count exceeds 10k, upgrade to Neon Pro tier or migrate to dedicated Postgres instance
- **Horizontal Scaling**: Backend API can be horizontally scaled (multiple FastAPI instances) since sessions are stored in database (not in-memory)
