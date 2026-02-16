# 🏡 PGT - Sistema de Gestão de Imóveis Rurais e Urbanos

![Status](https://img.shields.io/badge/status-funcional-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18+-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue)

Sistema completo para gestão e regularização de imóveis rurais e urbanos, com integração de IA para diagnósticos automatizados.

## ✨ Funcionalidades

### 🏗️ Backend
- 🔐 **Autenticação JWT**: Sistema seguro com bcryptjs
- 🗄️ **PostgreSQL 16**: Banco de dados robusto e escalável
- 🏠 **Gestão de Imóveis**: CRUD completo para propriedades rurais e urbanas
- 🤖 **IA Integrada**: Diagnósticos automatizados e chat inteligente
- 📊 **Dashboard**: Métricas comparativas (RJ vs ES)
- 📄 **Relatórios IRTR**: Geração automática de relatórios
- 📁 **Upload de Documentos**: Gerenciamento de arquivos
- 🔍 **Sistema de Auditoria**: Logs detalhados e conformidade LGPD

### 🎨 Frontend
- ⚛️ **React + TypeScript**: Interface moderna e tipada
- 🎨 **Material-UI**: Design system profissional
- 📱 **Responsivo**: Funciona em desktop, tablet e mobile
- 🔄 **Estado Global**: Context API para gerenciamento
- 🚀 **Vite**: Build rápido e hot reload

## Tecnologias Utilizadas

### Backend
- **Node.js** com **Express** e **TypeScript**
- **PostgreSQL** com extensão PostGIS
- **JWT** para autenticação
- **OpenAI API** para IA
- **Nodemailer** para emails
- **Winston** para logs
- **Joi** para validação

### Frontend
- **React** com **TypeScript**
- **Material-UI (MUI)** para interface
- **React Query** para gerenciamento de estado
- **React Router** para navegação
- **Axios** para requisições HTTP
- **React Leaflet** para mapas
- **Recharts** para gráficos

### Banco de Dados
- **PostgreSQL 15+**
- **PostGIS** para dados geoespaciais
- **UUID** para chaves primárias
- **JSONB** para dados flexíveis

## Funcionalidades Principais

### 🌾 Imóveis Rurais
- Cadastro completo com geolocalização
- Integração com CAR, SIGEF, SNCR, CAFIR
- Controle de áreas (produtiva, APP, reserva legal)
- Acompanhamento de licenças ambientais

### 🏢 Imóveis Urbanos  
- Cadastro para REURB (Lei 13.465/2017)
- Modalidades Social e Específica
- Controle de infraestrutura urbana
- Integração com cadastros municipais

### 🤖 IA Integrada
- Diagnósticos automatizados
- Chat especializado 24/7
- Análise de conformidade legal
- Recomendações personalizadas

### 📈 Relatórios e Analytics
- Relatórios IRTR automatizados
- Comparativos entre estados (RJ vs ES)
- Dashboards interativos
- Métricas de conformidade

### 🔒 Segurança e Compliance
- Autenticação JWT segura
- Logs de auditoria (LGPD)
- Controle de acesso por perfil
- Criptografia de dados sensíveis

## Estrutura do Projeto

```
pgt-system/
├── backend/                 # API Node.js/Express
│   ├── src/
│   │   ├── controllers/    # Controladores da API
│   │   ├── middleware/     # Middlewares (auth, validation, etc.)
│   │   ├── models/         # Modelos de dados
│   │   ├── routes/         # Definição das rotas
│   │   ├── services/       # Lógica de negócio
│   │   └── utils/          # Utilitários (database, logger, etc.)
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/               # Interface React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── services/       # Serviços de API
│   │   ├── hooks/          # Hooks customizados
│   │   ├── contexts/       # Contextos React
│   │   ├── types/          # Tipos TypeScript
│   │   └── utils/          # Utilitários frontend
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── database/               # Schema e migrações
│   └── schema.sql         # Schema completo do PostgreSQL
└── README.md              # Este arquivo
```

## Configuração e Instalação

### Pré-requisitos
- Node.js 18+
- PostgreSQL 15+ com PostGIS
- Conta OpenAI (para IA)
- SMTP configurado (para emails)

### 1. Clonar o Repositório
```bash
git clone <repository-url>
cd pgt-system
```

### 2. Configurar Banco de Dados
```sql
-- Criar banco de dados
CREATE DATABASE pgt_database;

-- Executar schema
\i database/schema.sql
```

### 3. Configurar Backend
```bash
cd backend
npm install

# Copiar e configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Executar em desenvolvimento
npm run dev
```

### 4. Configurar Frontend
```bash
cd frontend
npm install

# Executar em desenvolvimento
npm run dev
```

### 5. Variáveis de Ambiente (.env)

**Backend:**
```env
# Banco de Dados
DATABASE_URL=postgresql://username:password@localhost:5432/pgt_database

# JWT
JWT_SECRET=seu_jwt_secret_muito_seguro

# OpenAI
OPENAI_API_KEY=sk-...

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
```

**Frontend:**
```env
VITE_API_URL=http://localhost:3001
```

## Scripts Disponíveis

### Backend
- `npm run dev` - Desenvolvimento com hot reload
- `npm run build` - Build de produção
- `npm run start` - Executar build de produção
- `npm run test` - Executar testes
- `npm run lint` - Verificar código

### Frontend
- `npm run dev` - Desenvolvimento com Vite
- `npm run build` - Build de produção
- `npm run preview` - Preview do build
- `npm run lint` - Verificar código

## Uso da Aplicação

### 1. Acesso Inicial
- Acesse `http://localhost:3000`
- Crie uma conta ou faça login
- Complete seu perfil

### 2. Cadastro de Imóveis
- **Rurais:** Clique em "Imóveis Rurais" → "Novo Imóvel"
- **Urbanos:** Clique em "Imóveis Urbanos" → "Novo Imóvel"
- Preencha os dados obrigatórios
- Adicione coordenadas geográficas
- Faça upload de documentos

### 3. Diagnósticos com IA
- Selecione um imóvel
- Clique em "Gerar Diagnóstico"
- A IA analisará automaticamente
- Receba recomendações personalizadas

### 4. Chat com IA
- Acesse "Assistente IA" no menu
- Faça perguntas sobre regularização
- Obtenha respostas especializadas 24/7

### 5. Relatórios IRTR
- Acesse "Relatórios IRTR"
- Visualize cálculos automatizados
- Acompanhe prazos de pagamento
- Exporte relatórios em PDF

## Integrações Externas

### APIs Governamentais
- **SIGEF** - Sistema de Gestão Fundiária
- **SNCR** - Sistema Nacional de Cadastro Rural  
- **CAR** - Cadastro Ambiental Rural
- **CAFIR** - Cadastro de Imóveis Rurais
- **Cartórios** - Consulta de matrículas

### Serviços de Terceiros
- **OpenAI** - Inteligência Artificial
- **Email SMTP** - Notificações
- **Mapas** - OpenStreetMap/Leaflet

## Conformidade LGPD

O sistema está em conformidade com a LGPD através de:

- ✅ **Consentimento explícito** no cadastro
- ✅ **Logs de auditoria** de todas as operações
- ✅ **Criptografia** de dados sensíveis
- ✅ **Controle de acesso** granular
- ✅ **Retenção de dados** configurável
- ✅ **Direito ao esquecimento** implementado

## Deploy em Produção

### Usando Docker
```bash
# Build das imagens
docker-compose build

# Executar em produção
docker-compose up -d
```

### Usando PM2 (Node.js)
```bash
# Backend
cd backend
npm run build
pm2 start dist/app.js --name pgt-backend

# Frontend (build estático)
cd frontend
npm run build
# Servir com nginx ou similar
```

## Monitoramento e Logs

- **Winston** para logs estruturados
- **Logs de auditoria** para compliance
- **Health checks** em `/health`
- **Métricas** de performance

## Contribuição

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Suporte

Para suporte técnico:
- 📧 Email: suporte@pgt-system.com
- 💬 Chat: Disponível no sistema
- 📋 Issues: GitHub Issues

## Changelog

### v1.0.0 (2026-02-14)
- ✅ Sistema base implementado
- ✅ Autenticação JWT
- ✅ CRUD de imóveis rurais e urbanos
- ✅ Integração com IA
- ✅ Dashboard comparativo
- ✅ Conformidade LGPD

---

**Sistema PGT** - Transformando a gestão de imóveis no Brasil 🇧🇷