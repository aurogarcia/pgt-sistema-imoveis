import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Criar diretório de logs se não existir
const logDir = process.env.LOG_FILE_PATH || './logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Configuração dos formatos
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    return log;
  })
);

// Configuração do logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'pgt-backend' },
  transports: [
    // Arquivo para todos os logs
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Arquivo específico para erros
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Console em desenvolvimento
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.Console({
        format: consoleFormat
      })
    ] : [])
  ],
});

// Função para log de auditoria LGPD
export const auditLog = (action: string, userId: string | null, resourceType: string, resourceId: string | null, details: any, ipAddress?: string) => {
  logger.info('AUDIT_LOG', {
    action,
    userId,
    resourceType,
    resourceId,
    details,
    ipAddress,
    timestamp: new Date().toISOString()
  });
};

export { logger };