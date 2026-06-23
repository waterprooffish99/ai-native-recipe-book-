# Global Plate Backend (FastAPI)

## Setup

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

## Run Server

```bash
uvicorn src.main:app --reload --port 8000
```

## Run Tests

```bash
pytest tests/ -v
```

## Migrations

```bash
# Run migrations
alembic upgrade head

# Rollback last migration
alembic downgrade -1
```
