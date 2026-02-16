# Sistema de Gestão de Imóveis Rurais e Urbanos

Este é um sistema completo para gestão e regularização de imóveis rurais e urbanos, com integração de IA para diagnósticos automatizados.

## Tecnologias Utilizadas

- **Backend**: Node.js, Express, TypeScript
- **Frontend**: React, TypeScript, Material-UI
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT
- **IA**: OpenAI API para diagnósticos e chat
- **Integração**: APIs do SIGEF, SNCR, CAR, CAFIR

## Estrutura do Projeto

```
pgt-system/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeds/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
├── database/
│   └── schema.sql
└── docs/
    └── api.md
```

## Funcionalidades Principais

### Backend API
- Autenticação segura com JWT
- CRUD completo para imóveis rurais e urbanos
- Integração com APIs externas governamentais
- Sistema de diagnósticos automatizados com IA
- Chat bot para suporte sobre regularização

### Frontend Dashboard
- Interface responsiva e intuitiva
- Dashboard com métricas comparativas (RJ vs ES)
- Formulários de cadastro de imóveis
- Visualização de relatórios IRTR
- Chat integrado com IA

### Banco de Dados
- Tabelas estruturadas para usuários, imóveis e relatórios
- Relacionamentos otimizados
- Conformidade com LGPD

## Comandos de Desenvolvimento

- `npm run dev:backend` - Iniciar backend em modo desenvolvimento
- `npm run dev:frontend` - Iniciar frontend em modo desenvolvimento
- `npm run build` - Build de produção
- `npm run test` - Executar testes
- `npm run migrate` - Executar migrações do banco

## Configuração

1. Configure as variáveis de ambiente no arquivo `.env`
2. Execute as migrações do banco de dados
3. Inicie os serviços de desenvolvimento

## Compliance e Segurança

- Implementação conforme LGPD
- Autenticação segura JWT/OAuth
- Proteção de dados sensíveis
- Logs de auditoria