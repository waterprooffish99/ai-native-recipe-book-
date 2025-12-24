# Data Model: Recipe Content Schema

## Recipe Entity
- **recipe_id**: UUID (Primary Key)
- **name**: String (Recipe name in default language)
- **origin_country**: String (Country of origin)
- **difficulty**: Enum ['Absolute Beginner', 'Beginner', 'Beginner+']
- **prep_time**: Integer (in minutes)
- **cook_time**: Integer (in minutes)
- **total_time**: Integer (in minutes)
- **servings**: Integer
- **created_at**: DateTime
- **updated_at**: DateTime
- **is_active**: Boolean (for soft deletion)

## RecipeTranslation Entity
- **translation_id**: UUID (Primary Key)
- **recipe_id**: UUID (Foreign Key to Recipe)
- **language_code**: String (EN, UR, AR, ES, FR, FA)
- **name**: String (Translated recipe name)
- **kitchen_guard**: String (Translated safety tips)
- **ingredients**: JSON (Translated ingredients with quantities)
- **created_at**: DateTime
- **updated_at**: DateTime

## RecipeStep Entity
- **step_id**: UUID (Primary Key)
- **recipe_id**: UUID (Foreign Key to Recipe)
- **step_number**: Integer (1-5)
- **instruction**: String (Single action instruction)
- **audio_clip_url**: String (Optional audio for instruction)
- **image_url**: String (Optional image for instruction)
- **created_at**: DateTime

## RecipeStepTranslation Entity
- **step_translation_id**: UUID (Primary Key)
- **step_id**: UUID (Foreign Key to RecipeStep)
- **language_code**: String (EN, UR, AR, ES, FR, FA)
- **instruction**: String (Translated instruction)
- **created_at**: DateTime

## UserBackground Entity
- **user_id**: UUID (Primary Key)
- **software_background**: String (User's software experience level)
- **hardware_background**: String (User's hardware experience level)
- **cooking_level**: String (User's cooking experience level)
- **dietary_restrictions**: String (Dietary restrictions)
- **preferred_language**: String (Default language preference)
- **preferred_voice**: String (Preferred voice personality)

## MetaphorMapping Entity
- **mapping_id**: UUID (Primary Key)
- **background_type**: String (e.g., 'software', 'hardware', 'cooking')
- **background_level**: String (e.g., 'beginner', 'intermediate', 'expert')
- **context**: String (e.g., 'recipe_explanation', 'safety_tips', 'welcome_message')
- **metaphor_template**: String (Template with placeholders for personalization)
- **is_active**: Boolean

## Relationships
- Recipe (1) → RecipeTranslation (Many)
- Recipe (1) → RecipeStep (Many)
- RecipeStep (1) → RecipeStepTranslation (Many)
- UserBackground (1) → MetaphorMapping (Many) [via background matching]

## Validation Rules
- Recipe must have maximum 5 steps (enforced by application logic)
- Each step must contain only one action (enforced by application logic)
- All required fields in RecipeTranslation must be provided for each supported language
- Step numbers must be sequential from 1 to N (where N ≤ 5)
- Difficulty must be one of the defined enum values
- Language codes must be one of the supported 6 languages (EN, UR, AR, ES, FR, FA)

## State Transitions
- Recipe: Draft → Active (when all required translations are provided)
- RecipeStep: Draft → Active (when translation is provided)
- MetaphorMapping: Draft → Active (when reviewed and approved)