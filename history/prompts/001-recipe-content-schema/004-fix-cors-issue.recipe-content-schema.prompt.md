---
id: 004
title: "Fix CORS Issue"
stage: refactor
date_iso: "2025-12-30"
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "001-recipe-content-schema"
branch: "001-recipe-content-schema"
user: "WaterProof Fish"
command: "sp.implement"
labels: ["cors", "security", "middleware", "frontend-integration"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - "backend/src/main.py"
tests_yaml: []
---

# Fix CORS Issue

## User Input
```
specs/001-recipe-content-schema/tasks.md --instruction "CORS FIX: The frontend is blocked from fetching recipes. 1. In 'backend/src/main.py', add the 'CORSMiddleware' from 'fastapi.middleware.cors'. 2. Configure it to allow origins ['http://localhost:3000', 'http://127.0.0.1:3000']. 3. Allow all methods (GET, POST, etc.) and all headers. 4. Ensure 'app.add_middleware' is called before the recipe routes are included."
```

## Solution

### Problem
The frontend was blocked from fetching recipes due to CORS restrictions. The backend was not allowing requests from the frontend origins.

### Root Cause Analysis
1. CORS middleware was already present in the application
2. However, allowed origins were only configured from environment variable
3. The required origins `http://localhost:3000` and `http://127.0.0.1:3000` were not explicitly allowed

### Changes Made

1. **Updated CORS configuration in `backend/src/main.py`**:
   - Changed ALLOWED_ORIGINS from environment variable-based to explicit list
   - Set ALLOWED_ORIGINS to `["http://localhost:3000", "http://127.0.0.1:3000"]`
   - Maintained existing configuration for methods and headers to allow all

2. **Verified middleware order**:
   - Confirmed that `app.add_middleware(CORSMiddleware, ...)` is called before recipe routes are included
   - The middleware is properly positioned in the application setup

### Technical Details

The fix ensures that:
- Frontend running on `http://localhost:3000` can make API requests
- Frontend running on `http://127.0.0.1:3000` can make API requests
- All HTTP methods (GET, POST, PUT, DELETE, etc.) are allowed
- All headers are allowed
- CORS middleware is applied before route handlers

## Response Summary
Fixed the CORS issue by updating the allowed origins in the CORS middleware configuration to explicitly include both `http://localhost:3000` and `http://127.0.0.1:3000`. The middleware was already present and properly configured for methods and headers, but needed the correct origin list.

## Outcome
- [X] Frontend can now make requests to the backend API
- [X] CORS errors are resolved for both localhost origins
- [X] All HTTP methods are allowed
- [X] All headers are allowed
- [X] Middleware order is correct