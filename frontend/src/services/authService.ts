/**
 * Authentication service API client
 *
 * This service provides methods for signup, login, logout, and other auth operations
 * by making API calls to the backend authentication endpoints.
 */

import logger from '../utils/logger';

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
    // Safely access environment variable in browser environment (Docusaurus 3/webpack 5 compatible)
    // Check if process and process.env exist before accessing environment variables
    // Updated to port 8002 for WSL native backend (avoids Windows port conflicts)
    let apiUrl = 'https://waterprooffish99-global-plate-backend.hf.space'; // default fallback
    // Browser-safe check: process is not defined in browser, so we check for it first
    if (typeof process !== 'undefined' && process.env) {
      apiUrl = process.env.REACT_APP_API_URL || 'https://waterprooffish99-global-plate-backend.hf.space';
    }
    this.baseUrl = apiUrl;
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
      // Check if token is expired before making the request
      if (this.token && this.isTokenExpired(this.token)) {
        // Token is expired, remove it and redirect to login
        this.token = null;
        this.removeTokenFromStorage();
        window.location.href = '/login';
        throw new Error('Session expired. Please log in again.');
      }

      const response = await fetch(`${this.baseUrl}${url}`, {
        ...options,
        headers: {
          ...options.headers,
          ...this.getAuthHeaders(),
        },
      });

      // Check if the response indicates an expired token
      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.error && (errorData.error.includes('expired') || errorData.error.includes('invalid') || errorData.code === 'INVALID_TOKEN')) {
          // Token is expired or invalid, remove it and redirect to login
          this.token = null;
          this.removeTokenFromStorage();
          window.location.href = '/login';
          throw new Error('Session expired. Please log in again.');
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Check if it's a network error or a session expiration issue
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Network error
        logger.error('Network error during API request:', {
          context: 'AuthService.request',
          error,
          data: { url, options }
        });
      } else if (error.message.includes('Session expired')) {
        // Session expired error - already handled by redirecting
        logger.warn('Session expired, redirected to login', {
          context: 'AuthService.request',
          data: { url, options }
        });
      } else {
        logger.error('API request error:', {
          context: 'AuthService.request',
          error,
          data: { url, options }
        });
      }
      throw error;
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      // Split the token to get the payload
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        return true; // Invalid token format
      }

      // Decode the payload
      const payload = JSON.parse(atob(tokenParts[1]));

      // Check if the token has an expiration time
      if (!payload.exp) {
        return false; // No expiration time set, assume it's valid
      }

      // Compare with current time (in seconds)
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      logger.error('Error decoding token:', {
        context: 'AuthService.isTokenExpired',
        error
      });
      return true; // If we can't decode the token, assume it's expired
    }
  }

  async signup(userData: SignupData): Promise<AuthResponse> {
    try {
      const response = await this.request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      // Save the token to localStorage
      this.token = response.token;
      this.saveTokenToStorage(response.token);

      // In a real app, we would use the toast context here
      // For now, we'll just return the response
      return response;
    } catch (error) {
      // In a real app, we would show a toast notification here
      throw error;
    }
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
      logger.error('Error decoding token:', {
        context: 'AuthService.getCurrentUser',
        error
      });
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