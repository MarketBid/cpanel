import { apiClient } from './api';
import { AuthTokens, LoginData, RegisterData, User } from '../types';

export const authService = {
  async login(credentials: LoginData): Promise<AuthTokens> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await apiClient.postForm<AuthTokens>('/auth/token', formData);
    apiClient.setTokens(response.data);
    return response.data;
  },

  async register(userData: RegisterData): Promise<User> {
    const response = await apiClient.post<User>('/auth/create-user', userData);
    return response.data;
  },

  async verifyUser(email: string, otp: string): Promise<AuthTokens> {
    const response = await apiClient.post<AuthTokens>('/auth/verify-user', { email, otp });
    apiClient.setTokens(response.data);
    return response.data;
  },

  async resendOtp(email: string): Promise<void> {
    await apiClient.post('/auth/resend-otp', { email });
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/users/me');
    return response.data;
  },

  async updateUser(userData: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>('/auth/update-user', userData);
    return response.data;
  },

  async rateUser(userId: number, rating: number): Promise<void> {
    await apiClient.post(`/auth/rate-user/${userId}`, { rating });
  },

  logout() {
    apiClient.clearTokens();
  },

  isAuthenticated(): boolean {
    const tokens = localStorage.getItem('auth_tokens');
    return !!tokens;
  }
};