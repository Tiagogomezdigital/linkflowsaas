# ⚙️ Configuração do LinkFlow SaaS

## 🔗 Conexão com Supabase

A aplicação está configurada para usar o projeto Supabase **linkflowsaas**.

### Informações do Projeto Supabase

- **Project ID:** `okneoxrybknrrawiaopn`
- **Project Name:** `linkflowsaas`
- **Database Host:** `db.okneoxrybknrrawiaopn.supabase.co`
- **Status:** `ACTIVE_HEALTHY`

### Variáveis de Ambiente Necessárias

Crie um arquivo `.env.local` na raiz do projeto com:

```env
# Supabase - Projeto linkflowsaas
NEXT_PUBLIC_SUPABASE_URL=https://okneoxrybknrrawiaopn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui

# JWT Secret (mínimo 32 caracteres)
JWT_SECRET=sua_chave_secreta_min_32_caracteres_aqui

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Como Obter as Chaves

1. Acesse: https://supabase.com/dashboard/project/okneoxrybknrrawiaopn/settings/api
2. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (mantenha secreto!)

### Configuração na Vercel

Ao fazer deploy na Vercel, configure as mesmas variáveis:

1. Acesse: https://vercel.com/dashboard
2. Vá em: Settings → Environment Variables
3. Adicione todas as variáveis acima
4. Para produção, atualize `NEXT_PUBLIC_APP_URL` com a URL da Vercel

## 🗄️ Schema do Banco

A aplicação usa o schema `redirect` no Supabase com as seguintes tabelas:

- `redirect.companies` - Empresas/Tenants
- `redirect.users` - Usuários
- `redirect.groups` - Grupos de WhatsApp
- `redirect.whatsapp_numbers` - Números WhatsApp
- `redirect.clicks` - Analytics de cliques
- `redirect.subscriptions` - Assinaturas
- `redirect.subscription_plans` - Planos
- `redirect.tenant_limits` - Limites por tenant
- `redirect.team_invites` - Convites
- `redirect.custom_domains` - Domínios customizados

## ✅ Verificação

A aplicação já está configurada para:
- ✅ Usar schema `redirect` por padrão
- ✅ Filtrar por `company_id` em todas as queries
- ✅ Usar RLS (Row Level Security)
- ✅ Service role apenas no backend

## 📊 Dados Existentes

O banco já possui dados reais:
- 26 empresas
- 20 usuários
- 16 grupos
- 12 números WhatsApp
- 414 cliques registrados

