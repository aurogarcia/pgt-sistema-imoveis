import { Request, Response, NextFunction } from 'express';
import { auditLog } from '../utils/logger';
import db from '../utils/database';

// Middleware para log de auditoria LGPD
export const auditLogger = async (req: Request, res: Response, next: NextFunction) => {
  // Capturar dados da requisição
  const originalSend = res.send;
  const startTime = Date.now();
  
  let responseBody: any;
  let resourceId: string | null = null;
  let resourceType: string = 'unknown';
  
  // Interceptar resposta para capturar dados
  res.send = function(data: any) {
    responseBody = data;
    return originalSend.call(this, data);
  };

  // Determinar tipo de recurso baseado na URL
  if (req.path.includes('/users')) resourceType = 'user';
  else if (req.path.includes('/rural-properties')) resourceType = 'rural_property';
  else if (req.path.includes('/urban-properties')) resourceType = 'urban_property';
  else if (req.path.includes('/diagnostics')) resourceType = 'diagnostic';
  else if (req.path.includes('/irtr')) resourceType = 'irtr_report';
  else if (req.path.includes('/files')) resourceType = 'file';
  else if (req.path.includes('/auth')) resourceType = 'auth';
  
  // Extrair ID do recurso da URL
  const pathParts = req.path.split('/');
  const lastPart = pathParts[pathParts.length - 1];
  if (lastPart && /^[a-f\d]{8}(-[a-f\d]{4}){4}[a-f\d]{8}$/i.test(lastPart)) {
    resourceId = lastPart;
  }
  
  // Interceptar fim da resposta para fazer o log
  res.on('finish', async () => {
    const duration = Date.now() - startTime;
    const shouldLog = shouldAuditRequest(req, res);
    
    if (shouldLog) {
      try {
        const auditData = {
          method: req.method,
          url: req.path,
          statusCode: res.statusCode,
          duration,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString()
        };

        // Determinar ação baseada no método HTTP e status
        let action = getActionFromRequest(req.method, res.statusCode, req.path);
        
        // Salvar no banco de dados (desabilitado temporariamente para dados mock)
        // await db.query(
        //   `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address, user_agent) 
        //    VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        //   [
        //     req.user?.id || null,
        //     action,
        //     resourceType,
        //     resourceId,
        //     auditData,
        //     req.ip,
        //     req.get('User-Agent')
        //   ]
        // );
        
        // Mock log para desenvolvimento
        console.log('Audit Log (Mock):', {
          userId: req.user?.id || null,
          action,
          resourceType,
          resourceId,
          details: auditData,
          ip: req.ip
        });
        
        // Log também via Winston para backup
        auditLog(
          action,
          req.user?.id || null,
          resourceType,
          resourceId,
          auditData,
          req.ip
        );
        
      } catch (error) {
        console.error('Erro ao salvar log de auditoria:', error);
      }
    }
  });

  next();
};

// Função para determinar se deve fazer auditoria
const shouldAuditRequest = (req: Request, res: Response): boolean => {
  // Sempre auditar operações de autenticação
  if (req.path.includes('/auth')) return true;
  
  // Sempre auditar operações de escrita (POST, PUT, DELETE, PATCH)
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) return true;
  
  // Auditar acesso a dados sensíveis (GET com autenticação)
  if (req.method === 'GET' && req.user) return true;
  
  // Auditar erros 4xx e 5xx
  if (res.statusCode >= 400) return true;
  
  return false;
};

// Função para determinar ação baseada no método e status
const getActionFromRequest = (method: string, statusCode: number, path: string): string => {
  // Ações de autenticação
  if (path.includes('/auth/login')) {
    return statusCode === 200 ? 'login_success' : 'login_failed';
  }
  
  if (path.includes('/auth/logout')) {
    return 'logout';
  }
  
  if (path.includes('/auth/register')) {
    return statusCode === 201 ? 'register_success' : 'register_failed';
  }
  
  // Ações baseadas no método HTTP
  switch (method) {
    case 'POST':
      return statusCode === 201 ? 'create' : 'create_failed';
    case 'GET':
      return statusCode === 200 ? 'read' : 'read_failed';
    case 'PUT':
    case 'PATCH':
      return statusCode === 200 ? 'update' : 'update_failed';
    case 'DELETE':
      return statusCode === 200 ? 'delete' : 'delete_failed';
    default:
      return 'unknown';
  }
};