/**
 * T052: Recipe API Client
 * TypeScript service for all recipe endpoint interactions
 */

export interface Recipe {
  recipe_id: string;
  name: string;
  origin_country: string;
  difficulty: string;
  prep_time?: number;
  cook_time?: number;
  total_time?: number;
  servings?: number;
  kitchen_guard?: string;
  ingredients?: any[];
  steps?: RecipeStep[];
  language: string;
}

export interface RecipeStep {
  step_number: number;
  instruction: string;
}

export interface RecipeSummary {
  recipe_id: string;
  name: string;
  origin_country: string;
  difficulty: string;
  prep_time?: number;
  cook_time?: number;
  total_time?: number;
  servings?: number;
  language: string;
}

// Safely access environment variable in browser environment (Docusaurus 3/webpack 5 compatible)
// Updated to port 8002 for WSL native backend (avoids Windows port conflicts)
const API_BASE_URL = (typeof process !== 'undefined' && process.env)
  ? process.env.REACT_APP_API_URL || 'http://localhost:8002'  // Port 8002 for WSL
  : 'http://localhost:8002';

export interface IngredientCheckboxState {
  ingredient_id: string;
  is_checked: boolean;
  checked_at?: string;
}

export interface StepProgressState {
  step_id: string;
  step_number: number;
  status: string;
  completed_at?: string;
}

export interface UserRecipeProgress {
  user_id: string;
  recipe_id: string;
  current_step: number;
  total_steps: number;
  progress_percentage: number;
  ingredient_checkboxes: IngredientCheckboxState[];
  step_progress: StepProgressState[];
  cook_mode_active: boolean;
  last_synced_at: string;
}

export interface CookModeState {
  active: boolean;
  current_step: number;
  wake_lock_enabled: boolean;
  large_text_mode: boolean;
}

export class RecipeService {
  private static getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  /**
   * List all recipes with optional filters
   */
  static async listRecipes(
    language: string = 'EN',
    difficulty?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<RecipeSummary[]> {
    const params = new URLSearchParams({
      language,
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (difficulty) {
      params.append('difficulty', difficulty);
    }

    const response = await fetch(`${API_BASE_URL}/recipes?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch recipes: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get recipe by ID
   */
  static async getRecipeById(
    recipeId: string,
    language: string = 'EN'
  ): Promise<Recipe> {
    const params = new URLSearchParams({ language });
    const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}?${params}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Recipe not found');
      }
      throw new Error(`Failed to fetch recipe: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get recipe translation in specific language
   */
  static async getRecipeTranslation(
    recipeId: string,
    language: string
  ): Promise<Recipe> {
    const params = new URLSearchParams({ language });
    const response = await fetch(
      `${API_BASE_URL}/recipes/${recipeId}/translate?${params}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Translation not found');
      }
      throw new Error(`Failed to fetch translation: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get user progress for a recipe
   */
  static async getRecipeProgress(recipeId: string): Promise<UserRecipeProgress> {
    const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}/progress`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch recipe progress: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Initialize or update recipe progress
   */
  static async updateRecipeProgress(
    recipeId: string,
    currentStep: number,
    stepStatus: string,
    cookModeActive: boolean = false
  ): Promise<UserRecipeProgress> {
    const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}/progress`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        current_step: currentStep,
        step_status: stepStatus,
        cook_mode_active: cookModeActive,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update recipe progress: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Toggle checked status of an ingredient
   */
  static async toggleIngredientCheckbox(
    recipeId: string,
    ingredientId: string,
    isChecked: boolean
  ): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/recipes/${recipeId}/ingredients/check`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          ingredient_id: ingredientId,
          is_checked: isChecked,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to toggle ingredient checkbox: ${response.statusText}`);
    }
  }

  /**
   * Toggle cook mode
   */
  static async toggleCookMode(recipeId: string): Promise<CookModeState> {
    const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}/cook-mode`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to toggle cook mode: ${response.statusText}`);
    }

    return response.json();
  }
}
