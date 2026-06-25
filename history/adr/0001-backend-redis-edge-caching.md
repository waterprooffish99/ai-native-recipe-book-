# ADR-0001: Backend Redis Edge Caching with InMemory Fallback

> **Scope**: Document decision clusters, not individual technology choices. Group related decisions that work together (e.g., "Frontend Stack" not separate ADRs for framework, styling, deployment).

- **Status:** Accepted
- **Date:** 2026-06-25
- **Feature:** 001-recipe-content-schema
- **Context:** Repetitive database reads for recipe details (`GET /recipes/{recipe_id}`) create unnecessary query overhead on Neon Serverless Postgres and latency bottlenecks, making it difficult to meet the strict p95 latency budget of under 500ms under concurrent traffic loads.

## Decision

We integrated an Edge Caching layer using Redis (connected to a managed service like Upstash Redis in production) combined with `fastapi-cache2` to manage serialization and TTL caching.

Key architectural details:
- **Cache Decorator**: The read-heavy `GET /recipes/{recipe_id}` route is decorated with `@cache(expire=3600)` to hold serialized data for up to 1 hour.
- **Fail-Safe Fallback**: Caching initialization is wrapped in a ping-test try-catch block during app startup. If the Redis server is unreachable (typical during local development or network splits), it logs a warning and automatically instantiates `InMemoryBackend` as a fallback cache, preventing service disruptions.

## Consequences

### Positive

- **Improved Latency**: Cached recipe reads yield responses in <20ms, bypassing SQL queries and network roundtrips.
- **DB Protection**: Offloads query volume from Neon serverless database, reducing connection pool saturation.
- **Developer Ergonomics**: Local development starts and runs flawlessly without requiring a running Redis instance.

### Negative

- **Cache Invalidation Delay**: Updates to recipes or translations won't reflect immediately until the 1-hour TTL expires, unless cache invalidation hooks are explicitly triggered.
- **Increased Memory Usage**: Fallback mode caches records in backend container memory, increasing memory usage slightly.

## Alternatives Considered

- **Alternative A: Raw Database Tuning (Indexing & Connection Pooling)**:
  - *Why rejected*: While database tuning optimizes raw queries, it cannot bypass the physical network roundtrip time between backend containers and database clusters. Caching at the API edge is required to consistently meet <100ms response targets.
- **Alternative B: Custom In-Memory Dictionary Cache**:
  - *Why rejected*: A hand-rolled dictionary cache lacks support for horizontal scaling across multiple FastAPI container instances, does not support automated TTL eviction out of the box, and requires custom thread-safe serialization code.

## References

- Feature Spec: [Specifications_v2.0.0.md](file:///home/waterprooffish99/projects/recipe-cook-book/docs/Specifications_v2.0.0.md)
- Implementation Plan: [tasks.md](file:///home/waterprooffish99/projects/recipe-cook-book/specs/001-recipe-content-schema/tasks.md)
- Related ADRs: None
- Evaluator Evidence: [0027-implement-redis-edge-caching-backend.green.prompt.md](file:///home/waterprooffish99/projects/recipe-cook-book/history/prompts/001-recipe-content-schema/0027-implement-redis-edge-caching-backend.green.prompt.md)
