# Quickstart Guide: Core Infrastructure & Personalized Onboarding

**Feature**: 001-onboarding-infrastructure
**Last Updated**: 2025-12-22

This guide walks you through setting up the local development environment for the onboarding infrastructure feature.

## Prerequisites

- **Node.js**: v18+ (for frontend)
- **Python**: 3.11+ (for backend)
- **Git**: Latest version
- **Neon Postgres Account**: Sign up at https://neon.tech (free tier)
- **Google OAuth Credentials**: Create at https://console.cloud.google.com (for OAuth testing)

## Step 1: Clone Repository and Checkout Branch

```bash
# Clone the repository
git clone https://github.com/your-org/global-plate.git
cd global-plate

# Checkout the feature branch
git checkout 001-onboarding-infrastructure
```

## Step 2: Set Up Neon Postgres Database

1. **Create Neon Database**:
   - Visit https://console.neon.tech
   - Create a new project named "global-plate-dev"
   - Note the connection string (format: `postgresql://user:password@host/database`)

2. **Save Connection String**:
   - Create `.env` file in project root:
   ```bash
   cp .env.example .env
   ```
   - Add your Neon connection string:
   ```
   DATABASE_URL=postgresql://user:password@host/database
   JWT_SECRET=your-secret-key-here-change-in-production
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
   ```

## Step 3: Set Up Backend (FastAPI)

```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install development dependencies (for testing)
pip install -r requirements-dev.txt
```

**Backend Dependencies** (`requirements.txt`):
```
fastapi==0.100.0
uvicorn[standard]==0.23.0
asyncpg==0.28.0
databases[postgresql]==0.8.0
passlib[bcrypt]==1.7.4
python-jose[cryptography]==3.3.0
authlib==1.2.1
python-multipart==0.0.6
alembic==1.12.0
python-dotenv==1.0.0
```

## Step 4: Run Database Migrations

```bash
# Still in backend directory with venv activated

# Run migrations to create schema
alembic upgrade head

# This creates:
# - users table
# - sessions table
# - survey_responses table
# - voice_personalities table (with seeded data)
```

## Step 5: Start Backend Server

```bash
# From backend directory
uvicorn src.main:app --reload --port 8000

# Server will start at http://localhost:8000
# API docs available at http://localhost:8000/docs (Swagger UI)
```

## Step 6: Set Up Frontend (Docusaurus + React)

```bash
# Open a new terminal (keep backend running)
cd frontend

# Install dependencies
npm install

# Install additional packages for this feature
npm install i18next react-i18next i18next-browser-languagedetector
```

**Frontend Dependencies** (added to `package.json`):
```json
{
  "dependencies": {
    "@docusaurus/core": "^3.0.0",
    "@docusaurus/preset-classic": "^3.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "i18next": "^23.7.0",
    "react-i18next": "^13.5.0",
    "i18next-browser-languagedetector": "^7.2.0"
  }
}
```

## Step 7: Configure i18next for 6 Languages

Create translation files:

```bash
# From frontend directory
mkdir -p src/locales

# Create translation files (example for English)
cat > src/locales/en.json <<EOF
{
  "auth": {
    "signup": "Sign Up",
    "login": "Log In",
    "email": "Email",
    "password": "Password",
    "name": "Full Name"
  },
  "survey": {
    "title": "Kitchen Intelligence Survey",
    "software_background": "What's your professional background?",
    "cooking_level": "What's your cooking skill level?",
    "submit": "Continue"
  },
  "voices": {
    "title": "Choose Your Kitchen Partner",
    "play": "Play Sample"
  }
}
EOF
```

**Note**: Repeat for `ur.json`, `ar.json`, `es.json`, `fr.json`, `fa.json` with professional translations.

## Step 8: Add Voice Sample Audio Files

```bash
# From frontend directory
mkdir -p src/assets/voices

# Download or copy voice samples (3-second MP3 files)
# Example:
curl -o src/assets/voices/arlow.mp3 https://cdn.example.com/voices/arlow.mp3
curl -o src/assets/voices/silas.mp3 https://cdn.example.com/voices/silas.mp3
# ... (repeat for all 7 voices)
```

