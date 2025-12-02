# 🔄 Fluxo Completo da Aplicação LinkFlow SaaS

## 📋 Visão Geral

Este documento descreve o fluxo completo desde a landing page até o acesso e uso da plataforma LinkFlow SaaS.

---

## 🎯 Fluxo Atual (Estado Atual da Aplicação)

### 1️⃣ **Landing Page / Página Inicial**
**Status:** ⚠️ Não implementada ainda

**O que deveria ter:**
- Página de apresentação do produto
- Planos e preços
- Botão "Começar Agora" / "Assinar"
- Formulário de cadastro básico

**O que existe atualmente:**
- `/` → Redireciona para `/dashboard/grupos` (requer autenticação)
- `/login` → Página de login

**Arquivo:** `src/app/page.tsx` (apenas redireciona)

---

### 2️⃣ **Checkout / Compra**
**Status:** ⚠️ Integração com AbacatePay em progresso

**Fluxo ideal (a implementar):**

```
Landing Page → Selecionar Plano → Formulário de Cadastro → 
Checkout AbacatePay → Webhook de Confirmação → Criação Automática
```

**O que existe atualmente:**
- Estrutura no banco de dados para armazenar:
  - `abacatepay_customer_id`
  - `abacatepay_subscription_id`
  - `plan_type` (monthly/annual)
  - `subscription_status` (trial/active/canceled/past_due)

**Tabelas relacionadas:**
- `redirect.companies` - Armazena dados da empresa e IDs do AbacatePay
- `redirect.subscriptions` - Detalhes da assinatura
- `redirect.subscription_plans` - Planos disponíveis
- `redirect.tenant_limits` - Limites por plano

**APIs existentes:**
- `POST /api/admin/companies` - Criar empresa (requer autenticação admin)
- `POST /api/admin/users` - Criar usuário (requer autenticação admin)

**O que falta:**
- Página de checkout
- Integração com API do AbacatePay
- Webhook para receber confirmação de pagamento
- Criação automática de empresa + usuário após pagamento

---

### 3️⃣ **Criação de Conta (Atual - Manual)**

**Fluxo atual:**

#### Opção A: Via Admin Panel
1. Admin acessa `/admin/empresas`
2. Cria nova empresa via `POST /api/admin/companies`
3. Cria usuário via `POST /api/admin/users`
4. Usuário recebe credenciais

#### Opção B: Via API Direta (futuro)
```
POST /api/auth/signup
Body: {
  name: "Nome da Empresa",
  slug: "empresa-slug",
  email: "usuario@email.com",
  password: "senha123",
  plan_type: "monthly"
}
```

**Status:** ⚠️ Endpoint `/api/auth/signup` mencionado no RPD mas não implementado

---

### 4️⃣ **Login**

**Fluxo:**

1. **Usuário acessa:** `/login`
2. **Preenche formulário:**
   - Email
   - Senha
3. **Submete:** `POST /api/auth/login`
4. **Backend:**
   - Busca usuário no banco (`redirect.users`)
   - Valida senha (atualmente comparação direta - precisa bcrypt)
   - Gera JWT token
   - Define cookie `auth-token` (httpOnly, 7 dias)
5. **Redirecionamento:** `/dashboard/grupos`

**Arquivo:** `src/app/api/auth/login/route.ts`

**Autenticação:**
- JWT token armazenado em cookie `auth-token`
- Token contém: `sub`, `email`, `name`, `company_id`, `role`
- Validação via `getAuthUser()` em todas as rotas protegidas

---

### 5️⃣ **Dashboard / Acesso ao Sistema**

**Após login bem-sucedido:**

#### 5.1 Dashboard Principal
- **Rota:** `/dashboard/grupos` (redirecionamento padrão)
- **Conteúdo:**
  - Lista de grupos de WhatsApp
  - Cards com métricas rápidas
  - Botão para criar novo grupo
  - Links públicos para cada grupo

#### 5.2 Gestão de Grupos
- **Rota:** `/dashboard/grupos`
- **Funcionalidades:**
  - Criar grupo (`POST /api/groups`)
  - Editar grupo (`PUT /api/groups/[id]`)
  - Excluir grupo (`DELETE /api/groups/[id]`)
  - Ver link público: `/l/{slug}`
  - Ver estatísticas do grupo

**Validações:**
- Verifica limite do plano (`tenant_limits.max_groups`)
- Valida slug único
- Filtra por `company_id` automaticamente

#### 5.3 Gestão de Números
- **Rota:** `/dashboard/numeros`
- **Funcionalidades:**
  - Adicionar número ao grupo (`POST /api/numbers`)
  - Editar número (`PUT /api/numbers/[id]`)
  - Ativar/desativar número
  - Mensagem customizada por número

**Validações:**
- Verifica se grupo pertence à empresa
- Associa `company_id` automaticamente

#### 5.4 Relatórios
- **Rota:** `/dashboard/relatorios`
- **Funcionalidades:**
  - Estatísticas por grupo
  - Gráficos de cliques
  - Filtros por período
  - Distribuição por dispositivo

**APIs:**
- `GET /api/group-stats` - Estatísticas por grupo
- `POST /api/stats/filtered` - Estatísticas filtradas

---

### 6️⃣ **Uso do Link Público**

**Fluxo quando alguém clica no link:**

1. **Cliente acessa:** `https://seudominio.com/l/{slug}`
   - Exemplo: `https://linkflow.com/l/vendas`

