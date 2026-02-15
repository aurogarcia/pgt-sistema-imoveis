import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';

// Configurar URL base da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Criar instância do axios
const api: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com respostas e erros
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Se o erro é 401 e não é uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('refreshToken');
        
        if (refreshToken) {
          // Tentar renovar o token
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refreshToken
          });

          const { accessToken } = response.data;
          
          // Atualizar cookie
          Cookies.set('accessToken', accessToken, {
            expires: 1,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
          });

          // Tentar novamente a requisição original
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token inválido, fazer logout
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        
        // Redirecionar para login se não estivermos já lá
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
          toast.error('Sessão expirada. Faça login novamente.');
        }
      }
    }

    // Tratar outros tipos de erro
    if (error.response?.status >= 500) {
      toast.error('Erro interno do servidor. Tente novamente mais tarde.');
    } else if (error.response?.status === 403) {
      toast.error('Acesso negado. Você não tem permissão para esta ação.');
    } else if (error.code === 'NETWORK_ERROR') {
      toast.error('Erro de conexão. Verifique sua internet.');
    }

    return Promise.reject(error);
  }
);

export { api };
export default api;