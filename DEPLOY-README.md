# MedidaGeo - Sistema PGT

## 🚀 Deploy no GitHub Pages

Este projeto está configurado para deploy automático no GitHub Pages através do GitHub Actions.

### Como funciona

1. **Push para main**: Quando você faz push para a branch `main`, o GitHub Actions automaticamente:
   - Instala as dependências
   - Faz build do frontend com configuração para GitHub Pages
   - Faz deploy para o GitHub Pages

2. **URL de acesso**: Após o deploy, o site estará disponível em:
   ```
   https://[seu-usuario].github.io/PGT/
   ```

### Configurações importantes

- **Base URL**: Configurado para `/PGT/` (nome do repositório)
- **SPA Support**: Configurado com arquivo `404.html` para funcionamento correto do React Router
- **Assets**: `.nojekyll` configurado para funcionamento correto com Vite

### Scripts de build

```bash
# Desenvolvimento local
npm run dev

# Build para produção local
npm run build

# Build específico para GitHub Pages
npm run build:github
```

### Estrutura de deploy

```
├── .github/workflows/deploy.yml  # GitHub Actions config
├── frontend/
│   ├── public/
│   │   ├── .nojekyll              # Para GitHub Pages
│   │   └── 404.html               # SPA redirect
│   └── vite.config.ts             # Config do Vite
```

### Status

✅ **Configurado e pronto para deploy!**

Basta fazer push para `main` e aguardar o deploy automático.

---

**MedidaGeo** - Engenharia e Georreferenciamento  
Sistema PGT para gestão de propriedades rurais e urbanas