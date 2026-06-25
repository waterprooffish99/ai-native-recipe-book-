/**
 * T138: Chef AI API Client
 * TypeScript service for interacting with the Conversational Chef AI and Fridge Logic endpoints.
 */

export interface ChefAICitation {
  text: string;
  url?: string;
}

export interface ChefAIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface ChefAIChatRequest {
  session_id?: string;
  user_id?: string;
  message: string;
  recipe_context_id?: string;
  dietary_restrictions?: string[];
  conversation_history?: ChefAIMessage[];
}

export interface ChefAIChatResponse {
  session_id: string;
  reply: string;
  is_halal_compliant: boolean;
  citations: ChefAICitation[];
  suggested_recipe_ids: string[];
  tokens_used?: number;
}

export interface FridgeIngredient {
  name: string;
  quantity?: string;
}

export interface FridgeLogicRequest {
  user_id?: string;
  available_ingredients: FridgeIngredient[];
  dietary_restrictions?: string[];
  max_results?: number;
}

export interface RecipeSuggestion {
  recipe_id: string;
  name: string;
  origin_country: string;
  difficulty: string;
  match_score: number;
  matched_ingredients: string[];
  missing_ingredients: string[];
}

export interface FridgeLogicResponse {
  suggestions: RecipeSuggestion[];
  total_recipes_checked: number;
}

// Safely access environment variable or default to port 8002
const API_BASE_URL = (typeof process !== 'undefined' && process.env)
  ? process.env.REACT_APP_API_URL || 'https://waterprooffish99-global-plate-backend.hf.space'
  : 'https://waterprooffish99-global-plate-backend.hf.space';

const getAuthHeaders = (): Record<string, string> => {
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
};

export const chefAiService = {
  /**
   * T134: POST /chef-ai/chat
   * Sends a conversational query to Chef AI.
   */
  async sendMessage(request: ChefAIChatRequest): Promise<ChefAIChatResponse> {
    const response = await fetch(`${API_BASE_URL}/chef-ai/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * T176: POST /api/v2/chat/stream
   * Initiates a streaming chat request to Chef AI.
   */
  async sendMessageStream(request: ChefAIChatRequest): Promise<Response> {
    const response = await fetch(`${API_BASE_URL}/api/v2/chat/stream`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    return response;
  },


  /**
   * T135: POST /chef-ai/fridge-logic
   * Retrieves recipe suggestions based on a list of ingredients in the user's inventory.
   */
  async getFridgeSuggestions(request: FridgeLogicRequest): Promise<FridgeLogicResponse> {
    const response = await fetch(`${API_BASE_URL}/chef-ai/fridge-logic`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error(`Failed to get suggestions: ${response.statusText}`);
    }
    return response.json();
  },
};

// Also export as default for flexible imports
export default chefAiService;
