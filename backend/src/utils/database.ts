import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';
import { logger } from './logger';

dotenv.config();

class Database {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'pgt_database',
      user: process.env.DB_USER || 'username',
      password: process.env.DB_PASSWORD || 'password',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.pool.on('error', (err) => {
      logger.error('Erro na pool de conexões PostgreSQL:', err);
    });

    this.pool.on('connect', () => {
      logger.info('Nova conexão estabelecida com PostgreSQL');
    });
  }

  async query(text: string, params?: any[]): Promise<any> {
    const start = Date.now();
    try {
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      logger.debug('Query executada', {
        query: text,
        duration: `${duration}ms`,
        rows: res.rowCount
      });
      return res;
    } catch (error) {
      const duration = Date.now() - start;
      logger.error('Erro na execução da query', {
        query: text,
        duration: `${duration}ms`,
        error: error
      });
      throw error;
    }
  }

  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.query('SELECT NOW()');
      logger.info('✅ Conexão com banco de dados estabelecida com sucesso');
      return true;
    } catch (error) {
      logger.error('❌ Erro ao conectar com banco de dados:', error);
      return false;
    }
  }

  async end(): Promise<void> {
    await this.pool.end();
    logger.info('Pool de conexões PostgreSQL finalizada');
  }
}

const db = new Database();

// Testar conexão na inicialização
db.testConnection();

export default db;