# Data Model: Interactive Recipe System

**Feature**: 001-recipe-content-schema  
**Date**: 2026-04-02  
**Version**: 1.2 (Product-System Era)

---

## Core Entities

### 1. Recipe (Existing - Enhanced)

**Purpose**: Master recipe with interactive metadata

**Fields**:
```python
class Recipe(BaseModel):
    recipe_id: UUID
    name: str
    origin_country: str
    difficulty: DifficultyLevel  # Absolute Beginner, Beginner, Beginner+
    prep_time: Optional[int]  # minutes
    cook_time: Optional[int]  # minutes
    total_time: int  # minutes
    servings: int  # base serving size
    kitchen_guard: str  # safety warnings
    metaphor_field: str  # personalization context
    language: LanguageCode
    created_at: datetime
    updated_at: datetime
```

**Relationships**:
- One-to-Many: Recipe → RecipeSteps
- One-to-Many: Recipe → Ingredients
- One-to-Many: Recipe → UserRecipeProgress

---

### 2. Ingredient (NEW)

**Purpose**: Individual ingredient with smart scaling support

**Fields**:
```python
class Ingredient(BaseModel):
    ingredient_id: UUID
    recipe_id: UUID  # FK to recipes
    name: str
    quantity: float  # base quantity
    unit: str  # cups, tbsp, grams, etc.
    category: str  # protein, vegetable, spice, etc.
    is_optional: bool = False
    substitutes: List[str]  # e.g., ["milk + lemon juice"]
    display_order: int
```

**Relationships**:
- Many-to-One: Ingredients → Recipe
- Many-to-One: IngredientCheckboxes → Ingredient

**Validation Rules**:
- quantity > 0
- unit must be from standardized list
- category helps with Chef AI fridge logic

---

### 3. RecipeStep (Existing - Enhanced)

**Purpose**: Individual cooking step with progress tracking

**Fields**:
```python
class RecipeStep(BaseModel):
    step_id: UUID
    recipe_id: UUID  # FK to recipes
    step_number: int  # 1-5 (max 5 steps per constitution)
    instruction: str
    kitchen_guard_warning: Optional[str]  # step-specific safety
    estimated_duration: Optional[int]  # minutes
    image_url: Optional[str]
    audio_clip_url: Optional[str]  # TTS generated
    display_order: int
```

**Relationships**:
- Many-to-One: RecipeSteps → Recipe
- One-to-Many: RecipeStep → StepProgress

**Constraints**:
- step_number: 1-5 (enforced by Constitution Principle II)
- One action per step (Beginner-Centric)

---

### 4. UserRecipeProgress (NEW)

**Purpose**: Track user's interactive progress through recipe

**Fields**:
```python
class UserRecipeProgress(BaseModel):
    user_id: UUID  # FK to users
    recipe_id: UUID  # FK to recipes
    started_at: datetime
    completed_at: Optional[datetime]
    current_step: int  # 1-5
    total_steps: int
    progress_percentage: float  # calculated
    cook_mode_active: bool  # is user in Cook Mode?
    last_synced_at: datetime
```

**Relationships**:
- Many-to-One: UserRecipeProgress → User
- Many-to-One: UserRecipeProgress → Recipe
- One-to-Many: UserRecipeProgress → IngredientCheckboxes
- One-to-Many: UserRecipeProgress → StepProgress

**State Transitions**:
```
Not Started → In Progress → Completed
                  ↓
            (Cook Mode Active)
```

---

### 5. IngredientCheckbox (NEW)

**Purpose**: Individual ingredient checkbox state

**Fields**:
```python
class IngredientCheckbox(BaseModel):
    progress_id: UUID  # FK to user_recipe_progress
    ingredient_id: UUID  # FK to ingredients
    is_checked: bool = False
    checked_at: Optional[datetime]
    display_order: int  # matches ingredient order
```

**Relationships**:
- Many-to-One: IngredientCheckbox → UserRecipeProgress
- Many-to-One: IngredientCheckbox → Ingredient

**Sync Strategy**:
- Optimistic updates (UI updates immediately)
- Background sync to PostgreSQL via React Query
- Conflict resolution: Last-write-wins

---

### 6. StepProgress (NEW)

**Purpose**: Visual progress bar state per step

**Fields**:
```python
class StepProgress(BaseModel):
    progress_id: UUID  # FK to user_recipe_progress
    step_id: UUID  # FK to recipe_steps
    step_number: int
    status: StepStatus  # pending, in_progress, completed
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    time_spent: int  # seconds (for analytics)
```

**StepStatus Enum**:
```python
class StepStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
```

**Progress Bar Logic**:
```typescript
const progressPercentage = (completedSteps / totalSteps) * 100;
// Visual indicator: [████████░░] 80% complete
```

---

### 7. ChefAISession (NEW)

**Purpose**: Conversational context for Chef AI interactions

**Fields**:
```python
class ChefAISession(BaseModel):
    session_id: UUID
    user_id: UUID  # FK to users
    recipe_id: Optional[UUID]  # context recipe (if any)
    user_inventory: List[str]  # available ingredients
    dietary_restrictions: List[str]  # e.g., ["Halal", "vegetarian"]
    conversation_history: List[Message]
    created_at: datetime
    last_activity: datetime
```

**Message Structure**:
```python
class Message(BaseModel):
    role: str  # "user" or "chef_ai"
    content: str
    timestamp: datetime
    metadata: dict  # e.g., {"substitution_for": "buttermilk"}
```

**Chef AI Capabilities**:
1. **Fridge Logic**: Suggest recipes from user_inventory
2. **Substitutions**: "What can I use instead of X?"
3. **Suitability**: "Is this beginner-friendly?"
4. **Safety**: "Can I eat this if it's been out for 2 hours?"

