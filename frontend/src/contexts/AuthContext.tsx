import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { User, LoginData, RegisterData, AuthResponse } from '../types';
import { authService } from '../services/authService';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData | User, tokens?: any) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar token armazenado ao inicializar
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = Cookies.get('accessToken');
        if (token) {
          const userData = await authService.getProfile();
          setUser(userData);
        }
      } catch (error) {
        // Token inválido, remover cookies
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (data: LoginData | User, tokens?: any) => {
    try {
      setLoading(true);
      
      // Se recebeu dados de usuário diretamente (mock login)
      if ('id' in data && tokens) {
        // Armazenar tokens nos cookies
        Cookies.set('accessToken', tokens.accessToken, {
          expires: 1, // 1 dia
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        
        Cookies.set('refreshToken', tokens.refreshToken, {
          expires: 7, // 7 dias
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });

        setUser(data as User);
        toast.success(`Bem-vindo, ${(data as User).fullName}!`);
        return;
      }
      
      // Login normal via API
      const response: AuthResponse = await authService.login(data as LoginData);
      
      // Armazenar tokens nos cookies
      Cookies.set('accessToken', response.tokens.accessToken, {
        expires: 1, // 1 dia
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      Cookies.set('refreshToken', response.tokens.refreshToken, {
        expires: 7, // 7 dias
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      setUser(response.user);
      toast.success(`Bem-vindo, ${response.user.fullName}!`);
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao fazer login';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      const response: AuthResponse = await authService.register(data);
      
      // Armazenar tokens nos cookies
      Cookies.set('accessToken', response.tokens.accessToken, {
        expires: 1, // 1 dia
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      Cookies.set('refreshToken', response.tokens.refreshToken, {
        expires: 7, // 7 dias
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      setUser(response.user);
      toast.success(`Conta criada com sucesso! Bem-vindo, ${response.user.fullName}!`);
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao criar conta';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      // Chamar API de logout (opcional, para logs de auditoria)
      authService.logout().catch(() => {
        // Ignorar erros na API de logout
      });
    } catch (error) {
      // Ignorar erros
    } finally {
      // Limpar estado local e cookies
      setUser(null);
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      toast.success('Logout realizado com sucesso');
    }
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}