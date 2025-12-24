# Quickstart Guide: Recipe Content Schema Implementation

**Feature**: 001-recipe-content-schema
**Last Updated**: 2025-12-24

This guide walks you through setting up the recipe content schema with the first 5 global recipes and RAG infrastructure.

## Prerequisites

- **Python**: 3.11+ (for backend)
- **Node.js**: v18+ (for frontend)
- **Git**: Latest version
- **Neon Postgres Account**: Sign up at https://neon.tech (free tier)
- **Qdrant Cloud Account**: Sign up at https://cloud.qdrant.io (free tier)
- **OpenAI API Key**: For embeddings and RAG functionality

## Step 1: Clone Repository and Checkout Branch

```bash
# Clone the repository
git clone https://github.com/your-org/global-plate.git
cd global-plate

# Checkout the feature branch
git checkout 001-recipe-content-schema
```

## Step 2: Set Up Environment Variables

```bash
# Create .env file in project root:
cp .env.example .env

# Add your service credentials:
```

**Required Environment Variables**:
```
DATABASE_URL=postgresql://user:password@host:5432/database
QDRANT_URL=https://your-cluster-url.qdrant.tech:6333
QDRANT_API_KEY=your-qdrant-api-key
OPENAI_API_KEY=your-openai-api-key
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
pydantic[email]==2.0.0
psycopg2-binary==2.9.9
qdrant-client==1.9.0
openai==1.3.5
```

## Step 4: Run Database Migrations and Seed Data

```bash
# Still in backend directory with venv activated

# Run migrations to create schema
alembic upgrade head

# This creates:
# - recipes table
# - recipe_translations table
# - recipe_steps table
# - recipe_step_translations table
# - user_backgrounds table
# - metaphor_mappings table

# Seed the database with the 5 initial recipes
python scripts/seed_recipes.py
```

## Step 5: Set Up Qdrant Vector Store

```bash
# Install Qdrant client and create collections
python scripts/setup_qdrant.py
```

**This creates**:
- `recipes` collection with vector embeddings for RAG
- Proper indexing for efficient retrieval
- Metadata fields for filtering by language, difficulty, etc.

## Step 6: Start Backend Server

```bash
# From backend directory
uvicorn src.main:app --reload --port 8000

# Server will start at http://localhost:8000
# API docs available at http://localhost:8000/docs (Swagger UI)
```

## Step 7: Set Up Frontend (Docusaurus + React)

```bash
# Open a new terminal (keep backend running)
cd frontend

# Install dependencies
npm install

# Install additional packages for recipe functionality
npm install @qdrant/js-client-rest
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
    "i18next-browser-languagedetector": "^7.2.0",
    "@qdrant/js-client-rest": "^1.9.0"
  }
}
```

## Step 8: Add Recipe Translation Files

Create translation files for all 6 languages:

```bash
# From frontend directory
mkdir -p src/locales/recipes

# Create recipe translation files (example for English)
cat > src/locales/recipes/en.json <<EOF
{
  "recipes": {
    "pasta": {
      "name": "Simple Pasta",
      "kitchen_guard": "Be careful when handling hot water and boiling pasta.",
      "steps": [
        "Boil water in a large pot.",
        "Add pasta and cook for 8-10 minutes.",
        "Drain pasta and add sauce.",
        "Toss pasta with sauce until well combined.",
        "Serve hot with grated cheese."
      ]
    },
    "sajji": {
      "name": "Sajji (Pakistani Grilled Fish)",
      "kitchen_guard": "Ensure fish is cooked through before eating. Use food thermometer to verify internal temperature reaches 145°F.",
      "steps": [
        "Clean and marinate fish with spices for 2 hours.",
        "Prepare charcoal fire in a tandoor or grill.",
        "Wrap fish in dough and place on hot coals.",
        "Cook for 30-40 minutes, turning occasionally.",
        "Remove from heat and serve with naan bread."
      ]
    }
  }
}
EOF
```

