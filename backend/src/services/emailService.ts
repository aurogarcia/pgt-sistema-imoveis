import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  data: any;
}

// Configurar transportador de email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Templates de email
const emailTemplates = {
  welcome: {
    subject: 'Bem-vindo ao Sistema PGT',
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2c5530;">Bem-vindo ao Sistema PGT!</h1>
        <p>Olá, ${data.fullName}!</p>
        <p>Sua conta foi criada com sucesso no Sistema de Gestão de Imóveis Rurais e Urbanos.</p>
        <p>Agora você pode:</p>
        <ul>
          <li>Cadastrar imóveis rurais e urbanos</li>
          <li>Gerar diagnósticos automatizados com IA</li>
          <li>Acompanhar processos de regularização</li>
          <li>Acessar relatórios IRTR</li>
        </ul>
        <p>Para começar, acesse sua conta e explore as funcionalidades.</p>
        <p>Se precisar de ajuda, nossa IA está disponível 24/7 para esclarecer dúvidas.</p>
        <hr>
        <p style="font-size: 12px; color: #666;">Sistema PGT - Gestão de Imóveis</p>
      </div>
    `
  },
  
  user_type_changed: {
    subject: 'Alteração no seu perfil - Sistema PGT',
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2c5530;">Perfil Atualizado</h1>
        <p>Olá, ${data.fullName}!</p>
        <p>Seu tipo de usuário foi alterado para: <strong>${data.newUserType}</strong></p>
        <p>Esta alteração pode afetar suas permissões no sistema.</p>
        <p>Se você não solicitou esta alteração, entre em contato conosco imediatamente.</p>
        <hr>
        <p style="font-size: 12px; color: #666;">Sistema PGT - Gestão de Imóveis</p>
      </div>
    `
  },
  
  account_deactivated: {
    subject: 'Conta desativada - Sistema PGT',
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #d32f2f;">Conta Desativada</h1>
        <p>Olá, ${data.fullName}!</p>
        <p>Sua conta no Sistema PGT foi desativada.</p>
        <p>Se você acredita que isso é um erro, entre em contato com o suporte.</p>
        <hr>
        <p style="font-size: 12px; color: #666;">Sistema PGT - Gestão de Imóveis</p>
      </div>
    `
  },
  
  diagnostic_ready: {
    subject: 'Diagnóstico Pronto - Sistema PGT',
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2c5530;">Diagnóstico Concluído</h1>
        <p>Olá, ${data.fullName}!</p>
        <p>O diagnóstico do seu imóvel <strong>${data.propertyName}</strong> foi concluído.</p>
        <p><strong>Status:</strong> ${data.status}</p>
        <p><strong>Pontuação de Conformidade:</strong> ${data.complianceScore}%</p>
        <p>Acesse sua conta para visualizar os detalhes completos e recomendações.</p>
        <hr>
        <p style="font-size: 12px; color: #666;">Sistema PGT - Gestão de Imóveis</p>
      </div>
    `
  }
};

// Função para enviar email
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const template = emailTemplates[options.template as keyof typeof emailTemplates];
    
    if (!template) {
      throw new Error(`Template de email '${options.template}' não encontrado`);
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Sistema PGT <noreply@pgt-system.com>',
      to: options.to,
      subject: options.subject || template.subject,
      html: template.html(options.data)
    };

    const info = await transporter.sendMail(mailOptions);
    
    logger.info('Email enviado com sucesso', {
      to: options.to,
      subject: options.subject,
      template: options.template,
      messageId: info.messageId
    });
    
  } catch (error) {
    logger.error('Erro ao enviar email', {
      to: options.to,
      subject: options.subject,
      template: options.template,
      error: error
    });
    throw error;
  }
};

// Verificar conexão SMTP
export const verifyEmailConnection = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    logger.info('✅ Conexão SMTP verificada com sucesso');
    return true;
  } catch (error) {
    logger.error('❌ Erro na conexão SMTP:', error);
    return false;
  }
};

// Verificar conexão na inicialização
verifyEmailConnection();