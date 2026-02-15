# 🎯 Como Fazer Push para o GitHub

## 1. **Criar Repositório no GitHub**

1. Acesse: https://github.com
2. Clique em "**New repository**" (botão verde +)
3. Nome sugerido: `sistema-pgt` ou `pgt-gestao-imoveis`
4. Descrição: "Sistema de Gestão de Imóveis Rurais e Urbanos com IA"
5. **Deixe PÚBLICO** para mostrar no portfólio
6. **NÃO** marque "Add README" (já temos um)
7. Clique "**Create repository**"

## 2. **Conectar e Fazer Push**

No terminal (dentro da pasta PGT), execute:

```bash
# Adicionar origem remota (substitua [SEU-USUARIO] pelo seu usuário GitHub)
git remote add origin https://github.com/[SEU-USUARIO]/sistema-pgt.git

# Fazer push inicial
git branch -M main
git push -u origin main
```

### Exemplo com usuário real:
```bash
git remote add origin https://github.com/joaosilva/sistema-pgt.git
git push -u origin main
```

## 3. **Se Pedir Autenticação**

**Opção 1 - Personal Access Token:**
1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Marque: `repo`, `workflow`, `write:packages`
4. Use este token como senha

**Opção 2 - GitHub CLI:**
```bash
# Instalar GitHub CLI (se não tiver)
winget install GitHub.cli

# Autenticar
gh auth login
```

## 4. **Verificar no GitHub**

Após o push, acesse seu repositório em:
`https://github.com/[SEU-USUARIO]/sistema-pgt`

Você deve ver:
- ✅ Todos os arquivos do projeto
- ✅ README.md bem formatado
- ✅ 62 arquivos commitados
- ✅ Estrutura completa frontend/backend

## 5. **Para Commits Futuros**

```bash
# Adicionar mudanças
git add .

# Fazer commit
git commit -m "feat: nova funcionalidade implementada"

# Enviar para GitHub
git push
```

## 🎉 **Resultado Final**

Seu projeto estará no GitHub com:
- 📁 Código completo e organizado
- 📋 README profissional
- 🏷️ Histórico de commits
- 🔄 Pronto para colaboração
- 💼 Excelente para portfólio!

---
**Status Atual:** Repositório Git criado localmente ✅
**Próximo Passo:** Criar repositório no GitHub e fazer push 🚀