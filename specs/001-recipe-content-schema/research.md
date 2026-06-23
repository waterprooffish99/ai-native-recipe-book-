# Technical Research: Product-System Transition

**Feature**: 001-recipe-content-schema  
**Date**: 2026-04-02  
**Purpose**: Resolve technical decisions for Phase 8-10 implementation

---

## Decision 1: Tailwind CSS Integration Strategy

**Context**: Constitution Principle VIII requires "Big-Tech UI/UX Aesthetic" with custom Tailwind styling instead of generic Docusaurus template.

**Decision**: Integrate Tailwind CSS alongside Docusaurus using `docusaurus-preset-tailwind` or manual PostCSS configuration.

**Rationale**:
- Docusaurus supports Tailwind via official documentation pattern
- Allows gradual migration from Docusaurus theme to custom components
- Maintains compatibility with existing React components
- Tailwind's utility-first approach matches "Big-Tech" aesthetic (Vercel, Linear)

**Alternatives Considered**:
1. **Pure Docusaurus styling**: Rejected - limited customization, generic docs look
2. **Styled Components**: Rejected - runtime overhead, larger bundle size
3. **CSS Modules**: Rejected - less consistent than Tailwind for design systems

**Implementation**:
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

**Configuration**: Extend Tailwind config with Global Plate brand colors (dark theme defaults).

---

## Decision 2: Cook Mode Wake Lock Implementation

**Context**: Constitution Principle VII requires "Cook Mode" that prevents screen sleep during cooking.

**Decision**: Use NoSleep.js library for cross-browser wake lock with Screen Wake Lock API as primary, NoSleep as fallback.

**Rationale**:
- Screen Wake Lock API supported in Chrome/Edge (70%+ users)
- NoSleep.js provides fallback for Safari/Firefox via video hack
- Zero dependencies, <1KB bundle size
- Simple API: `noSleep.enable()`, `noSleep.disable()`

**Alternatives Considered**:
1. **Screen Wake Lock API only**: Rejected - no Safari support
2. **Audio hack (silent audio)**: Rejected - higher battery drain
3. **Video hack manually**: Rejected - NoSleep.js abstracts complexity

**Implementation**:
```bash
npm install nosleep.js
```

**Usage**:
```typescript
import NoSleep from 'nosleep.js';
const noSleep = new NoSleep();
// Enable on Cook Mode start
noSleep.enable();
// Disable on Cook Mode end
noSleep.disable();
```

---

## Decision 3: Ingredient Checkbox State Management

**Context**: Constitution Principle VII requires "interactive ingredient checklists" with persistent progress tracking.

**Decision**: Store checkbox state in Neon PostgreSQL with user-recipe progress table, sync via React Query for real-time updates.

**Rationale**:
- PostgreSQL already in use (Neon)
- React Query provides optimistic updates, background sync
- Progress persists across devices (user logs in from phone, tablet)
- Supports FR-009: "persistent step-progress synchronization bar"

**Database Schema**:
```sql
CREATE TABLE user_recipe_progress (
  user_id UUID REFERENCES users(id),
  recipe_id UUID REFERENCES recipes(id),
  step_number INTEGER,
  ingredient_checkboxes JSONB,  -- {ingredient_id: boolean}
  completed_at TIMESTAMP,
  PRIMARY KEY (user_id, recipe_id, step_number)
);
```

**Alternatives Considered**:
1. **LocalStorage only**: Rejected - no cross-device sync
2. **Redis cache**: Rejected - ephemeral, not suitable for progress persistence
3. **Client-state only**: Rejected - loses progress on refresh

---

## Decision 4: Chef AI Substitution Logic

**Context**: Constitution Principle IX requires conversational RAG capable of answering "What can I substitute for X?"

**Decision**: Enhance RAG with substitution database + rule-based matching + LLM fallback for creative substitutions.

**Rationale**:
- Common substitutions are predictable (buttermilk = milk + acid)
- Rule-based matching is fast, deterministic
- LLM fallback handles edge cases ("I only have chicken and rice")
- Halal compliance filter applied to all suggestions

**Implementation**:
```python
# Substitution database
SUBSTITUTIONS = {
    "buttermilk": {"substitute": "milk + 1 tbsp lemon juice", "ratio": "1:1"},
    "egg": {"substitute": "mashed banana OR flax egg", "ratio": "1 egg = 1/4 cup"},
    # ... 100+ substitutions
}

# RAG prompt enhancement
prompt = f"""
User asks: {query}
Available ingredients: {user_inventory}
Suggest recipe from database OR provide substitution.
CONSTRAINTS:
- Must be Halal-compliant (no pork, alcohol)
- Respect cultural authenticity
- Cite source for food safety claims
"""
```

