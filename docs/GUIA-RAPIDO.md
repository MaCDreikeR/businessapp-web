# 🚀 Guia Rápido - Criar Repositório e Deploy

## 1️⃣ Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Preencha:
   - **Repository name**: `businessapp-web`
   - **Description**: Sistema de agendamento online do BusinessApp
   - **Visibility**: Private (ou Public, como preferir)
   - ❌ **NÃO** marque "Add a README file"
   - ❌ **NÃO** adicione .gitignore (já temos)
   - ❌ **NÃO** escolha license ainda

3. Clique em **"Create repository"**

## 2️⃣ Conectar Repositório Local ao GitHub

```bash
# Adicionar remote (substitua SEU-USUARIO pelo seu usuário do GitHub)
git remote add origin https://github.com/SEU-USUARIO/businessapp-web.git

# Renomear branch para main (se necessário)
git branch -M main

# Push inicial
git push -u origin main
```

**Exemplo com seu usuário:**
```bash
git remote add origin https://github.com/joaosilva/businessapp-web.git
git branch -M main
git push -u origin main
```

## 3️⃣ Deploy na Vercel

### Via Dashboard (Mais Fácil)

1. Acesse: https://vercel.com
2. Clique em **"Add New..."** → **"Project"**
3. **Import Git Repository**
4. Selecione `businessapp-web`
5. Em **Environment Variables**, adicione:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
   (Copie de `.env.local`)

6. Clique em **"Deploy"**
7. ✅ Pronto em ~2 minutos!

### Via CLI (Alternativa)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel

# Seguir instruções interativas
```

## 4️⃣ Após Deploy

A Vercel fornecerá uma URL, exemplo:
```
https://businessapp-web.vercel.app
```

**Testar:**
```
https://businessapp-web.vercel.app/salaoemillyborges
https://businessapp-web.vercel.app/olimpo
```

## 5️⃣ Próximos Commits

```bash
# Fazer alterações no código
# Adicionar
git add .

# Commit
git commit -m "Descrição da alteração"

# Push (deploy automático!)
git push
```

## ⚡ Comandos Úteis

```bash
# Ver status
git status

# Ver histórico
git log --oneline

# Ver remote configurado
git remote -v

# Criar nova branch
git checkout -b feature/nova-funcionalidade

# Merge
git checkout main
git merge feature/nova-funcionalidade
git push
```

## 📝 Checklist

- [ ] Repositório criado no GitHub
- [ ] Remote configurado localmente
- [ ] Push realizado com sucesso
- [ ] Projeto importado na Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado
- [ ] Teste com slug real funcionando
- [ ] Deploy automático ativo

---

**Dúvidas?** Consulte [DEPLOY.md](./DEPLOY.md) para guia completo.