**Note**: Repeat for `ur.json`, `ar.json`, `es.json`, `fr.json`, `fa.json` with professional translations.

## Step 9: Add Metaphor Mapping for Personalization

Create metaphor mapping files:

```bash
# Create metaphor mapping files
mkdir -p src/locales/metaphors

cat > src/locales/metaphors/en.json <<EOF
{
  "metaphors": {
    "welcome": {
      "software_background": {
        "beginner": "Welcome to your cooking journey! Like learning your first programming language, cooking is about following instructions step-by-step.",
        "intermediate": "Ready to debug your next meal? Cooking is like writing clean code - it's all about the right ingredients and proper execution.",
        "expert": "Welcome to the kitchen, code master! Just like optimizing algorithms, great cooking is about perfecting processes and timing."
      },
      "hardware_background": {
        "beginner": "Welcome! Cooking is like assembling your first kit - follow the steps carefully, and you'll have something functional and satisfying.",
        "intermediate": "Time to build something delicious! Cooking is like working with circuits - precise timing and connections create the perfect output.",
        "expert": "Welcome to the kitchen lab! You understand systems and precision - apply those skills to create culinary circuits."
      }
    }
  }
}
EOF
```

## Step 10: Start Frontend Server

```bash
# From frontend directory
npm run start

# Server will start at http://localhost:3000
# Hot reload enabled for development
```

## Step 11: Test the Recipe Implementation

1. **RAG Query Test**:
   - Visit http://localhost:8000/docs
   - Test `/recipes/search` endpoint with query "How do I make pasta?"
   - Verify results return relevant recipe content

2. **Multilingual Test**:
   - Test language switching with `/recipes/{id}/translate?lang=ur`
   - Verify all 6 languages are available

3. **Personalization Test**:
   - Update user background in `/users/me`
   - Verify dashboard welcome message changes based on background

4. **Voice Integration Test**:
   - Test voice commands for recipe steps
   - Verify audio playback works correctly

## Step 12: Run Tests

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

### Issue: Qdrant connection fails
**Solution**: Verify QDRANT_URL and QDRANT_API_KEY in `.env`. Check Qdrant Cloud dashboard for cluster status.

### Issue: Recipe translations not loading
**Solution**: Verify translation files exist in `src/locales/recipes/` for all 6 languages. Check that language codes match expected values.

### Issue: Personalization not working
**Solution**: Verify user background data is saved in the database. Check that metaphor mapping files exist and are properly structured.

### Issue: RAG search returns no results
**Solution**: Verify Qdrant collection is populated with recipe embeddings. Check that embeddings were generated correctly during seeding.

## API Endpoints Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/recipes` | GET | List all recipes |
| `/recipes/{id}` | GET | Get specific recipe |
| `/recipes/search` | POST | RAG search for recipes |
| `/recipes/{id}/translate` | GET | Get recipe in specific language |
| `/metaphors/welcome` | GET | Get personalized welcome message |

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon Postgres connection string | `postgresql://user:pass@host/db` |
| `QDRANT_URL` | Qdrant Cloud cluster URL | `https://cluster.qdrant.tech:6333` |
| `QDRANT_API_KEY` | Qdrant Cloud API key | `your-api-key` |
| `OPENAI_API_KEY` | OpenAI API key for embeddings | `sk-...` |

## Next Steps

1. **Populate All 5 Recipes**: Run `/sp.tasks` to generate detailed implementation tasks
2. **Create ADRs**: Document architectural decisions via `/sp.adr`
3. **Set Up CI/CD**: Configure GitHub Actions for automated testing
4. **Performance Testing**: Load test RAG endpoints with 100+ concurrent users
5. **Content Creation**: Add professional translations for all 6 languages

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

# Qdrant
python scripts/setup_qdrant.py              # Set up vector collections
python scripts/rebuild_embeddings.py        # Rebuild recipe embeddings
```

## Support

- **Slack**: #global-plate-dev
- **Issues**: GitHub Issues on main repo
- **Docs**: Full API docs at http://localhost:8000/docs when backend running