**Alternatives Considered**:
1. **LLM-only substitutions**: Rejected - hallucinations, unreliable for food safety
2. **Static lookup table only**: Rejected - inflexible for creative cooking
3. **External API (Spoonacular)**: Rejected - cost, latency, less control

---

## Decision 5: Command+K Search Implementation

**Context**: Constitution Principle VIII requires "Command+K global instant search" with <300ms response time.

**Decision**: Use `cmdk` library (Vercel's pattern) with client-side search index built from recipe data.

**Rationale**:
- `cmdk` is the industry standard (used by Vercel, Linear, Raycast)
- Client-side search eliminates API latency (<50ms vs 300ms budget)
- Fuzzy matching for typo tolerance
- Keyboard-first navigation (Enter to select, Arrow keys to navigate)

**Implementation**:
```bash
npm install cmdk
```

**Search Index**:
```typescript
// Build index from recipes
const searchIndex = recipes.map(r => ({
  id: r.recipe_id,
  title: r.name,
  category: 'recipe',
  keywords: [r.origin_country, r.difficulty, ...r.ingredients]
}));
```

**Alternatives Considered**:
1. **Algolia**: Rejected - cost, overkill for <100 recipes
2. **Custom autocomplete**: Rejected - cmdk provides Command+K UX out-of-box
3. **Backend search**: Rejected - latency exceeds 300ms budget

---

## Decision 6: PWA Offline Support

**Context**: Phase 10 requires "PWA support for offline Lyari use" (intermittent connectivity areas).

**Decision**: Configure Docusaurus PWA plugin with Workbox for service worker, cache recipes and assets for offline use.

**Rationale**:
- Docusaurus has official PWA plugin
- Workbox handles cache invalidation automatically
- Recipes available offline (critical for Lyari users)
- Installable on home screen (better UX than browser bookmark)

**Implementation**:
```bash
npm install -D @docusaurus/plugin-pwa
```

**Configuration**:
```javascript
// docusaurus.config.js
plugins: [
  [
    '@docusaurus/plugin-pwa',
    {
      offlineModeActivationStrategies: ['queryString'],
      pwaHead: [{ tagName: 'link', rel: 'icon', href: '/icon-512.png' }],
    },
  ],
]
```

**Alternatives Considered**:
1. **Manual service worker**: Rejected - complex, error-prone
2. **Capacitor/Electron**: Rejected - overkill, web-first approach preferred
3. **No offline support**: Rejected - critical for target users in Lyari

---

## Decision 7: PDF Generation for Print-Ready Recipes

**Context**: Phase 10 requires "PDF generation for Print-Ready versions".

**Decision**: Use `react-pdf` for client-side PDF generation with print-optimized styling.

**Rationale**:
- Client-side generation (no server load)
- Print-optimized CSS (page breaks, margins, fonts)
- User can download/print immediately
- Consistent formatting across devices

**Implementation**:
```bash
npm install @react-pdf/renderer
```

**PDF Structure**:
- Recipe name, origin country, difficulty
- Ingredients list with checkboxes (printable)
- Step-by-step instructions with Kitchen Guard warnings
- QR code linking to video tutorial (if available)

**Alternatives Considered**:
1. **Server-side PDF (wkhtmltopdf)**: Rejected - server load, complexity
2. **Browser print dialog**: Rejected - inconsistent formatting
3. **Third-party PDF service**: Rejected - cost, latency

---

## Summary of Technology Additions

| Technology | Purpose | Phase |
|------------|---------|-------|
| **Tailwind CSS** | Custom UI styling | Phase 8 |
| **NoSleep.js** | Wake lock for Cook Mode | Phase 8 |
| **cmdk** | Command+K search | Phase 8 |
| **React Query** | Checkbox state sync | Phase 8 |
| **@docusaurus/plugin-pwa** | Offline support | Phase 10 |
| **@react-pdf/renderer** | PDF generation | Phase 10 |
| **Enhanced RAG prompt** | Chef AI substitutions | Phase 9 |

---

## Constitution Alignment Verification

All research decisions align with Constitution v1.2.0:

- ✅ **Principle VII (Systemic Interactivity)**: Cook Mode, checkboxes, progress sync
- ✅ **Principle VIII (Big-Tech UI/UX)**: Tailwind, Command+K, dark theme
- ✅ **Principle IX (Conversational Chef AI)**: Substitution logic, Halal compliance
- ✅ **Principle IV (Tech Stack Discipline)**: All additions are libraries, not framework changes

---

**Next Steps**: Proceed to Phase 1 - generate data-model.md, API contracts, quickstart.md
