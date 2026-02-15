import { api } from './api';
import { RuralProperty, UrbanProperty, PaginatedResponse } from '../types';

interface PropertyFilters {
  page?: number;
  limit?: number;
  search?: string;
  state?: string;
  status?: string;
  propertyType?: string;
}

class PropertyService {
  // Propriedades Rurais
  async getRuralProperties(filters?: PropertyFilters): Promise<PaginatedResponse<RuralProperty>> {
    const response = await api.get('/rural-properties', { params: filters });
    return response.data;
  }

  async getRuralProperty(id: string): Promise<RuralProperty> {
    const response = await api.get(`/rural-properties/${id}`);
    return response.data;
  }

  async createRuralProperty(data: Omit<RuralProperty, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>): Promise<RuralProperty> {
    const response = await api.post('/rural-properties', data);
    return response.data;
  }

  async updateRuralProperty(id: string, data: Partial<RuralProperty>): Promise<RuralProperty> {
    const response = await api.put(`/rural-properties/${id}`, data);
    return response.data;
  }

  async deleteRuralProperty(id: string): Promise<void> {
    await api.delete(`/rural-properties/${id}`);
  }

  // Propriedades Urbanas
  async getUrbanProperties(filters?: PropertyFilters): Promise<PaginatedResponse<UrbanProperty>> {
    const response = await api.get('/urban-properties', { params: filters });
    return response.data;
  }

  async getUrbanProperty(id: string): Promise<UrbanProperty> {
    const response = await api.get(`/urban-properties/${id}`);
    return response.data;
  }

  async createUrbanProperty(data: Omit<UrbanProperty, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>): Promise<UrbanProperty> {
    const response = await api.post('/urban-properties', data);
    return response.data;
  }

  async updateUrbanProperty(id: string, data: Partial<UrbanProperty>): Promise<UrbanProperty> {
    const response = await api.put(`/urban-properties/${id}`, data);
    return response.data;
  }

  async deleteUrbanProperty(id: string): Promise<void> {
    await api.delete(`/urban-properties/${id}`);
  }
}

export const propertyService = new PropertyService();