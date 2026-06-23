# Quickstart: Product-System Era Features

**Feature**: 001-recipe-content-schema  
**Version**: 1.2.0  
**Date**: 2026-04-02

---

## Overview

This quickstart covers Phase 8-10 implementation of Product-System Era features:

1. **Cook Mode** - Wake lock, large text, step-by-step focus
2. **Ingredient Checkboxes** - Interactive progress tracking
3. **Chef AI** - Conversational substitutions and fridge logic
4. **Command+K Search** - Instant recipe search
5. **PWA Offline** - Works in Lyari with intermittent connectivity

---

## Prerequisites

- Backend running on `http://localhost:8002`
- Frontend running on `http://localhost:3000`
- Node.js 18+, Python 3.11+
- Neon PostgreSQL connection string
- Qdrant Cloud URL and API key

---

## Step 1: Install New Dependencies

### Backend (Python)
```bash
cd backend
source .venv/bin/activate
pip install nosleep  # Not needed - frontend only
```

### Frontend (TypeScript)
```bash
cd frontend
npm install tailwindcss postcss autoprefixer
npm install nosleep.js
npm install cmdk
npm install @tanstack/react-query
npm install @docusaurus/plugin-pwa
npm install @react-pdf/renderer
npx tailwindcss init
```

---

## Step 2: Configure Tailwind CSS

Create `frontend/tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class', // Enable dark mode by default
  theme: {
    extend: {
      colors: {
        globalplate: {
          bg: '#1a1a2e',
          surface: '#16213e',
          card: '#0f3460',
          accent: '#e94560',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
```

---

## Step 3: Database Migrations

Run the new migrations for interactive features:

```bash
cd backend
alembic revision -m "Add interactive features tables"
```

Edit the generated migration file:
```python
def upgrade():
    # User Recipe Progress
    op.create_table('user_recipe_progress',
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('recipe_id', sa.UUID(), nullable=False),
        sa.Column('current_step', sa.Integer(), nullable=True),
        sa.Column('total_steps', sa.Integer(), nullable=True),
        sa.Column('cook_mode_active', sa.Boolean(), default=False),
        sa.Column('last_synced_at', sa.DateTime(), default=func.now()),
        sa.PrimaryKeyConstraint('user_id', 'recipe_id')
    )
    
    # Ingredient Checkboxes
    op.create_table('ingredient_checkboxes',
        sa.Column('id', sa.UUID(), primary_key=True),
        sa.Column('progress_user_id', sa.UUID(), nullable=False),
        sa.Column('progress_recipe_id', sa.UUID(), nullable=False),
        sa.Column('ingredient_id', sa.UUID(), nullable=False),
        sa.Column('is_checked', sa.Boolean(), default=False),
        sa.Column('checked_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['progress_user_id', 'progress_recipe_id'], 
                               ['user_recipe_progress.user_id', 'user_recipe_progress.recipe_id'])
    )
    
    # Chef AI Sessions
    op.create_table('chef_ai_sessions',
        sa.Column('session_id', sa.UUID(), primary_key=True),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('user_inventory', sa.JSON(), nullable=True),
        sa.Column('dietary_restrictions', sa.JSON(), nullable=True),
        sa.Column('conversation_history', sa.JSON(), nullable=True)
    )

def downgrade():
    op.drop_table('chef_ai_sessions')
    op.drop_table('ingredient_checkboxes')
    op.drop_table('user_recipe_progress')
```

Apply migrations:
```bash
alembic upgrade head
```

---

## Step 4: Implement Cook Mode Component

Create `frontend/src/components/recipes/CookMode.tsx`:
```typescript
import React, { useEffect, useState } from 'react';
import NoSleep from 'nosleep.js';

interface CookModeProps {
  recipe: Recipe;
  currentStep: number;
  onStepComplete: (stepNumber: number) => void;
  onExit: () => void;
}

export const CookMode: React.FC<CookModeProps> = ({
  recipe,
  currentStep,
  onStepComplete,
  onExit
}) => {
  const [noSleep] = useState(new NoSleep());

  useEffect(() => {
    // Enable wake lock
    noSleep.enable();
    return () => noSleep.disable();
  }, []);

  const step = recipe.steps[currentStep - 1];

  return (
    <div className="fixed inset-0 bg-globalplate-bg z-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-globalplate-card">
        <h2 className="text-2xl font-bold text-white">
          Step {currentStep} of {recipe.steps.length}
        </h2>
        <button
          onClick={onExit}
          className="px-4 py-2 bg-globalplate-accent text-white rounded"
        >
          Exit Cook Mode
        </button>
      </div>

      {/* Current Step - Large Text */}
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-4xl font-bold text-white text-center">
          {step.instruction}
        </p>
      </div>

      {/* Kitchen Guard Warning */}
      {step.kitchen_guard_warning && (
        <div className="bg-red-600 text-white p-4 text-xl">
          ⚠️ {step.kitchen_guard_warning}
        </div>
      )}

      {/* Ingredient Checkboxes */}
      <div className="p-4 bg-globalplate-surface">
        <h3 className="text-xl text-white mb-2">Ingredients for this step:</h3>
        {step.ingredients.map(ingredient => (
          <label key={ingredient.id} className="flex items-center space-x-3 p-3">
            <input
              type="checkbox"
              className="w-8 h-8"
              onChange={() => {/* toggle logic */}}
            />
            <span className="text-lg text-white">{ingredient.name}</span>
          </label>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-globalplate-card">
        <div
          className="h-full bg-globalplate-accent transition-all"
          style={{ width: `${(currentStep / recipe.steps.length) * 100}%` }}
        />
      </div>

      {/* Next Button */}
      <button
        onClick={() => onStepComplete(currentStep)}
        className="m-4 p-4 bg-globalplate-accent text-white text-2xl rounded"
      >
        {currentStep < recipe.steps.length ? 'Next Step →' : '✓ Complete!'}
      </button>
    </div>
  );
};
```

