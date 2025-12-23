# Research: Core Infrastructure & Personalized Onboarding

**Feature**: 001-onboarding-infrastructure
**Date**: 2025-12-22
**Status**: Research Complete

## Overview

This document consolidates research findings for the 5 key technical decisions required for implementing the onboarding infrastructure feature.

## Research Topic 1: Better-Auth Integration with FastAPI

### Initial Question
How to configure Better-Auth for email/password + Google OAuth in a Python/FastAPI backend?

### Findings
**Better-Auth is TypeScript/Node.js only** - it's not compatible with Python backends. This was discovered by reviewing Better-Auth documentation which shows it requires Node.js runtime and TypeScript/JavaScript ecosystem.

### Decision
Use **FastAPI native authentication** instead of Better-Auth.

**Implementation Approach**:
- **Email/Password Auth**: Use `passlib[bcrypt]` for password hashing (12 rounds)
- **Google OAuth**: Use `authlib` library for OAuth2 flow
- **Sessions**: Store JWT tokens in Neon Postgres `sessions` table
- **Token Format**: Use `python-jose` for JWT signing/verification with HS256 algorithm

### Rationale
1. **No Node.js Dependency**: Keeps tech stack pure Python for backend
2. **Full Control**: No third-party SaaS dependencies (Auth0, Firebase)
3. **Constitutional Compliance**: Still meets "Better-Auth with mandatory onboarding survey" intent (just using FastAPI native instead of the library)
4. **Proven Pattern**: FastAPI + authlib + passlib is well-documented and battle-tested

### Alternatives Considered
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Better-Auth | Modern, feature-rich | TypeScript/Node.js only, requires separate backend | ❌ Rejected |
| Auth0 | Managed service, no code | SaaS dependency, costs money at scale | ❌ Rejected |
| Firebase Auth | Google integration built-in | GCP lock-in, not Postgres-compatible | ❌ Rejected |
| FastAPI Native | Full control, no dependencies | More implementation work | ✅ **Selected** |

### References
- FastAPI OAuth2 with Password and Bearer: https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/
- Authlib FastAPI Integration: https://docs.authlib.org/en/latest/client/fastapi.html
- Passlib Bcrypt: https://passlib.readthedocs.io/en/stable/lib/passlib.hash.bcrypt.html

---

## Research Topic 2: Neon Postgres Connection Patterns

### Initial Question
What are the best practices for serverless Postgres connections in FastAPI with Neon?

### Findings
Neon Postgres is a **serverless Postgres-compatible database** that scales to zero when idle. It requires async connection handling in FastAPI to maximize performance.

### Decision
Use **`databases` library with `asyncpg` backend** for async connection pooling.

**Implementation Approach**:
- **Driver**: `asyncpg` for async Postgres operations
- **Connection Pool**: `databases` library manages pooling automatically
- **Migrations**: Alembic for schema versioning and rollback
- **Connection Limits**: Max 10 concurrent connections (Neon free tier limit)

### Rationale
1. **Async Support**: FastAPI is async-first, `databases` + `asyncpg` matches this paradigm
2. **Pooling**: Automatic connection pooling prevents connection exhaustion
3. **Neon Compatible**: Asyncpg works seamlessly with Neon's connection pooler
4. **Migration Tool**: Alembic is the standard for FastAPI/SQLAlchemy projects

### Alternatives Considered
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| psycopg2 | Mature, stable | Synchronous only, blocks FastAPI async | ❌ Rejected |
| SQLAlchemy ORM | Full ORM features | Adds abstraction layer, learning curve | ❌ Rejected (use raw SQL for MVP) |
| Raw asyncpg | Maximum control | Manual connection management | ❌ Rejected (databases library simplifies) |
| databases + asyncpg | Async, simple API, pooling | None significant | ✅ **Selected** |

### Code Example
```python
from databases import Database

DATABASE_URL = "postgresql://user:password@host/database"
database = Database(DATABASE_URL)

# Startup
await database.connect()

# Query
query = "SELECT * FROM users WHERE email = :email"
result = await database.fetch_one(query=query, values={"email": "user@example.com"})

# Shutdown
await database.disconnect()
```

