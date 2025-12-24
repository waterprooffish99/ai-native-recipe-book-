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
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
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
      const response = await fetch(`${this.baseUrl}${url}`, {
        ...options,
        headers: {
          ...options.headers,
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