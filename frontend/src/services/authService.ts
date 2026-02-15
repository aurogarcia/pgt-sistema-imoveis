import { api } from './api';
import { User, LoginData, RegisterData, AuthResponse } from '../types';

class AuthService {
  // Login de usuário
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    return response.data;
  }

  // Registro de usuário
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    return response.data;
  }

  // Logout
  async logout(): Promise<void> {
    await api.post('/auth/logout');
  }

  // Obter perfil do usuário logado
  async getProfile(): Promise<User> {
    const response = await api.get('/auth/profile');
    return response.data;
  }

  // Renovar token de acesso
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: string }> {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  }

  // Atualizar perfil do usuário
  async updateProfile(data: Partial<User>): Promise<void> {
    await api.put('/users/profile', data);
  }

  // Alterar senha
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/users/change-password', {
      currentPassword,
      newPassword
    });
  }

  // Desativar conta
  async deactivateAccount(): Promise<void> {
    await api.delete('/users/deactivate');
  }
}

export const authService = new AuthService();