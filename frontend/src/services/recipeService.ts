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

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export class RecipeService {
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
}
