/**
 * T053: RAG API Client
 * Service for RAG-based recipe search
 */

export interface RecipeSearchResult {
  recipe: {
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
    steps?: { step_number: number; instruction: string }[];
    language: string;
  };
  relevance_score: number;
  matched_content: string;
}

// Safely check for environment variables in both browser and Node.js environments
const API_BASE_URL = (typeof process !== 'undefined' && process.env)
  ? process.env.REACT_APP_API_URL || 'http://localhost:8000'
  : 'http://localhost:8000';

export class RAGService {
  /**
   * Search recipes using natural language query
   */
  static async searchRecipes(
    query: string,
    language: string = 'EN',
    difficulty?: string,
    maxResults: number = 5
  ): Promise<RecipeSearchResult[]> {
    const params = new URLSearchParams({
      query,
      language,
      max_results: maxResults.toString(),
    });

    if (difficulty) {
      params.append('difficulty', difficulty);
    }

    const response = await fetch(`${API_BASE_URL}/recipes/search?${params}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Search failed: ' + response.statusText);
    }

    return response.json();
  }
}