**Voice Sample Requirements**:
- Format: MP3 or WebM
- Duration: 3 seconds
- Content: Friendly greeting (e.g., "Hi, I'm Elara! I'll be your cooking companion. Ready to get started?")
- Size: < 100KB per file

## Step 9: Start Frontend Server

```bash
# From frontend directory
npm run start

# Server will start at http://localhost:3000
# Hot reload enabled for development
```

## Step 10: Test the Onboarding Flow

1. **Signup**:
   - Visit http://localhost:3000/signup
   - Create account with email/password
   - Verify JWT token returned

2. **Kitchen Survey**:
   - After signup, redirected to `/onboarding`
   - Fill survey form (background, cooking level)
   - Submit and verify data saved

3. **Voice Selection**:
   - Play audio samples for all 7 voices
   - Select preferred voice
   - Verify selection saved

4. **Language Selection**:
   - Choose language from dropdown
   - Verify UI text updates instantly
   - Test RTL layout for Arabic/Urdu/Persian

5. **Dashboard**:
   - View personalized welcome message
   - Check progress ring shows 0/N recipes mastered
   - Test "Translate Now" floating button

## Step 11: Run Tests

**Backend Tests**:
```bash
# From backend directory with venv activated
pytest tests/ -v

# Run contract tests only
pytest tests/contract/ -v

# Run with coverage
pytest --cov=src --cov-report=html
```

**Frontend Tests**:
```bash
# From frontend directory
npm run test

# Run E2E tests (requires both servers running)
npx playwright test
```

## Troubleshooting

### Issue: Database connection fails
**Solution**: Verify Neon connection string in `.env`. Check Neon dashboard for database status.

### Issue: OAuth redirect fails
**Solution**: Ensure `GOOGLE_REDIRECT_URI` in `.env` matches Google Console redirect URI exactly (including `http://localhost`).

### Issue: Voice samples don't play
**Solution**: Check browser console for errors. Verify audio files exist in `src/assets/voices/`. Test with `preload="auto"` attribute.

### Issue: RTL languages display incorrectly
**Solution**: Verify `<html dir="rtl">` is applied. Check CSS for hard-coded left/right margins (use logical properties: `margin-inline-start`).

### Issue: JWT token expires quickly
**Solution**: Check `JWT_SECRET` is set in `.env`. Default expiration is 7 days; adjust in `backend/src/services/auth_service.py`.

## API Endpoints Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/signup` | POST | Email/password signup |
| `/auth/login` | POST | Email/password login |
| `/auth/google` | GET | Google OAuth initiation |
| `/auth/google/callback` | GET | Google OAuth callback |
| `/auth/logout` | POST | Logout (invalidate session) |
| `/users/me` | GET | Get current user profile |
| `/users/me` | PATCH | Update user preferences |
| `/survey` | POST | Submit Kitchen Intelligence Survey |
| `/survey/me` | GET | Retrieve user's survey response |
| `/voices` | GET | List all 7 voice personalities |

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon Postgres connection string | `postgresql://user:pass@host/db` |
| `JWT_SECRET` | Secret key for JWT signing | `your-secret-key-256-bits` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `123456789-abc.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `GOCSPX-abc123...` |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL | `http://localhost:8000/auth/google/callback` |

## Next Steps

1. **Implement Tasks**: Run `/sp.tasks` to generate detailed task breakdown
2. **Create ADRs**: Document architectural decisions via `/sp.adr`
3. **Set Up CI/CD**: Configure GitHub Actions for automated testing
4. **Deploy Staging**: Deploy to staging environment for QA testing
5. **Performance Testing**: Load test authentication endpoints with 100+ concurrent users

## Useful Commands

```bash
# Backend
uvicorn src.main:app --reload --port 8000  # Start backend server
alembic upgrade head                        # Run migrations
alembic downgrade -1                        # Rollback last migration
pytest tests/ -v                            # Run tests

# Frontend
npm run start                               # Start dev server
npm run build                               # Build for production
npm run test                                # Run unit tests
npx playwright test                         # Run E2E tests

# Database
psql $DATABASE_URL                          # Connect to Neon Postgres
alembic revision --autogenerate -m "message" # Generate migration
```

## Support

- **Slack**: #global-plate-dev
- **Issues**: GitHub Issues on main repo
- **Docs**: Full API docs at http://localhost:8000/docs when backend running
