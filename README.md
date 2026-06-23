# 🍽️ Global Plate

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Docusaurus](https://img.shields.io/badge/Docusaurus-303846?style=for-the-badge&logo=docusaurus&logoColor=35D07F)](https://docusaurus.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Neon Postgres](https://img.shields.io/badge/Neon_Postgres-00E599?style=for-the-badge&logo=postgresql&logoColor=black)](https://neon.tech)
[![Qdrant](https://img.shields.io/badge/Qdrant-FF5733?style=for-the-badge&logo=database&logoColor=white)](https://qdrant.tech)
[![OpenAI GPT-4o-mini](https://img.shields.io/badge/OpenAI_GPT--4o--mini-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org)

Global Plate is an advanced, production-grade **multilingual recipe companion and AI chef assistant**. Built as an AI-native application, the system leverages vector retrieval (RAG), real-time speech processing, deterministic compliance engines, and robust offline synchronization (PWA) to deliver a seamless culinary experience.

This project was built using **Spec-Driven Development (SDD)** with 100% test coverage across 175 validated engineering tasks.

---

## 🏗️ System Architecture Overview

Global Plate uses a decoupled, high-performance architecture:

```mermaid
graph TD
    User([Home Cook Client])
    PWA[Docusaurus PWA Frontend / React 18]
    LocalStorage[(Local Storage Progress Cache)]
    FastAPI[FastAPI Gateway / Python 3.11]
    NeonDB[(Neon Serverless Postgres / DB)]
    Qdrant[(Qdrant Vector Database)]
    OpenAI[OpenAI API / GPT-4o-mini]

    User -->|Keyboard / Voice Inputs| PWA
    PWA -->|Offline Caching| LocalStorage
    PWA -->|REST Calls / JWT Auth| FastAPI
    LocalStorage -->|Auto-Resync on Reconnect| FastAPI
    FastAPI -->|Relational Queries & Session Auditing| NeonDB
    FastAPI -->|Semantic Vector Queries| Qdrant
    FastAPI -->|Multilingual Prompt Ingestion| OpenAI
```

- **Frontend Core**: A responsive, forced dark-mode Docusaurus PWA built on React 18 and TypeScript 5. Equipped with `cmdk` (Command+K menu), `nosleep.js` (fullscreen screen lock protection), and localized with `i18next` for English, Urdu, Arabic, Spanish, French, and Persian.
- **Backend API Gateway**: A modular FastAPI framework implementing OAuth2 JWT security, Alembic migrations, database connection pooling via `asyncpg`, and self-healing resilience wrappers.
- **Data Layers**: Neon Serverless PostgreSQL for structured transactions (recipes, user profiles, session tracking) and Qdrant for semantic recipe embeddings.

---

## 🤖 Core Engineering Highlights

### 1. AI Conversational Engine (RAG)
* **Contextual Retrieval**: Ingests recipe context (ingredients, instructions, nutrition) dynamically into the LLM system prompt via semantic retrieval or recipe ID scoping.
* **Double-Guard Halal Compliance Filter**:
  * **Pre-flight**: Scans incoming queries for forbidden items (pork variants, lard, alcohol, beer, sake, mirin, wine vinegars, animal gelatins) using word-boundary regex matches.
  * **Post-flight**: Inspects LLM completions. If a violation is caught, the system intercepts the response, logs the failure, and injects a deterministic safe fallback detailing Halal-certified substitutions.
* **Deterministic Shortcuts**: Resolves standard substitution requests (e.g. *"What can I substitute for buttermilk?"*) instantly from a local SQL dictionary, bypassing LLM processing to achieve sub-10ms response latencies.
* **Safety Citations**: Automatically extracts keywords to attach verified food-safety authority references (e.g. USDA, FDA, WHO, IFANCA) with outbound links.

### 2. Offline-First PWA State Caching & Synchronization
* **Workbox Service Worker**: Caches assets and layout components, allowing immediate boot times even under deep kitchen network dead zones.
* **Optimistic Local Storage Sync**:
  * Recipe progress and checked ingredient checklists are written locally to browser storage in real-time.
  * Toggling offline does not interrupt the cooking loop or revert checked states.
  * Captures browser `'online'` events and pushes local offline progress adjustments to the Neon database automatically once network signal is re-established.

### 3. Voice Processing Engine
* Built-in browser-level **Web Speech API** integration facilitating speech recognition input with visual pulsation feedback.
* **Read-Aloud (TTS)**: Incorporates text-to-speech speaker outputs to read AI suggestions aloud, enabling entirely hands-free cooking.

### 4. serving Scaler & Client-Side PDF Compiler
* Real-time scaling multiplication of ingredient quantities.
* Generates styled PDF files client-side matching the selected serving size, complete with print-ready checklist layouts and a dynamically compiled **QR Code** that enables users to scan the printout to return to the interactive page.

---

## ⚙️ Quickstart

### Environment Setup
Create a `.env` file at the project root:
```env
DATABASE_URL="postgresql://user:password@hostname/dbname?sslmode=require"
OPENAI_API_KEY="sk-..."
# Optional remote Qdrant configuration (falls back to self-healing in-memory engine)
QDRANT_URL="https://..."
QDRANT_API_KEY="..."
```

### 1. Database Migrations
Initialize database schemas on your Neon PostgreSQL instance:
```bash
cd backend
source .venv/bin/activate
pip install -r requirements.txt
export PYTHONPATH=.
alembic upgrade head
```

### 2. Starting the Backend Server
Deploy the FastAPI gateway:
```bash
cd backend
source .venv/bin/activate
export PYTHONPATH=.
uvicorn src.main:app --host 0.0.0.0 --port 8002 --reload
```
* Interactive documentation is available at [http://localhost:8002/docs](http://localhost:8002/docs).

### 3. Starting the Frontend Client
Build Docusaurus static pages and spin up the production node server:
```bash
cd frontend
npm install
npm run build
npm run serve -- --port 3000 --host 0.0.0.0
```
* Access the web dashboard at [http://localhost:3000](http://localhost:3000).

---

## 🛠️ Automated Operations

A development lifecycle shell script is available at the root to check port availabilities, confirm package installations, migrate schemas, and concurrently launch the frontend and backend servers:
```bash
chmod +x start-dev.sh
./start-dev.sh
```
All system activities are logged concurrently in the `/logs` directory.
