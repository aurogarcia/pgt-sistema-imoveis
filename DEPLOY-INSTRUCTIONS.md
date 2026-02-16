# 🚀 Instruções para Criar Repositório no GitHub

## Passos para hospedar no GitHub:

### 1. Criar repositório no GitHub
1. Acesse: https://github.com/new
2. Nome do repositório: `pgt-sistema-imoveis` (ou o nome que preferir)
3. Descrição: "Sistema completo para gestão de imóveis rurais e urbanos com IA"
4. Marque como **Público** (para usar GitHub Pages gratuito)
5. **NÃO** marque "Add a README file" (já temos)
6. Clique em "Create repository"

### 2. Conectar repositório local ao GitHub
Após criar o repositório, execute no terminal:

```bash
# Adicionar remote origin
git remote add origin https://github.com/SEU_USUARIO/pgt-sistema-imoveis.git

# Push inicial
git branch -M main
git push -u origin main
```

### 3. Configurar GitHub Pages (apenas frontend)
1. No seu repositório, vá em Settings > Pages
2. Source: Deploy from a branch
3. Branch: main / docs (vamos criar)
4. Salvar

### 4. Preparar build do frontend para GitHub Pages
Execute estes comandos:

```bash
# Instalar gh-pages
cd frontend
npm install --save-dev gh-pages

# Build de produção
npm run build

# Copiar build para docs/
cd ..
mkdir docs
cp -r frontend/dist/* docs/

# Commit da build
git add docs/
git commit -m "📦 Build do frontend para GitHub Pages"
git push origin main
```

## 🌐 Opções de Hospedagem Completa (Backend + Frontend + Database)

### Opção 1: Railway (Recomendado)
1. Acesse: https://railway.app
2. Conecte com GitHub
3. Deploy do repositório
4. Adicione PostgreSQL add-on
5. Configure variáveis de ambiente

### Opção 2: Render  
1. Acesse: https://render.com
2. Conecte repositório GitHub
3. Crie Web Service para backend
4. Crie PostgreSQL database
5. Configure variáveis de ambiente

### Opção 3: Vercel + Supabase
1. **Frontend**: Deploy no Vercel
2. **Backend**: Vercel Functions
3. **Database**: Supabase PostgreSQL

### Opção 4: Heroku (Pago)
```bash
# Instalar Heroku CLI
# Criar app
heroku create pgt-sistema

# Adicionar PostgreSQL
heroku addons:create heroku-postgresql:mini

# Deploy
git push heroku main
```

## 📋 Checklist Pré-Deploy

- [ ] README.md atualizado
- [ ] .env.example criado com variáveis necessárias
- [ ] Variáveis sensíveis no .gitignore
- [ ] Build do frontend testado
- [ ] Testes básicos funcionando
- [ ] Configurações de produção no package.json

## 🔧 Scripts de Deploy Automático

Vamos criar scripts para facilitar o deploy:

### package.json (raiz)
```json
{
  "scripts": {
    "deploy:frontend": "cd frontend && npm run build && cd .. && rm -rf docs && cp -r frontend/dist docs && git add docs && git commit -m '📦 Deploy frontend' && git push",
    "deploy:railway": "git push railway main",
    "start:prod": "cd backend && npm run build && npm start"
  }
}
```

## 🚀 Próximos Passos

1. Criar repositório no GitHub seguindo instruções acima
2. Escolher plataforma de hospedagem (Railway recomendado)  
3. Configurar CI/CD opcional
4. Monitorar logs e performance
5. Configurar domínio customizado (opcional)

---

🎯 **Escolha Railway para deploy completo mais fácil!**