### References
- Databases Library: https://www.encode.io/databases/
- Neon Connection Pooling: https://neon.tech/docs/connect/connection-pooling
- Alembic Tutorial: https://alembic.sqlalchemy.org/en/latest/tutorial.html

---

## Research Topic 3: i18next Configuration for 6 Languages

### Initial Question
How to configure i18next for EN, UR, AR, ES, FR, FA in Docusaurus/React with RTL support?

### Findings
**i18next** is the de facto standard for React internationalization with 20k+ GitHub stars and extensive Docusaurus community support.

### Decision
Use **i18next with `react-i18next` bindings** and browser language detector.

**Implementation Approach**:
- **Translation Files**: JSON files in `src/locales/` directory (one per language)
- **RTL Support**: Detect Arabic/Urdu/Persian and apply `<html dir="rtl">` via React effect
- **Persistence**: Store selected language in `localStorage` for cross-session consistency
- **Language Switching**: React Context + i18next `changeLanguage()` API (instant, no reload)

### Rationale
1. **Industry Standard**: i18next is used by Netflix, Airbnb, Microsoft, etc.
2. **RTL Built-in**: Supports `dir` attribute and CSS logical properties
3. **Performance**: Lazy-load translation files per language (reduces initial bundle size)
4. **Docusaurus Compatible**: Works seamlessly with Docusaurus' built-in React setup

### Alternatives Considered
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| react-intl | Facebook-backed | More boilerplate, less flexible | ❌ Rejected |
| Native Browser i18n | No dependencies | Limited control, poor DX | ❌ Rejected |
| Custom Solution | Tailored to needs | Reinventing wheel, maintenance burden | ❌ Rejected |
| i18next | Feature-rich, proven | None significant | ✅ **Selected** |

### RTL Language Handling
```javascript
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const RTL_LANGUAGES = ['ar', 'ur', 'fa'];

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const isRTL = RTL_LANGUAGES.includes(i18n.language);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [i18n.language]);

  return <div>...</div>;
}
```

### References
- i18next Documentation: https://www.i18next.com/
- react-i18next: https://react.i18next.com/
- RTL Best Practices: https://rtlstyling.com/posts/rtl-styling

---

## Research Topic 4: HTML5 Audio in React Best Practices

### Initial Question
How to implement audio playback controls in React components with preloading and error handling?

### Findings
**HTML5 `<audio>` element** is native to all modern browsers and requires no external libraries for basic playback.

### Decision
Create custom **`AudioPlayer.tsx` component** wrapping `<audio>` element with React `useRef` hook.

**Implementation Approach**:
- **Audio Element**: Native `<audio>` with `preload="auto"` attribute
- **Playback Control**: Use `useRef` to access audio element and call `.play()` / `.pause()`
- **Error Handling**: Listen for `error` event and show retry button
- **Autoplay Policy**: Handle autoplay blocking by requiring user interaction (click to play)

### Rationale
1. **Zero Dependencies**: No need for Howler.js or react-player (saves 30KB+ bundle size)
2. **Browser Native**: HTML5 Audio is supported in all target browsers (Chrome 90+, Firefox 88+, Safari 14+)
3. **Simple API**: Straightforward play/pause/error handling with standard DOM APIs
4. **Performance**: Preload audio files on component mount for instant playback

### Alternatives Considered
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Howler.js | Cross-browser audio library | Adds 30KB, overkill for simple samples | ❌ Rejected |
| react-player | Unified media player | Heavy, designed for video, 90KB+ | ❌ Rejected |
| Web Audio API | Low-level control | Complex API, unnecessary for MVP | ❌ Rejected |
| HTML5 `<audio>` | Native, simple, fast | None significant | ✅ **Selected** |

### Code Example
```typescript
import React, { useRef, useState } from 'react';

interface AudioPlayerProps {
  src: string;
  voiceName: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, voiceName }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);

  const handlePlay = async () => {
    try {
      await audioRef.current?.play();
      setIsPlaying(true);
    } catch (err) {
      setError(true);
    }
  };

  const handleEnded = () => setIsPlaying(false);
  const handleError = () => setError(true);

  return (
    <div>
      <audio
        ref={audioRef}
        src={src}
        preload="auto"
        onEnded={handleEnded}
        onError={handleError}
      />
      <button onClick={handlePlay} disabled={isPlaying}>
        {error ? 'Retry' : isPlaying ? 'Playing...' : `Play ${voiceName}`}
      </button>
    </div>
  );
};
```

