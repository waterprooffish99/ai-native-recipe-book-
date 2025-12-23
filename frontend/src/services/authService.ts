/**
 * Authentication service API client
 *
 * This service provides methods for signup, login, logout, and other auth operations
 * by making API calls to the backend authentication endpoints.
 */

interface User {
  id: string;
  email: string;
  name: string;
  software_background?: string;
  hardware_background?: string;
  cooking_level: string;
  dietary_restrictions?: string;
  preferred_voice?: string;
  preferred_language: string;
  recipes_mastered: number;
  onboarding_completed: boolean;
  created_at: string;
  last_login?: string;
  updated_at: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface SignupData {
  email: string;
  password: string;
  name: string;
}

interface LoginData {
  email: string;
  password: string;
}

class AuthService {
  private baseUrl: string;
  private token: string | null;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    this.token = this.getTokenFromStorage();
  }

  private getTokenFromStorage(): string | null {
    // Try to get token from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private saveTokenToStorage(token: string): void {
    // Save token to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  private removeTokenFromStorage(): void {
    // Remove token from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private getAuthHeaders(): { [key: string]: string } {
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request(url: string, options: RequestInit): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        ...options,
        headers: {
          ...options.headers,
          ...this.getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  async signup(userData: SignupData): Promise<AuthResponse> {
    const response = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Save the token to localStorage
    this.token = response.token;
    this.saveTokenToStorage(response.token);

    return response;
  }

  async login(userData: LoginData): Promise<AuthResponse> {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Save the token to localStorage
    this.token = response.token;
    this.saveTokenToStorage(response.token);

    return response;
  }

  async logout(): Promise<void> {
    if (this.token) {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    }

    // Remove the token from localStorage
    this.token = null;
    this.removeTokenFromStorage();
  }

  async getGoogleAuthUrl(): Promise<{ auth_url: string; state: string }> {
    return await this.request('/auth/google', {
      method: 'GET',
    });
  }

  async handleGoogleCallback(code: string, state: string): Promise<AuthResponse> {
    // This would typically be called from the callback page
    // We'll construct the URL with the code and state as query parameters
    const response = await this.request(`/auth/google/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`, {
      method: 'GET',
    });

    // Save the token to localStorage
    this.token = response.token;
    this.saveTokenToStorage(response.token);

    return response;
  }

  getToken(): string | null {
    return this.token;
  }

  getCurrentUser(): User | null {
    if (!this.token) {
      return null;
    }

    try {
      // Decode the JWT token to get user info
      const tokenParts = this.token.split('.');
      if (tokenParts.length !== 3) {
        return null;
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      return {
        id: payload.user_id,
        email: payload.email,
        name: payload.name || '',
        cooking_level: payload.cooking_level || 'Absolute Beginner',
        preferred_language: payload.preferred_language || 'en',
        recipes_mastered: payload.recipes_mastered || 0,
        onboarding_completed: payload.onboarding_completed || false,
        created_at: payload.created_at || new Date().toISOString(),
        updated_at: payload.updated_at || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

// Create a singleton instance of the AuthService
const authService = new AuthService();

export default authService;
export type { User, AuthResponse, SignupData, LoginData };