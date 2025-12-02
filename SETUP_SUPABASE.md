# 🔧 Configuração do Supabase - LinkFlow SaaS

## 📋 Informações do Projeto

- **Project ID:** `okneoxrybknrrawiaopn`
- **Project Name:** `linkflowsaas`
- **Status:** `ACTIVE_HEALTHY`
- **Database Host:** `db.okneoxrybknrrawiaopn.supabase.co`

## 🔑 Como Obter as Chaves do Supabase

1. **Acesse o Dashboard:**
   ```
   https://supabase.com/dashboard/project/okneoxrybknrrawiaopn/settings/api
   ```

2. **Copie as seguintes chaves:**
   - **Project URL:** `https://okneoxrybknrrawiaopn.supabase.co`
   - **anon public key:** Chave pública (pode ser exposta no frontend)
   - **service_role key:** Chave privada (NUNCA exponha no frontend!)

3. **Configure no arquivo `.env.local`:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://okneoxrybknrrawiaopn.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
   SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
   JWT_SECRET=sua_chave_secreta_min_32_caracteres
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

## 🗄️ Estrutura do Banco de Dados

### Schema: `redirect`

**Tabelas Principais:**
- ✅ `companies` - Empresas/Tenants (26 registros)
- ✅ `users` - Usuários (20 registros)
- ✅ `groups` - Grupos de WhatsApp (16 registros)
- ✅ `whatsapp_numbers` - Números WhatsApp (12 registros)
- ✅ `clicks` - Analytics de cliques (414 registros)
- ✅ `subscriptions` - Assinaturas
- ✅ `subscription_plans` - Planos de assinatura
- ✅ `tenant_limits` - Limites por tenant
- ✅ `team_invites` - Convites de equipe
- ✅ `custom_domains` - Domínios customizados

### Tipos de Dados

**Planos (`plan_type`):**
- `monthly` - Plano mensal
- `annual` - Plano anual
- `null` - Free/Trial

**Status de Assinatura (`subscription_status`):**
- `trial` - Em período de teste
- `active` - Ativo
- `canceled` - Cancelado
- `past_due` - Pagamento pendente

**Roles de Usuário (`role`):**
- `owner` - Proprietário
- `member` - Membro

## 🔒 Segurança

- ✅ RLS (Row Level Security) habilitado em todas as tabelas
- ✅ Filtros explícitos por `company_id` em todas as queries
- ✅ Service role key apenas no backend (nunca expor no cliente)

## 📊 Dados Atuais

- **26 empresas** cadastradas
- **20 usuários** ativos
- **16 grupos** criados
- **12 números** WhatsApp
- **414 cliques** registrados

## 🚀 Próximos Passos

1. Configure as variáveis de ambiente no `.env.local`
2. Configure as mesmas variáveis na Vercel (Settings → Environment Variables)
3. Teste a conexão localmente: `npm run dev`
4. Faça deploy na Vercel

## 🔗 Links Úteis

- Dashboard Supabase: https://supabase.com/dashboard/project/okneoxrybknrrawiaopn
- API Settings: https://supabase.com/dashboard/project/okneoxrybknrrawiaopn/settings/api
- Database: https://supabase.com/dashboard/project/okneoxrybknrrawiaopn/editor
- Logs: https://supabase.com/dashboard/project/okneoxrybknrrawiaopn/logs

