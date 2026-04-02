import logger from '../utils/logger';

/**
 * User service API client
 *
 * This service provides methods for user profile management and voice selection
 * by making API calls to the backend user endpoints.
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

interface VoicePersonality {
  id: string;
  name: string;
  gender: string;
  personality_description: string;
  audio_sample_url: string;
  cultural_appropriateness?: string;
}

interface UserUpdateData {
  preferred_voice?: string;
  preferred_language?: string;
  dietary_restrictions?: string;
}

class UserService {
  private baseUrl: string;

  constructor() {
    // Safely check for environment variables in both browser and Node.js environments
    if (typeof process !== 'undefined' && process.env) {
      this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    } else {
      // Fallback for browser environments where process is not defined
      this.baseUrl = 'http://localhost:8000';
    }
  }

  private getTokenFromStorage(): string | null {
    // Try to get token from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private getAuthHeaders(): { [key: string]: string } {
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
    };

    const token = this.getTokenFromStorage();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async request(url: string, options: RequestInit): Promise<any> {
    try {
      const token = this.getTokenFromStorage();

      // Check if token is expired before making the request
      if (token && this.isTokenExpired(token)) {
        // Token is expired, remove it and redirect to login
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
          this.removeTokenFromStorage();
          window.location.href = '/login';
          throw new Error('Session expired. Please log in again.');
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail?.error || errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Check if it's a network error or a session expiration issue
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Network error
        logger.error('Network error during API request:', {
          context: 'UserService.request',
          error,
          data: { url, options }
        });
      } else if (error.message.includes('Session expired')) {
        // Session expired error - already handled by redirecting
        logger.warn('Session expired, redirected to login', {
          context: 'UserService.request',
          data: { url, options }
        });
      } else {
        logger.error('API request error:', {
          context: 'UserService.request',
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
        context: 'UserService.isTokenExpired',
        error
      });
      return true; // If we can't decode the token, assume it's expired
    }
  }

  private removeTokenFromStorage(): void {
    // Remove token from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * Get the current user's profile
   *
   * @returns Promise<User> - The user profile object
   * @throws Error if the request fails or user is not authenticated
   */
  async getProfile(): Promise<User> {
    return await this.request('/users/me', {
      method: 'GET',
    });
  }

  /**
   * Update the current user's profile
   *
   * @param updates - Object containing fields to update (preferred_voice, preferred_language, dietary_restrictions)
   * @returns Promise<User> - The updated user profile object
   * @throws Error if the request fails or validation errors occur
   */
  async updateProfile(updates: UserUpdateData): Promise<User> {
    return await this.request('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Get all available voice personalities
   *
   * @returns Promise<VoicePersonality[]> - Array of 7 voice personalities
   * @throws Error if the request fails
   */
  async getVoices(): Promise<VoicePersonality[]> {
    // This endpoint doesn't require authentication
    const response = await fetch(`${this.baseUrl}/voices`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail?.error || errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Update user's preferred voice
   * This is a convenience method that wraps updateProfile for voice selection
   *
   * @param voiceId - The ID of the selected voice (e.g., "arlow", "maya")
   * @returns Promise<User> - The updated user profile object
   * @throws Error if the request fails or voice ID is invalid
   */
  async updateVoicePreference(voiceId: string): Promise<User> {
    return await this.updateProfile({ preferred_voice: voiceId });
  }

  /**
   * Update user's preferred language
   * This is a convenience method that wraps updateProfile for language selection
   *
   * @param languageCode - The ISO 639-1 language code (e.g., "en", "ur", "ar")
   * @returns Promise<User> - The updated user profile object
   * @throws Error if the request fails or language code is invalid
   */
  async updateLanguagePreference(languageCode: string): Promise<User> {
    return await this.updateProfile({ preferred_language: languageCode });
  }
}

// Create a singleton instance of the UserService
const userService = new UserService();

export default userService;
export type { User, VoicePersonality, UserUpdateData };
