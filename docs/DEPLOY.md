# 🚀 Deploy do BusinessApp Web no Vercel

## Passo a Passo Completo

### 1. Preparar o Repositório no GitHub

```bash
# Adicionar todos os arquivos
git add .

# Fazer commit inicial
git commit -m "Initial commit - BusinessApp Web"

# Criar repositório no GitHub (https://github.com/new)
# Nome sugerido: businessapp-web

# Adicionar remote e fazer push
git remote add origin https://github.com/SEU-USUARIO/businessapp-web.git
git branch -M main
git push -u origin main
```

### 2. Deploy na Vercel

#### Opção A: Via Dashboard da Vercel (Recomendado)

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **"Add New..."** → **"Project"**
3. Importe o repositório `businessapp-web` do GitHub
4. Configure:
   - **Framework Preset**: Next.js (detectado automaticamente)
   - **Root Directory**: ./
   - **Build Command**: `npm run build` (padrão)
   - **Output Directory**: `.next` (padrão)

5. Adicione as **Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://oxakpxowhsldczxxtapi.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

6. Clique em **"Deploy"**
7. Aguarde 2-3 minutos ✅

#### Opção B: Via CLI da Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Para produção
vercel --prod
```

### 3. Configurar Domínio (Opcional)

1. Na Vercel, vá em **Settings** → **Domains**
2. Adicione seu domínio customizado
3. Configure DNS conforme instruções

Exemplo:
- `agendamento.businessapp.com.br`
- `agendar.businessapp.com.br`

### 4. Testar o Deploy

Após o deploy, teste com o slug de um estabelecimento:

```
https://seu-projeto.vercel.app/salaoemillyborges
https://seu-projeto.vercel.app/olimpo
```

### 5. Atualizar Link no App Mobile

No app mobile (BusinessApp), atualize a URL base:

```typescript
// Arquivo que gera links de compartilhamento
const BASE_URL = 'https://seu-projeto.vercel.app';
```

### 6. Deploy Automático

A partir de agora, todo push para `main` fará deploy automático! 🎉

```bash
# Fazer alterações
git add .
git commit -m "Melhoria X"
git push

# Vercel faz deploy automaticamente
```

## ⚠️ Troubleshooting

### Erro de Build

Se o build falhar:
1. Verifique se `package.json` tem o script `build`
2. Teste localmente: `npm run build`
3. Verifique logs na Vercel

### Variáveis de Ambiente

As mesmas credenciais do Supabase do app mobile:
- Não committar `.env.local` (já está no `.gitignore`)
- Configurar na Vercel Dashboard
- Mesmas chaves do projeto mobile

### Erro 404

Se slug não funcionar:
1. Verifique se o estabelecimento existe no Supabase
2. Verifique se `agendamento_online = true`
3. Verifique se `status = 'ativa'`

## 📊 Monitoramento

Na Vercel Dashboard você pode ver:
- 📈 Analytics de acesso
- 🐛 Logs de erro
- ⚡ Performance
- 🌍 Distribuição geográfica

## 🔒 Segurança

- ✅ Variáveis de ambiente protegidas
- ✅ RLS ativo no Supabase
- ✅ HTTPS automático
- ✅ Edge Functions na CDN global

---

**Pronto!** Seu sistema de agendamento está no ar 🚀
