import logger from '../utils/logger';

/**
 * Survey service API client
 *
 * This service provides methods for submitting and retrieving survey responses
 * by making API calls to the backend survey endpoints.
 */

interface SurveyResponse {
  id: string;
  user_id: string;
  software_background?: string;
  hardware_background?: string;
  cooking_level: string;
  dietary_restrictions?: string;
  preferred_voice: string;
  preferred_language: string;
  submitted_at: string;
}

interface SurveySubmitData {
  software_background: string;
  hardware_background?: string;
  cooking_level: string;
  dietary_restrictions?: string;
  preferred_voice: string;
  preferred_language: string;
}

class SurveyService {
  private baseUrl: string;

  constructor() {
    // Safely check for environment variables in both browser and Node.js environments
    if (typeof process !== 'undefined' && process.env) {
      this.baseUrl = process.env.REACT_APP_API_URL || 'https://waterprooffish99-global-plate-backend.hf.space';
    } else {
      // Fallback for browser environments where process is not defined
      this.baseUrl = 'https://waterprooffish99-global-plate-backend.hf.space';
    }
  }

  private getAuthHeaders(): { [key: string]: string } {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  private getToken(): string | null {
    // Try to get token from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private async request(url: string, options: RequestInit): Promise<any> {
    try {
      const token = this.getToken();

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
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Check if it's a network error or a session expiration issue
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Network error
        logger.error('Network error during API request:', {
          context: 'SurveyService.request',
          error,
          data: { url, options }
        });
      } else if (error.message.includes('Session expired')) {
        // Session expired error - already handled by redirecting
        logger.warn('Session expired, redirected to login', {
          context: 'SurveyService.request',
          data: { url, options }
        });
      } else {
        logger.error('API request error:', {
          context: 'SurveyService.request',
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
        context: 'SurveyService.isTokenExpired',
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

  async submitSurvey(surveyData: SurveySubmitData): Promise<SurveyResponse> {
    const response = await this.request('/survey', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(surveyData),
    });

    return response;
  }

  async getSurvey(): Promise<SurveyResponse> {
    const response = await this.request('/survey/me', {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return response;
  }
}

// Create a singleton instance of the SurveyService
const surveyService = new SurveyService();

export default surveyService;
export type { SurveyResponse, SurveySubmitData };