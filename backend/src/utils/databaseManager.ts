import { Pool } from 'pg';
import dotenv from 'dotenv';
import { logger } from './logger';

// Importar dados mock como fallback
import { 
  mockUsers, 
  mockRuralProperties, 
  mockUrbanProperties,
  mockDiagnostics,
  mockAIConversations,
  User,
  RuralProperty,
  UrbanProperty,
  Diagnostic,
  AIConversation
} from '../models';

dotenv.config();

const DATABASE_TYPE = process.env.DATABASE_TYPE || 'mock';

class DatabaseManager {
  private pool: Pool | null = null;
  private isConnected = false;

  constructor() {
    if (DATABASE_TYPE === 'postgresql') {
      this.initPostgreSQL();
    } else {
      logger.info('Usando dados mock (mock database)');
      this.isConnected = true;
    }
  }

  private async initPostgreSQL() {
    try {
      this.pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'pgt_database',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      // Testar conexão
      await this.pool.query('SELECT NOW()');
      this.isConnected = true;
      logger.info('✅ PostgreSQL conectado com sucesso');
    } catch (error) {
      logger.error('❌ Erro ao conectar PostgreSQL:', error);
      logger.warn('🔄 Caindo back para dados mock...');
      this.pool = null;
      this.isConnected = false;
    }
  }

  async query(text: string, params?: any[]): Promise<any> {
    if (this.pool && DATABASE_TYPE === 'postgresql') {
      try {
        const result = await this.pool.query(text, params);
        return result;
      } catch (error) {
        logger.error('Erro na query PostgreSQL:', error);
        throw error;
      }
    }

    // Fallback para mock data
    throw new Error('Mock database não suporta queries SQL diretas');
  }

  // Métodos para gerenciar usuários
  async getUsers(): Promise<User[]> {
    if (this.pool && DATABASE_TYPE === 'postgresql') {
      const result = await this.query('SELECT * FROM users ORDER BY created_at DESC');
      return result.rows;
    }
    return mockUsers;
  }

  async getUserById(id: string): Promise<User | null> {
    if (this.pool && DATABASE_TYPE === 'postgresql') {
      const result = await this.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0] || null;
    }
    return mockUsers.find(u => u.id === id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (this.pool && DATABASE_TYPE === 'postgresql') {
      const result = await this.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) return null;
      
      const row = result.rows[0];
      return {
        id: row.id,
        email: row.email,
        passwordHash: row.password_hash,
        fullName: row.full_name,
        cpfCnpj: row.cpf_cnpj,
        phone: row.phone,
        userType: row.user_type,
        isActive: row.is_active,
        emailVerified: row.email_verified,
        lastLogin: row.last_login?.toISOString(),
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString(),  
        dataProcessingConsent: row.data_processing_consent,
        consentDate: row.consent_date?.toISOString(),
        dataRetentionDate: row.data_retention_date?.toISOString()
      };
    }
    return mockUsers.find(u => u.email === email) || null;
  }

  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    if (this.pool && DATABASE_TYPE === 'postgresql') {
      const result = await this.query(`
        INSERT INTO users (email, password_hash, full_name, cpf_cnpj, phone, user_type, is_active, email_verified, data_processing_consent, consent_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        user.email,
        user.passwordHash,
        user.fullName,
        user.cpfCnpj,
        user.phone,
        user.userType,
        user.isActive,
        user.emailVerified,
        user.dataProcessingConsent,
        user.consentDate
      ]);
      return result.rows[0];
    }

    // Mock implementation
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: user.email,
      passwordHash: user.passwordHash,
      fullName: user.fullName,
      cpfCnpj: user.cpfCnpj,
      phone: user.phone,
      userType: user.userType,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      lastLogin: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dataProcessingConsent: user.dataProcessingConsent,
      consentDate: user.consentDate,
      dataRetentionDate: null
    };
    
    mockUsers.push(newUser);
    return newUser;
  }

  // Métodos para propriedades rurais
  async getRuralProperties(ownerId?: string): Promise<RuralProperty[]> {
    if (this.pool && DATABASE_TYPE === 'postgresql') {
      const query = ownerId 
        ? 'SELECT * FROM rural_properties WHERE owner_id = $1 ORDER BY created_at DESC'
        : 'SELECT * FROM rural_properties ORDER BY created_at DESC';
      const params = ownerId ? [ownerId] : [];
      const result = await this.query(query, params);
      return result.rows;
    }
    
    return ownerId 
      ? mockRuralProperties.filter(p => p.ownerId === ownerId)
      : mockRuralProperties;
  }

  async getRuralPropertyById(id: string): Promise<RuralProperty | null> {
    if (this.pool && DATABASE_TYPE === 'postgresql') {
      const result = await this.query('SELECT * FROM rural_properties WHERE id = $1', [id]);
      return result.rows[0] || null;
    }
    return mockRuralProperties.find(p => p.id === id) || null;
  }

  async createRuralProperty(property: Omit<RuralProperty, 'id' | 'createdAt' | 'updatedAt'>): Promise<RuralProperty> {
    if (this.pool && DATABASE_TYPE === 'postgresql') {
      const result = await this.query(`
        INSERT INTO rural_properties (
          owner_id, property_name, property_type, total_area_hectares, productive_area_hectares,
          state, municipality, district, latitude, longitude, regularization_status,
          has_environmental_license, has_water_usage_grant, main_activity
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
      `, [
        property.ownerId, property.propertyName, property.propertyType,
        property.totalAreaHectares, property.productiveAreaHectares,
        property.state, property.municipality, property.district,
        property.coordinates?.latitude, property.coordinates?.longitude, property.regularizationStatus,
        property.hasEnvironmentalLicense, property.hasWaterUsageGrant, property.mainActivity
      ]);
      return result.rows[0];
    }

    // Mock implementation
    const newProperty: RuralProperty = {
      ...property,
      id: `rural-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockRuralProperties.push(newProperty);
    return newProperty;
  }

  // Métodos para propriedades urbanas
  async getUrbanProperties(ownerId?: string): Promise<UrbanProperty[]> {
    if (this.pool && DATABASE_TYPE === 'postgresql') {
      const query = ownerId 
        ? 'SELECT * FROM urban_properties WHERE owner_id = $1 ORDER BY created_at DESC'
        : 'SELECT * FROM urban_properties ORDER BY created_at DESC';
      const params = ownerId ? [ownerId] : [];
      const result = await this.query(query, params);
      return result.rows;
    }
    
    return ownerId 
      ? mockUrbanProperties.filter(p => p.ownerId === ownerId)
      : mockUrbanProperties;
  }

  async getUrbanPropertyById(id: string): Promise<UrbanProperty | null> {
    if (this.pool && DATABASE_TYPE === 'postgresql') {
      const result = await this.query('SELECT * FROM urban_properties WHERE id = $1', [id]);
      return result.rows[0] || null;
    }
    return mockUrbanProperties.find(p => p.id === id) || null;
  }

  // Métodos para diagnósticos
  async getDiagnostics(propertyId?: string): Promise<Diagnostic[]> {
    return mockDiagnostics;
  }

  // Métodos para conversas IA
  async getAIConversations(userId: string): Promise<AIConversation[]> {
    return mockAIConversations.filter((c: AIConversation) => c.userId === userId);
  }

  getDatabaseType(): string {
    return DATABASE_TYPE;
  }

  isUsingPostgreSQL(): boolean {
    return DATABASE_TYPE === 'postgresql' && this.isConnected;
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.isConnected = false;
      logger.info('Conexão PostgreSQL fechada');
    }
  }
}

// Singleton instance
export const db = new DatabaseManager();
export default db;