**Halal Compliance Filter**:
```python
HALAL_FORBIDDEN = ["pork", "alcohol", "carnivore_meat_unless_halal_slaughter"]

def is_halal_compliant(suggestion: str) -> bool:
    return not any(forbidden in suggestion.lower() 
                   for forbidden in HALAL_FORBIDDEN)
```

---

### 8. ServingSizeScale (NEW)

**Purpose**: Smart scaling factor for ingredient quantities

**Fields**:
```python
class ServingSizeScale(BaseModel):
    recipe_id: UUID  # FK to recipes
    base_servings: int  # original recipe serves
    target_servings: int  # user wants to serve
    scale_factor: float  # target / base
    scaled_ingredients: List[ScaledIngredient]
```

**Scaled Ingredient**:
```python
class ScaledIngredient(BaseModel):
    original_quantity: float
    scaled_quantity: float  # original * scale_factor
    unit: str
    display_text: str  # "2 cups" → "4 cups"
```

**Scaling Example**:
```
Base recipe: 4 servings
User wants: 8 servings
Scale factor: 2.0

Original: 2 cups flour
Scaled: 4 cups flour
```

---

## Database Schema (PostgreSQL)

```sql
-- User Recipe Progress (FR-009: Interactivity)
CREATE TABLE user_recipe_progress (
    user_id UUID REFERENCES users(id),
    recipe_id UUID REFERENCES recipes(id),
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    current_step INTEGER CHECK (current_step BETWEEN 1 AND 5),
    total_steps INTEGER CHECK (total_steps BETWEEN 1 AND 5),
    cook_mode_active BOOLEAN DEFAULT FALSE,
    last_synced_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, recipe_id)
);

-- Ingredient Checkboxes (FR-009)
CREATE TABLE ingredient_checkboxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    progress_user_id UUID,
    progress_recipe_id UUID,
    ingredient_id UUID REFERENCES ingredients(id),
    is_checked BOOLEAN DEFAULT FALSE,
    checked_at TIMESTAMP,
    display_order INTEGER,
    FOREIGN KEY (progress_user_id, progress_recipe_id) 
        REFERENCES user_recipe_progress(user_id, recipe_id)
);

-- Step Progress (FR-009)
CREATE TABLE step_progress (
    progress_user_id UUID,
    progress_recipe_id UUID,
    step_id UUID REFERENCES recipe_steps(id),
    step_number INTEGER CHECK (step_number BETWEEN 1 AND 5),
    status VARCHAR(20) CHECK (status IN ('pending', 'in_progress', 'completed')),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    time_spent INTEGER, -- seconds
    PRIMARY KEY (progress_user_id, progress_recipe_id, step_id)
);

-- Chef AI Sessions (FR-011)
CREATE TABLE chef_ai_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    recipe_id UUID REFERENCES recipes(id),
    user_inventory JSONB, -- ["chicken", "rice", "tomatoes"]
    dietary_restrictions JSONB, -- ["Halal"]
    conversation_history JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    last_activity TIMESTAMP DEFAULT NOW()
);
```

---

## Indexes for Performance

```sql
-- Fast progress lookup
CREATE INDEX idx_progress_user_recipe 
ON user_recipe_progress(user_id, recipe_id);

-- Fast ingredient checkbox sync
CREATE INDEX idx_checkboxes_progress 
ON ingredient_checkboxes(progress_user_id, progress_recipe_id);

-- Chef AI session retrieval
CREATE INDEX idx_chef_ai_user 
ON chef_ai_sessions(user_id, last_activity DESC);

-- Command+K search optimization (SC-006: <300ms)
CREATE INDEX idx_recipes_search 
ON recipes(name, origin_country, difficulty);
```

---

## Entity Relationships Diagram

```
┌─────────────┐
│   Recipe    │
└──────┬──────┘
       │
       ├──────────────┬────────────────┐
       │              │                │
       ▼              ▼                ▼
┌─────────────┐ ┌───────────┐  ┌──────────────┐
│ Ingredients │ │RecipeSteps│  │UserRecipeProg│
└──────┬──────┘ └─────┬─────┘  └──────┬───────┘
       │              │               │
       │              │        ┌──────┴──────┐
       │              │        │             │
       │              │        ▼             ▼
       │              │  ┌──────────┐ ┌──────────┐
       │              │  │Ingredient│ │StepProgress│
       │              │  │ Checkboxes│ │          │
       │              │  └──────────┘ └──────────┘
       │              │
       ▼              ▼
┌─────────────┐ ┌─────────────┐
│ServingSize  │ │ ChefAI      │
│ Scale       │ │ Session     │
└─────────────┘ └─────────────┘
```

---

## Validation Rules

### Recipe Constraints (Constitution Principle II)
- ✅ Max 5 steps per recipe
- ✅ One action per step
- ✅ Kitchen Guard mandatory

### Ingredient Checkbox Constraints (Constitution Principle VII)
- ✅ Touch target: 44x44px minimum
- ✅ Sync within 100ms (optimistic updates)
- ✅ Persistent across sessions

### Chef AI Constraints (Constitution Principle IX)
- ✅ Halal compliance filter (no pork, alcohol)
- ✅ Cultural sensitivity for traditional dishes
- ✅ Citations for food safety claims

### Command+K Search Constraints (Constitution Principle VIII)
- ✅ Search results in <300ms
- ✅ 100% recipe coverage
- ✅ Fuzzy matching for typos

---

**Next Steps**: Generate API contracts in `/contracts/` directory