---

## Step 5: Implement Command+K Search

Create `frontend/src/components/search/CommandK.tsx`:
```typescript
import { Command } from 'cmdk';
import { useEffect, useState } from 'react';

export const CommandK = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);

  // Toggle with Command+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Search logic (client-side, <300ms)
  useEffect(() => {
    if (search.length > 0) {
      const filtered = recipes.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.ingredients.some(i => i.name.toLowerCase().includes(search.toLowerCase()))
      );
      setResults(filtered.slice(0, 10));
    }
  }, [search]);

  return (
    <Command modal open={open} onOpenChange={setOpen}>
      <Command.Input
        value={search}
        onValueChange={setSearch}
        placeholder="Search recipes, ingredients..."
      />
      <Command.List>
        {results.map(recipe => (
          <Command.Item
            key={recipe.recipe_id}
            value={recipe.name}
            onSelect={() => {/* navigate to recipe */}}
          >
            {recipe.name}
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
```

---

## Step 6: Configure PWA

Update `frontend/docusaurus.config.ts`:
```typescript
import { Config } from '@docusaurus/types';

const config: Config = {
  // ... existing config
  plugins: [
    [
      '@docusaurus/plugin-pwa',
      {
        offlineModeActivationStrategies: ['queryString'],
        pwaHead: [
          {
            tagName: 'link',
            rel: 'icon',
            href: '/icon-512.png',
          },
          {
            tagName: 'link',
            rel: 'manifest',
            href: '/manifest.json',
          },
        ],
      },
    ],
  ],
};

export default config;
```

Create `frontend/static/manifest.json`:
```json
{
  "name": "Global Plate",
  "short_name": "GlobalPlate",
  "description": "AI-powered recipe companion",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#1a1a2e",
  "background_color": "#1a1a2e",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## Step 7: Test Interactive Features

### Cook Mode Test
1. Open any recipe
2. Click "Start Cook Mode" button
3. Verify screen stays awake (no timeout)
4. Verify large text, high contrast
5. Check ingredient checkboxes work
6. Verify progress bar updates

### Command+K Test
1. Press `Cmd+K` (or `Ctrl+K`)
2. Type "chicken"
3. Verify results appear in <300ms
4. Press Enter to select recipe
5. Verify navigation works

### Chef AI Test
1. Click Chef AI floating button
2. Ask: "What can I substitute for buttermilk?"
3. Verify response: "Use milk + 1 tbsp lemon juice"
4. Ask: "I have chicken and rice, what can I make?"
5. Verify fridge logic suggests matching recipes

### PWA Offline Test
1. Open app with internet
2. Navigate to recipe
3. Disconnect internet
4. Reload page
5. Verify recipe still loads (cached)
6. Verify "Offline Mode" banner appears

---

## Troubleshooting

### Cook Mode wake lock not working
- Check browser supports Screen Wake Lock API
- Fallback to NoSleep.js for Safari/Firefox
- Ensure HTTPS (wake lock requires secure context)

### Command+K slow (>300ms)
- Verify search is client-side (not API call)
- Check recipe index is pre-built
- Reduce search result limit (default 10)

### Chef AI not Halal-compliant
- Verify Halal filter in backend prompt
- Check substitution database for forbidden items
- Add explicit constraints to RAG prompt

### PWA not caching
- Check service worker registration
- Verify `offlineModeActivationStrategies` config
- Clear browser cache, reload

---

## Next Steps

After completing this quickstart:

1. ✅ Cook Mode functional with wake lock
2. ✅ Ingredient checkboxes sync to database
3. ✅ Chef AI provides Halal-compliant substitutions
4. ✅ Command+K search works in <300ms
5. ✅ PWA works offline in Lyari

**Ready for Phase 11: User Testing & Refinement**
