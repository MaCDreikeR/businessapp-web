# BusinessApp Web - Agendamento Online

Sistema de agendamento online para o BusinessApp. Página pública onde clientes podem agendar serviços usando um link único por estabelecimento.

## 🎯 Sobre o Projeto

Este é o **frontend web público** do BusinessApp, construído com **Next.js 15** (App Router) e hospedado na **Vercel**. 

Cada estabelecimento cadastrado no app mobile possui um **slug único** que gera uma URL pública para agendamento:

```
https://seudominio.com/salaoemillyborges
https://seudominio.com/olimpo
https://seudominio.com/thamaraestrias
```

## 🏗️ Stack Tecnológica

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + RLS)
- **Autenticação**: Supabase Auth (Google + Apple - opcional)
- **Hospedagem**: Vercel

## 📋 Pré-requisitos

- Node.js 18+
- npm/yarn/pnpm
- Conta Supabase (mesma do app mobile)
- Conta Vercel (para deploy)

## ⚙️ Instalação e Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie as credenciais do Supabase (as MESMAS do projeto mobile):

```bash
cp .env.local.example .env.local
```

Edite `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publica-aqui
```

### 3. Executar localmente

```bash
npm run dev
```

Acesse: `http://localhost:3000/[slug-do-estabelecimento]`
- `https://seudominio.com/agendar/salaoemillyborges`
- `https://seudominio.com/agendar/olimpo`
- `https://seudominio.com/agendar/thamaraestrias`

### Fluxo do Cliente

1. Cliente acessa o link compartilhado
2. Sistema busca estabelecimento pelo slug
3. Verifica se agendamento online está ativo
4. Exibe formulário com serviços disponíveis
5. Cliente preenche dados e confirma
6. Recebe confirmação por WhatsApp

### Integração com Mobile

- **Mesma base de dados**: Compartilha o Supabase com o app mobile
- **Toggle ON/OFF**: Gerenciado no app mobile (tela Agendamento Online)
- **Slugs únicos**: Gerados automaticamente no cadastro do estabelecimento
- **Status da conta**: Só permite agendamento se conta estiver ativa

## 🏗️ Estrutura do Projeto

```
businessapp-web/
├── app/
│   ├── agendar/
│   │   └── [slug]/
│   │       ├── page.tsx       # Página de agendamento
│   │       └── not-found.tsx  # 404 para slug inválido
│   ├── page.tsx               # Home com instruções
│   └── layout.tsx             # Layout raiz
├── lib/
│   ├── supabase.ts            # Cliente Supabase
│   └── types.ts               # Tipos TypeScript
└── .env.local                 # Variáveis de ambiente
```

## 🎨 Recursos

- ✅ Design responsivo (mobile-first)
- ✅ Validação de formulário
- ✅ Integração com WhatsApp
- ✅ Página 404 customizada
- ✅ SEO otimizado
- ✅ Verificação de status da conta
- ✅ Toggle de agendamento online
- ⏳ Seleção de serviços dinâmica (em desenvolvimento)
- ⏳ Horários disponíveis por data (em desenvolvimento)
- ⏳ Confirmação por e-mail (em desenvolvimento)

## 🚢 Deploy na Vercel

### 1. Criar novo projeto na Vercel

```bash
# Instalar Vercel CLI (opcional)
npm i -g vercel

# Fazer deploy
vercel
```

### 2. Configurar variáveis de ambiente na Vercel

No dashboard da Vercel:
1. Vá em **Settings** → **Environment Variables**
2. Adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Conectar ao GitHub

1. Push para o GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/seu-usuario/businessapp-web.git
git push -u origin main
```

2. Na Vercel, importe o repositório
3. Deploy automático a cada push!

## 🔗 Links Úteis

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 📝 Próximos Passos

- [ ] Implementar busca de serviços do Supabase
- [ ] Implementar horários disponíveis dinâmicos
- [ ] Adicionar validação de telefone (máscara)
- [ ] Implementar envio de agendamento
- [ ] Adicionar página de sucesso
- [ ] Adicionar loading states
- [ ] Implementar analytics
- [ ] Adicionar testes automatizados
- [ ] Configurar domínio customizado

## 🤝 Relação com o App Mobile

Este projeto é complementar ao BusinessApp (React Native + Expo):
- **Compartilha o mesmo Supabase**
- **Usa os mesmos slugs gerados no mobile**
- **Respeita as configurações definidas no mobile**
- **Mantém histórico sincronizado de agendamentos**

---

Desenvolvido com ❤️ para o BusinessApp
