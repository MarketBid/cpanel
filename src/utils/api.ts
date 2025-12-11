import { AuthTokens, ApiResponse } from '../types';

export const API_BASE_URL = 'http://0.0.0.0:8000';
// export const API_BASE_URL = "https://5c31e3dcf969.ngrok-free.app"

class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadTokenFromStorage();
  }

  private loadTokenFromStorage() {
    const tokens = localStorage.getItem('auth_tokens');
    if (tokens) {
      const parsedTokens: AuthTokens = JSON.parse(tokens);
      this.accessToken = parsedTokens.access_token;
    }
  }

  setTokens(tokens: AuthTokens) {
    this.accessToken = tokens.access_token;
    localStorage.setItem('auth_tokens', JSON.stringify(tokens));
  }

  clearTokens() {
    this.accessToken = null;
    localStorage.removeItem('auth_tokens');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    skipAuthRedirect: boolean = false
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      defaultHeaders['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
        'ngrok-skip-browser-warning': '1',
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        if (response.status === 401 && !skipAuthRedirect) {
          this.clearTokens();
          window.location.href = '/login';
          throw new Error('Authentication failed');
        }

        const errorData = await response.json();
        throw new Error(errorData.detail || 'Request failed');
      }

      const data = await response.json();
      return {
        data,
        status: 'success'
      };
    } catch (error) {
      throw error;
    }
  }

  async get<T>(endpoint: string, skipAuthRedirect?: boolean): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, skipAuthRedirect);
  }

  async post<T>(endpoint: string, data?: any, skipAuthRedirect?: boolean): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }, skipAuthRedirect);
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Auth specific method for form data
  async postForm<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      method: 'POST',
      body: formData,
    };

    if (this.accessToken) {
      config.headers = {
        'Authorization': `Bearer ${this.accessToken}`,
      };
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Request failed');
      }

      const data = await response.json();
      return {
        data,
        status: 'success'
      };
    } catch (error) {
      throw error;
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);