2. **Backend processa:** `GET /api/redirect/[slug]`
   - Busca grupo pelo `slug`
   - Verifica se grupo está ativo
   - Busca próximo número disponível (rotação round-robin)
   - Atualiza `last_used_at` do número
   - Registra clique em `redirect.clicks`
   - Monta mensagem final: `default_message` + `custom_message`

3. **Redirecionamento:**
   - Gera link WhatsApp: `https://wa.me/{phone}?text={mensagem}`
   - Redireciona para WhatsApp

**Arquivo:** `src/app/api/redirect/[slug]/route.ts`

**Dados coletados:**
- IP address
- User agent
- Device type (mobile/desktop/tablet)
- Referrer
- Timestamp

---

## 🚀 Fluxo Ideal (A Implementar)

### 1. Landing Page
```
/ → Landing Page com:
  - Apresentação do produto
  - Planos e preços
  - Botão "Começar Agora"
```

### 2. Checkout
```
/checkout → Formulário:
  - Dados da empresa (nome, slug)
  - Dados do usuário (nome, email, senha)
  - Seleção de plano
  - Integração AbacatePay
```

### 3. Webhook AbacatePay
```
POST /api/webhooks/abacatepay → Recebe confirmação:
  - Cria empresa automaticamente
  - Cria usuário owner
  - Cria subscription
  - Cria tenant_limits
  - Envia email de boas-vindas
```

### 4. Primeiro Acesso
```
Email de boas-vindas → Link de ativação →
Login → Onboarding → Dashboard
```

---

## 📊 Estrutura de Dados

### Empresa (Company)
```typescript
{
  id: UUID
  name: "Minha Empresa"
  slug: "minha-empresa" // único
  abacatepay_customer_id: "cus_xxx"
  abacatepay_subscription_id: "sub_xxx"
  plan_type: "monthly" | "annual"
  subscription_status: "trial" | "active" | "canceled" | "past_due"
}
```

### Usuário (User)
```typescript
{
  id: UUID
  email: "usuario@email.com" // único
  name: "João Silva"
  company_id: UUID // FK para companies
  role: "owner" | "member"
  password_hash: "hash_bcrypt"
  is_active: true
}
```

### Grupo (Group)
```typescript
{
  id: UUID
  company_id: UUID
  name: "Vendas"
  slug: "vendas" // único globalmente
  default_message: "Olá! Vim através do link..."
  is_active: true
}
```

### Número WhatsApp
```typescript
{
  id: UUID
  company_id: UUID
  group_id: UUID
  phone: "5511999999999"
  name: "João - Vendas"
  custom_message: "Fale comigo!"
  is_active: true
  last_used_at: timestamp
}
```

---

## 🔐 Segurança e Isolamento

### Multi-tenancy
- Todas as queries filtram por `company_id`
- RLS (Row Level Security) habilitado
- JWT contém `company_id` do usuário
- Validação em todas as APIs

### Autenticação
- JWT token em cookie httpOnly
- Validação em todas as rotas protegidas
- Fallback para Supabase Auth (mencionado no RPD)

---

## 📝 Endpoints Principais

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/signup` - ⚠️ Não implementado ainda

### Grupos
- `GET /api/groups` - Listar grupos
- `POST /api/groups` - Criar grupo
- `GET /api/groups/[id]` - Detalhes do grupo
- `PUT /api/groups/[id]` - Atualizar grupo
- `DELETE /api/groups/[id]` - Excluir grupo

### Números
- `GET /api/numbers` - Listar números
- `POST /api/numbers` - Criar número
- `PUT /api/numbers/[id]` - Atualizar número
- `DELETE /api/numbers/[id]` - Excluir número

### Redirecionamento
- `GET /l/[slug]` - Link público (redireciona para API)
- `GET /api/redirect/[slug]` - Processa redirecionamento

### Analytics
- `GET /api/group-stats` - Estatísticas por grupo
- `POST /api/stats/filtered` - Estatísticas filtradas

### Admin
- `GET /api/admin/companies` - Listar empresas
- `POST /api/admin/companies` - Criar empresa
- `GET /api/admin/users` - Listar usuários
- `POST /api/admin/users` - Criar usuário
- `GET /api/admin/stats` - Estatísticas gerais

---

## 🎯 Próximos Passos para Completar o Fluxo

1. **Landing Page** (`/`)
   - Página de apresentação
   - Planos e preços
   - Call-to-action

2. **Página de Checkout** (`/checkout`)
   - Formulário de cadastro
   - Integração AbacatePay
   - Processamento de pagamento

3. **Webhook AbacatePay** (`/api/webhooks/abacatepay`)
   - Receber confirmação de pagamento
   - Criar empresa + usuário automaticamente
   - Enviar email de boas-vindas

4. **Endpoint de Signup** (`/api/auth/signup`)
   - Criar conta sem passar pelo admin
   - Validações de email/slug
   - Hash de senha com bcrypt

5. **Onboarding** (`/onboarding`)
   - Tutorial inicial
   - Criar primeiro grupo
   - Adicionar primeiro número

6. **Email de Boas-vindas**
   - Template de email
   - Link de ativação
   - Instruções de uso

---

## 📌 Observações Importantes

1. **Autenticação atual:** Comparação direta de senha (precisa bcrypt)
2. **Checkout:** Não implementado - precisa integração AbacatePay
3. **Landing Page:** Não existe - apenas redireciona para dashboard
4. **Signup:** Não implementado - criação manual via admin
5. **Webhooks:** Não implementado - precisa para automação

---

**Última atualização:** 02/12/2025