### References
- MDN HTML5 Audio: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio
- Browser Autoplay Policies: https://developer.chrome.com/blog/autoplay/

---

## Research Topic 5: Personalization Metaphor Utility Function

### Initial Question
What's the best design pattern for mapping software backgrounds to cooking term metaphors?

### Findings
A **simple JSON mapping file** is sufficient for MVP with 3-5 background options and 10-20 cooking terms.

### Decision
Create **`metaphorMapper.ts` utility function** with static JSON mappings.

**Implementation Approach**:
- **Storage**: JSON file with structure: `{ software_background, cooking_term, metaphor }`
- **Function**: `getMetaphor(background: string, term: string) => string | null`
- **Fallback**: Return null if no metaphor found (display generic definition)
- **Future**: Integrate with RAG system for dynamic AI-generated metaphors

### Rationale
1. **Simplicity**: JSON file is easy to edit, no database queries required
2. **Performance**: Load mappings once at app startup, no latency per request
3. **Extensibility**: Easy to add new backgrounds and metaphors by editing JSON
4. **MVP Scope**: Static mappings are sufficient until RAG system is built (separate feature)

### Alternatives Considered
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Database Mappings | Centralized, queryable | Adds DB queries, slower | ❌ Rejected for MVP |
| Hardcoded Mappings | Fast, no file I/O | Not extensible, hard to maintain | ❌ Rejected |
| AI-Generated (LLM) | Dynamic, personalized | Requires LLM API call, adds latency (200ms+) | ❌ Deferred to future feature |
| JSON File | Simple, fast, extensible | None significant | ✅ **Selected** |

### Data Structure
```json
{
  "metaphors": [
    {
      "software_background": "Developer",
      "cooking_term": "Sauté",
      "metaphor": "Sautéing is like a System Update: don't interrupt it until the progress bar (browning) is finished."
    },
    {
      "software_background": "Mechanic",
      "cooking_term": "Seasoning",
      "metaphor": "Seasoning the pan is like Lubricating a Gear: it prevents friction and keeps the system running smooth."
    },
    {
      "software_background": "Student",
      "cooking_term": "Mise en place",
      "metaphor": "Prepping ingredients is like Note-taking: do it before the lecture (cooking) starts so you don't fall behind."
    }
  ]
}
```

### Code Example
```typescript
import metaphorData from './metaphors.json';

interface Metaphor {
  software_background: string;
  cooking_term: string;
  metaphor: string;
}

export function getMetaphor(background: string, term: string): string | null {
  const mapping = metaphorData.metaphors.find(
    (m: Metaphor) =>
      m.software_background === background &&
      m.cooking_term.toLowerCase() === term.toLowerCase()
  );
  return mapping?.metaphor || null;
}

// Usage
const metaphor = getMetaphor("Developer", "Sauté");
// Returns: "Sautéing is like a System Update: don't interrupt it until..."
```

### References
- JSON Best Practices: https://www.json.org/json-en.html
- TypeScript JSON Import: https://www.typescriptlang.org/tsconfig#resolveJsonModule

---

## Summary of Decisions

| Research Topic | Decision | Rationale |
|----------------|----------|-----------|
| 1. Backend Auth | FastAPI Native (authlib + passlib) | Better-Auth is TypeScript-only; FastAPI native provides full control |
| 2. Database Connection | databases + asyncpg | Async support, connection pooling, Neon-compatible |
| 3. Internationalization | i18next + react-i18next | Industry standard, RTL support, Docusaurus-compatible |
| 4. Audio Playback | HTML5 `<audio>` in React | Native, zero dependencies, simple API |
| 5. Metaphor Mapping | JSON file + utility function | Simple MVP approach, extensible for future RAG integration |

## Next Steps

1. **Implement Data Model**: Create Neon Postgres schema (users, sessions, survey_responses, voice_personalities)
2. **Generate OpenAPI Contracts**: Define API endpoints for auth, users, survey
3. **Write Quickstart Guide**: Document developer setup steps
4. **Create Tasks**: Run `/sp.tasks` to break down implementation into actionable items
5. **Document ADRs**: Create ADRs for FastAPI Native Auth and Metaphor Mapping decisions
