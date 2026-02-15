import { api } from './api';
import { DashboardStats, StateComparison } from '../types';

class DashboardService {
  // Obter estatísticas do dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get('/dashboard/stats');
    return response.data;
  }

  // Obter comparação entre estados (RJ vs ES)
  async getStateComparison(): Promise<StateComparison[]> {
    const response = await api.get('/dashboard/state-comparison');
    return response.data;
  }

  // Obter atividade recente
  async getRecentActivity(limit: number = 10) {
    const response = await api.get(`/dashboard/recent-activity?limit=${limit}`);
    return response.data;
  }

  // Obter estatísticas por período
  async getStatsByPeriod(startDate: string, endDate: string) {
    const response = await api.get('/dashboard/stats-by-period', {
      params: { startDate, endDate }
    });
    return response.data;
  }
}

export const dashboardService = new DashboardService();